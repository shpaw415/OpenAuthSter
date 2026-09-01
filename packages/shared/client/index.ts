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

const fetcher = ({
	clientID,
	copyID,
}: {
	clientID: string;
	copyID?: string | null;
}) => {
	return async (input: RequestInfo | URL, init?: RequestInit) => {
		const raw = requestUrl(input);
		if (isDiscoveryUrl(raw)) {
			return fetch(input, init);
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
		fetch: fetcher({ clientID, copyID }),
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
		fetch: fetcher({ clientID: resolvedClientID, copyID: resolvedCopyID }),
	});
}
