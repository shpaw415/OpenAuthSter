import { POST as createNewProject, GET as getProjects } from "@api/projects";
import {
	DELETE as deleteProjectById,
	GET as getProjectById,
	PUT as updateProjectById,
	type updateProjectParams,
} from "@api/projects/manage";
import type { Project, ProviderConfig } from "openauth-webui-shared-types";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";
import { useAuth } from "./useAuth";

const PROJECTS_CACHE_KEY = "all";
const projectsCache = createServerCache<Project[]>();
const projectCache = createServerCache<Project>();

function upsertProject(projects: Project[], nextProject: Project) {
	const existingIndex = projects.findIndex(
		(project) => project.clientID === nextProject.clientID,
	);

	if (existingIndex === -1) {
		return [...projects, nextProject];
	}

	return projects.map((project) =>
		project.clientID === nextProject.clientID ? nextProject : project,
	);
}

function syncProject(project: Project) {
	projectCache.set(project.clientID, project);
	projectsCache.update(PROJECTS_CACHE_KEY, (currentProjects) =>
		upsertProject(currentProjects ?? [], project),
	);
}

function syncProjects(projects: Project[]) {
	projectsCache.set(PROJECTS_CACHE_KEY, projects);
	for (const project of projects) {
		projectCache.set(project.clientID, project);
	}
}

function removeProjectFromCache(clientID: string) {
	projectCache.clear(clientID);
	projectsCache.update(PROJECTS_CACHE_KEY, (currentProjects) =>
		(currentProjects ?? []).filter((project) => project.clientID !== clientID),
	);
}

export function useProjects() {
	const projects = useServerCacheValue(projectsCache, PROJECTS_CACHE_KEY) ?? [];
	const [isLoading, setIsLoading] = useState(
		() => projectsCache.getSnapshot(PROJECTS_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);
	const auth = useAuth();

	const fetchProjects = useCallback(
		async (force = true) => {
			if (!auth.isAuthenticated && process.env.NODE_ENV !== "development") {
				setIsLoading(false);
				return;
			}

			if (
				force ||
				projectsCache.getSnapshot(PROJECTS_CACHE_KEY) === undefined
			) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await projectsCache.fetch(
					PROJECTS_CACHE_KEY,
					async () => {
						const response = await getProjects();
						if (!response.success) {
							throw new Error("Failed to fetch projects");
						}
						return response.data || [];
					},
					{ force },
				);
				syncProjects(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		},
		[auth.isAuthenticated],
	);

	useEffect(() => {
		if (!auth.isLoaded) return;
		void fetchProjects(false);
	}, [fetchProjects, auth.isLoaded]);

	const createProject = useCallback(async (name: string) => {
		const res = await createNewProject({ name });

		if (!res.success) {
			throw new Error(res.error || "Failed to create project");
		}

		syncProject(res.data as Project);
	}, []);

	const deleteProject = useCallback(async (clientID: string) => {
		const res = await deleteProjectById({ clientID });

		if (!res.success) {
			throw new Error(res.error || "Failed to delete project");
		}

		removeProjectFromCache(clientID);
	}, []);

	return {
		projects,
		isLoading,
		error,
		fetchProjects,
		createProject,
		deleteProject,
	};
}

export function useProject(clientID: string = "") {
	const project = useServerCacheValue(projectCache, clientID) ?? null;
	const [isLoading, setIsLoading] = useState(
		() => Boolean(clientID) && projectCache.getSnapshot(clientID) === undefined,
	);
	const [error, setError] = useState<string | null>(null);
	const [isProjectOwner, setIsProjectOwner] = useState(false);
	const auth = useAuth();

	useEffect(() => {
		if (auth.userMeta.id) {
			setIsProjectOwner(project?.owner_id === auth.userMeta.id);
		}
	}, [auth?.userMeta?.id, project]);

	const fetchProject = useCallback(
		async (force = true) => {
			if (!clientID) {
				setIsLoading(false);
				return;
			}

			if (force || projectCache.getSnapshot(clientID) === undefined) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await projectCache.fetch(
					clientID,
					async () => {
						const response = await getProjectById({ clientID });
						if (!response.success) {
							throw new Error(response.error || "Failed to fetch project");
						}
						if (!response.data) {
							throw new Error("Project data is undefined");
						}
						return response.data;
					},
					{ force },
				);
				syncProject(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		},
		[clientID],
	);

	useEffect(() => {
		void fetchProject(false);
	}, [fetchProject]);

	const updateProject = async (updates: updateProjectParams["data"]) => {
		const { success, error, data } = await updateProjectById({
			clientID,
			data: updates,
		});

		if (!success) {
			throw new Error(error || "Failed to update project");
		}

		if (data) {
			syncProject(data);
			return;
		}

		await fetchProject(true);
	};

	const updateProviders = async (providers: ProviderConfig[]) => {
		await updateProject({ providers_data: providers });
	};

	const updateProvider = async (updatedProvider: ProviderConfig) => {
		if (!project) {
			throw new Error("Project not loaded");
		}
		if (
			!project.providers_data?.find(
				(provider) => provider.type === updatedProvider.type,
			)
		) {
			await updateProject({
				providers_data: [
					...(project.providers_data as ProviderConfig[]),
					updatedProvider,
				],
			});
		} else {
			const updatedProviders = project.providers_data.map((provider) =>
				provider.type === updatedProvider.type ? updatedProvider : provider,
			);
			await updateProject({ providers_data: updatedProviders });
		}
	};

	return {
		project,
		isLoading,
		error,
		fetchProject,
		updateProject,
		updateProviders,
		updateProvider,
		isProjectOwner,
	};
}
