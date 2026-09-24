import { createClient as _createClient } from "@kagii/openauth/client";
import { COOKIE_NAME } from "..";
import { createCookieContent } from "../utils";

type ClientFactoryOptions = {
	clientID: string;
	issuer: string;
	copyID?: string | null;
};

export function requestUrl(input: RequestInfo | URL): string {
	if (typeof input === "string") {
		return input;
	}
	if (input instanceof URL) {
		return input.toString();
	}
	if (typeof Request !== "undefined" && input instanceof Request) {
		return input.url;
	}
	return String(input);
}

export function isDiscoveryUrl(url: string): boolean {
	try {
		const path = new URL(url).pathname;
		return (
			path.includes("/.well-known/oauth-authorization-server") ||
			path.includes("/.well-known/openid-configuration") ||
			path.includes("/.well-known/jwks.json") ||
			path.endsWith("/jwks.json")
		);
	} catch {
		return false;
	}
}

function isAbsoluteHttp(value: string): boolean {
	return value.startsWith("http://") || value.startsWith("https://");
}

function withClientId(raw: string, clientID: string): string {
	const url = new URL(raw);
	url.searchParams.set("client_id", clientID);
	return url.toString();
}

async function discoveryDocumentIsUsable(response: Response): Promise<boolean> {
	if (!response.ok) return false;
	try {
		const body = (await response.clone().json()) as {
			jwks_uri?: unknown;
			keys?: unknown;
		};
		if (!body || typeof body !== "object") return false;
		if ("keys" in body) return Array.isArray(body.keys);
		if ("jwks_uri" in body) return typeof body.jwks_uri === "string" && isAbsoluteHttp(body.jwks_uri);
		return false;
	} catch {
		return false;
	}
}

const fetcher = ({
	clientID,
	issuer,
	copyID,
}: {
	clientID: string;
	issuer: string;
	copyID?: string | null;
}) => {
	return async (input: RequestInfo | URL, init?: RequestInit) => {
		const raw = requestUrl(input);
		if (isDiscoveryUrl(raw) || !isAbsoluteHttp(raw)) {
			const discoveryUrl = isDiscoveryUrl(raw)
				? raw
				: new URL("/.well-known/jwks.json", issuer).toString();
			const plain = await fetch(discoveryUrl, init);
			if (await discoveryDocumentIsUsable(plain)) return plain;
			return fetch(withClientId(discoveryUrl, clientID), init);
		}

		const headers = new Headers(init?.headers || {});
		const url = new URL(raw);
		url.searchParams.set("client_id", clientID);
		if (copyID) {
			url.searchParams.set("copy_id", copyID);
		}

		headers.append(
			"Cookie",
			createCookieContent(COOKIE_NAME, clientID, { path: "/" }),
		);

		return await fetch(url.toString(), {
			...init,
			headers,
			credentials: "include",
		});
	};
};

export const createClient = ({
	clientID,
	issuer,
	copyID,
}: ClientFactoryOptions) =>
	_createClient({
		clientID,
		issuer,
		fetch: fetcher({ clientID, issuer, copyID }),
	});

export function createServerClient({
	clientID,
	issuer,
	request,
	copyID,
}: ClientFactoryOptions & {
	request: Request;
}) {
	const url = new URL(request.url);
	const resolvedClientID = url.searchParams.get("client_id") || clientID;
	const resolvedCopyID = url.searchParams.get("copy_id") ?? copyID ?? null;

	return _createClient({
		clientID: resolvedClientID,
		issuer,
		fetch: fetcher({
			clientID: resolvedClientID,
			issuer,
			copyID: resolvedCopyID,
		}),
	});
}
