import {
	type CreateCopyTemplateParams,
	POST as createNewCopyTemplate,
	GET as getCopyTemplates,
} from "@api/templates/copy";
import {
	DELETE as deleteCopyTemplateByName,
	GET as getCopyTemplateByName,
	type UpdateCopyTemplateParams,
	PUT as updateCopyTemplateByName,
} from "@api/templates/copy/id";
import type { parseDBCopyTemplate } from "openauth-webui-shared-types";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

type CopyTemplate = ReturnType<typeof parseDBCopyTemplate>;

const COPY_TEMPLATES_CACHE_KEY = "all";
const copyTemplatesCache = createServerCache<CopyTemplate[]>();
const copyTemplateCache = createServerCache<CopyTemplate>();

function upsertTemplate(templates: CopyTemplate[], nextTemplate: CopyTemplate) {
	const existingIndex = templates.findIndex(
		(template) => template.name === nextTemplate.name,
	);

	if (existingIndex === -1) {
		return [...templates, nextTemplate];
	}

	return templates.map((template) =>
		template.name === nextTemplate.name ? nextTemplate : template,
	);
}

function syncTemplate(template: CopyTemplate) {
	copyTemplateCache.set(template.name, template);
	copyTemplatesCache.update(COPY_TEMPLATES_CACHE_KEY, (currentTemplates) =>
		upsertTemplate(currentTemplates ?? [], template),
	);
}

function syncTemplates(templates: CopyTemplate[]) {
	copyTemplatesCache.set(COPY_TEMPLATES_CACHE_KEY, templates);
	for (const template of templates) {
		copyTemplateCache.set(template.name, template);
	}
}

function removeTemplateFromCache(name: string) {
	copyTemplateCache.clear(name);
	copyTemplatesCache.update(COPY_TEMPLATES_CACHE_KEY, (currentTemplates) =>
		(currentTemplates ?? []).filter((template) => template.name !== name),
	);
}

export function useCopyTemplates() {
	const templates =
		useServerCacheValue(copyTemplatesCache, COPY_TEMPLATES_CACHE_KEY) ?? [];
	const [isLoading, setIsLoading] = useState(
		() =>
			copyTemplatesCache.getSnapshot(COPY_TEMPLATES_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchTemplates = useCallback(async (force = true) => {
		if (
			force ||
			copyTemplatesCache.getSnapshot(COPY_TEMPLATES_CACHE_KEY) === undefined
		) {
			setIsLoading(true);
		}
		setError(null);
		try {
			const data = await copyTemplatesCache.fetch(
				COPY_TEMPLATES_CACHE_KEY,
				async () => {
					const result = await getCopyTemplates();
					if (!result.success) {
						throw new Error(result.error || "Failed to fetch copy templates");
					}
					return result.data || [];
				},
				{ force },
			);
			syncTemplates(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchTemplates(false);
	}, [fetchTemplates]);

	const createTemplate = useCallback(
		async (params: CreateCopyTemplateParams) => {
			const res = await createNewCopyTemplate(params);

			if (!res.success) {
				throw new Error(res.error || "Failed to create copy template");
			}

			const template = res.data as ReturnType<typeof parseDBCopyTemplate>;
			syncTemplate(template);
			return template;
		},
		[],
	);

	const deleteTemplate = useCallback(async (name: string) => {
		const res = await deleteCopyTemplateByName({ name });

		if (!res.success) {
			throw new Error(res.error || "Failed to delete copy template");
		}

		removeTemplateFromCache(name);
	}, []);

	return {
		templates,
		isLoading,
		error,
		fetchTemplates,
		createTemplate,
		deleteTemplate,
	};
}

export function useCopyTemplate(name: string = "") {
	const template = useServerCacheValue(copyTemplateCache, name) ?? null;
	const [isLoading, setIsLoading] = useState(
		() => Boolean(name) && copyTemplateCache.getSnapshot(name) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchTemplate = useCallback(
		async (force = true) => {
			if (!name) {
				setIsLoading(false);
				return;
			}
			if (force || copyTemplateCache.getSnapshot(name) === undefined) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await copyTemplateCache.fetch(
					name,
					async () => {
						const result = await getCopyTemplateByName({ name });
						if (!result.success) {
							throw new Error(result.error || "Failed to fetch copy template");
						}
						if (!result.data) {
							throw new Error("Copy template data is undefined");
						}
						return result.data;
					},
					{ force },
				);
				syncTemplate(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		},
		[name],
	);

	useEffect(() => {
		void fetchTemplate(false);
	}, [fetchTemplate]);

	const updateTemplate = async (
		updates: UpdateCopyTemplateParams["data"],
	): Promise<CopyTemplate> => {
		const { success, error, data } = await updateCopyTemplateByName({
			name,
			data: updates,
		});

		if (!success) {
			throw new Error(error || "Failed to update copy template");
		}

		const template = data as CopyTemplate;
		syncTemplate(template);
		return template;
	};

	return {
		template,
		isLoading,
		error,
		fetchTemplate,
		updateTemplate,
	};
}
