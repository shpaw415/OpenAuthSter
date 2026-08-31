import type { Project, ProjectData } from "./index.ts";

export type ClientType = "confidential" | "public";

export function getProjectClientType(project: Project): ClientType {
	const data = project.projectData as ProjectData | undefined;
	return data?.clientType === "public" ? "public" : "confidential";
}

export function getProjectRedirectURIs(project: Project): string[] {
	const data = project.projectData as ProjectData | undefined;
	const extra = data?.redirectURIs ?? [];
	const fromOrigin = (project.originURL ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);
	return [...new Set([...fromOrigin, ...extra])];
}

export function isAllowedRedirectURI(project: Project, uri: string): boolean {
	return getProjectRedirectURIs(project).includes(uri);
}

export function isPublicClient(project: Project): boolean {
	return getProjectClientType(project) === "public";
}
