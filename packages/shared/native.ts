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
	const extra =
		(project.projectData as ProjectData | undefined)?.redirectURIs ?? [];
	if (extra.includes(uri)) {
		return true;
	}

	const incoming = coerceUrl(uri);
	if (!incoming) return false;

	if (
		(incoming.hostname === "localhost" || incoming.hostname === "127.0.0.1") &&
		incoming.protocol === "http:"
	) {
		return true;
	}

	if (!["http:", "https:"].includes(incoming.protocol)) {
		return extra.includes(uri);
	}

	return isOriginAllowed(getProjectOriginURLs(project), incoming.origin);
}

export function isPublicClient(project: Project): boolean {
	return getProjectClientType(project) === "public";
}
