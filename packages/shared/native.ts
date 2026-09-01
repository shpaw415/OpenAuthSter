import type { Project, ProjectData } from "./index.ts";

export type ClientType = "confidential" | "public";

export function getProjectClientType(project: Project): ClientType {
	const data = project.projectData as ProjectData | undefined;
	return data?.clientType === "public" ? "public" : "confidential";
}

export function getProjectOriginURLs(project: Project): string[] {
	return (project.originURL ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);
}

export function getProjectRedirectURIs(project: Project): string[] {
	const data = project.projectData as ProjectData | undefined;
	const extra = data?.redirectURIs ?? [];
	return [...new Set([...getProjectOriginURLs(project), ...extra])];
}

const BLOCKED_SCHEMES = new Set([
	"javascript:",
	"data:",
	"file:",
	"vbscript:",
	"blob:",
	"about:",
]);

export function coerceUrl(value: string): URL | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed);
	} catch {
		try {
			return new URL(`https://${trimmed}`);
		} catch {
			return null;
		}
	}
}

function isHttpProtocol(protocol: string): boolean {
	return protocol === "http:" || protocol === "https:";
}

function normalizeRedirectHref(url: URL): string {
	const href = url.href;
	return href.endsWith("/") ? href.slice(0, -1) : href;
}

function isNativeRedirectAllowed(
	allowedEntries: string[],
	incoming: URL,
	uri: string,
): boolean {
	if (BLOCKED_SCHEMES.has(incoming.protocol.toLowerCase())) return false;
	const incomingHref = normalizeRedirectHref(incoming);
	return allowedEntries.some((entry) => {
		if (entry === uri) return true;
		const allowed = coerceUrl(entry);
		if (!allowed || isHttpProtocol(allowed.protocol)) return false;
		if (BLOCKED_SCHEMES.has(allowed.protocol.toLowerCase())) return false;
		return normalizeRedirectHref(allowed) === incomingHref;
	});
}

export function isOriginAllowed(
	allowedOrigins: string[],
	candidate: string,
): boolean {
	const incoming = coerceUrl(candidate);
	if (!incoming) return false;

	return allowedOrigins.some((entry) => {
		const allowed = coerceUrl(entry);
		if (!allowed) return false;
		if (allowed.origin === incoming.origin) return true;
		if (!allowed.hostname.startsWith("*.")) return false;
		if (allowed.protocol !== incoming.protocol) return false;
		const suffix = allowed.hostname.slice(1);
		return (
			incoming.hostname.endsWith(suffix) &&
			incoming.hostname !== allowed.hostname.slice(2)
		);
	});
}

export function isAllowedRedirectURI(project: Project, uri: string): boolean {
	const incoming = coerceUrl(uri);
	if (!incoming) return false;
	if (BLOCKED_SCHEMES.has(incoming.protocol.toLowerCase())) return false;

	const extra =
		(project.projectData as ProjectData | undefined)?.redirectURIs ?? [];
	if (extra.includes(uri)) {
		return true;
	}

	if (
		(incoming.hostname === "localhost" || incoming.hostname === "127.0.0.1") &&
		incoming.protocol === "http:"
	) {
		return true;
	}

	if (!isHttpProtocol(incoming.protocol)) {
		return isNativeRedirectAllowed(
			getProjectRedirectURIs(project),
			incoming,
			uri,
		);
	}

	return isOriginAllowed(getProjectOriginURLs(project), incoming.origin);
}

export function isPublicClient(project: Project): boolean {
	return getProjectClientType(project) === "public";
}
