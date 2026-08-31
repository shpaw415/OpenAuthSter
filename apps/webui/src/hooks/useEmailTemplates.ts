import {
	type CreateTemplateParams,
	POST as createNewTemplate,
	type EmailTemplate,
	GET as getTemplates,
} from "@api/templates";
import {
	DELETE as deleteTemplateByName,
	GET as getTemplateByName,
	type UpdateTemplateParams,
	PUT as updateTemplateByName,
} from "@api/templates/id";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

export type { EmailTemplate };

const EMAIL_TEMPLATES_CACHE_KEY = "all";
const emailTemplatesCache = createServerCache<EmailTemplate[]>();
const emailTemplateCache = createServerCache<EmailTemplate>();

function upsertTemplate(
	templates: EmailTemplate[],
	nextTemplate: EmailTemplate,
) {
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

function syncTemplate(template: EmailTemplate) {
	emailTemplateCache.set(template.name, template);
	emailTemplatesCache.update(EMAIL_TEMPLATES_CACHE_KEY, (currentTemplates) =>
		upsertTemplate(currentTemplates ?? [], template),
	);
}

function syncTemplates(templates: EmailTemplate[]) {
	emailTemplatesCache.set(EMAIL_TEMPLATES_CACHE_KEY, templates);
	for (const template of templates) {
		emailTemplateCache.set(template.name, template);
	}
}

function removeTemplateFromCache(name: string) {
	emailTemplateCache.clear(name);
	emailTemplatesCache.update(EMAIL_TEMPLATES_CACHE_KEY, (currentTemplates) =>
		(currentTemplates ?? []).filter((template) => template.name !== name),
	);
}

export function useEmailTemplates() {
	const templates =
		useServerCacheValue(emailTemplatesCache, EMAIL_TEMPLATES_CACHE_KEY) ?? [];
	const [isLoading, setIsLoading] = useState(
		() =>
			emailTemplatesCache.getSnapshot(EMAIL_TEMPLATES_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchTemplates = useCallback(async (force = true) => {
		if (
			force ||
			emailTemplatesCache.getSnapshot(EMAIL_TEMPLATES_CACHE_KEY) === undefined
		) {
			setIsLoading(true);
		}
		setError(null);
		try {
			const data = await emailTemplatesCache.fetch(
				EMAIL_TEMPLATES_CACHE_KEY,
				async () => {
					const result = await getTemplates();
					if (!result.success) {
						throw new Error(result.error || "Failed to fetch templates");
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

	const createTemplate = useCallback(async (params: CreateTemplateParams) => {
		const res = await createNewTemplate(params);

		if (!res.success) {
			throw new Error(res.error || "Failed to create template");
		}
		syncTemplate(res.data!);
		return res.data!;
	}, []);

	const deleteTemplate = useCallback(async (name: string) => {
		const res = await deleteTemplateByName({ name });

		if (!res.success) {
			throw new Error(res.error || "Failed to delete template");
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

export function useEmailTemplate(name: string = "") {
	const template = useServerCacheValue(emailTemplateCache, name) ?? null;
	const [isLoading, setIsLoading] = useState(
		() => Boolean(name) && emailTemplateCache.getSnapshot(name) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchTemplate = useCallback(
		async (force = true) => {
			if (!name) {
				setIsLoading(false);
				return;
			}
			if (force || emailTemplateCache.getSnapshot(name) === undefined) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await emailTemplateCache.fetch(
					name,
					async () => {
						const result = await getTemplateByName({ name });
						if (!result.success) {
							throw new Error(result.error || "Failed to fetch template");
						}
						if (!result.data) {
							throw new Error("Template data is undefined");
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
		updates: UpdateTemplateParams["data"],
	): Promise<EmailTemplate> => {
		const { success, error, data } = await updateTemplateByName({
			name,
			data: updates,
		});

		if (!success) {
			throw new Error(error || "Failed to update template");
		}

		syncTemplate(data!);
		return data!;
	};

	return {
		template,
		isLoading,
		error,
		fetchTemplate,
		updateTemplate,
	};
}
