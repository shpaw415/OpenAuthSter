import {
	type CreateThemeParams,
	POST as createNewTheme,
	GET as getThemes,
	type UITheme,
} from "@api/themes";
import {
	DELETE as deleteThemeById,
	GET as getThemeById,
	type UpdateThemeParams,
	PUT as updateThemeById,
} from "@api/themes/id";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

export type { UITheme };

const UI_THEMES_CACHE_KEY = "all";
const uiThemesCache = createServerCache<UITheme[]>();
const uiThemeCache = createServerCache<UITheme>();

function upsertTheme(themes: UITheme[], nextTheme: UITheme) {
	const existingIndex = themes.findIndex((theme) => theme.id === nextTheme.id);

	if (existingIndex === -1) {
		return [...themes, nextTheme];
	}

	return themes.map((theme) => (theme.id === nextTheme.id ? nextTheme : theme));
}

function syncTheme(theme: UITheme) {
	uiThemeCache.set(String(theme.id), theme);
	uiThemesCache.update(UI_THEMES_CACHE_KEY, (currentThemes) =>
		upsertTheme(currentThemes ?? [], theme),
	);
}

function syncThemes(themes: UITheme[]) {
	uiThemesCache.set(UI_THEMES_CACHE_KEY, themes);
	for (const theme of themes) {
		uiThemeCache.set(String(theme.id), theme);
	}
}

function removeThemeFromCache(id: number) {
	uiThemeCache.clear(String(id));
	uiThemesCache.update(UI_THEMES_CACHE_KEY, (currentThemes) =>
		(currentThemes ?? []).filter((theme) => theme.id !== id),
	);
}

export function useUIThemes() {
	const themes = useServerCacheValue(uiThemesCache, UI_THEMES_CACHE_KEY) ?? [];
	const [isLoading, setIsLoading] = useState(
		() => uiThemesCache.getSnapshot(UI_THEMES_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchThemes = useCallback(async (force = true) => {
		if (force || uiThemesCache.getSnapshot(UI_THEMES_CACHE_KEY) === undefined) {
			setIsLoading(true);
		}
		setError(null);
		try {
			const data = await uiThemesCache.fetch(
				UI_THEMES_CACHE_KEY,
				async () => {
					const result = await getThemes();
					if (!result.success) {
						throw new Error(result.error || "Failed to fetch themes");
					}
					return result.data || [];
				},
				{ force },
			);
			syncThemes(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchThemes(false);
	}, [fetchThemes]);

	const createTheme = useCallback(async (params: CreateThemeParams) => {
		const res = await createNewTheme(params);

		if (!res.success) {
			throw new Error(res.error || "Failed to create theme");
		}
		const theme = res.data as UITheme;
		syncTheme(theme);
		return theme;
	}, []);

	const deleteTheme = useCallback(async (id: number) => {
		const res = await deleteThemeById({ id });

		if (!res.success) {
			throw new Error(res.error || "Failed to delete theme");
		}

		removeThemeFromCache(id);
	}, []);

	return {
		themes,
		isLoading,
		error,
		fetchThemes,
		createTheme,
		deleteTheme,
	};
}

export function useUITheme(id: number | null) {
	const cacheKey = id === null ? "" : String(id);
	const theme = useServerCacheValue(uiThemeCache, cacheKey) ?? null;
	const [isLoading, setIsLoading] = useState(
		() => id !== null && uiThemeCache.getSnapshot(cacheKey) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const fetchTheme = useCallback(
		async (force = true) => {
			if (!id) {
				setIsLoading(false);
				return;
			}
			if (force || uiThemeCache.getSnapshot(cacheKey) === undefined) {
				setIsLoading(true);
			}
			setError(null);
			try {
				const data = await uiThemeCache.fetch(
					cacheKey,
					async () => {
						const result = await getThemeById({ id });
						if (!result.success) {
							throw new Error(result.error || "Failed to fetch theme");
						}
						if (!result.data) {
							throw new Error("Theme data is undefined");
						}
						return result.data;
					},
					{ force },
				);
				syncTheme(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		},
		[cacheKey, id],
	);

	useEffect(() => {
		void fetchTheme(false);
	}, [fetchTheme]);

	const updateTheme = async (
		updates: UpdateThemeParams["data"],
	): Promise<UITheme> => {
		if (!id) {
			throw new Error("Theme ID is required to update theme");
		}
		const { success, error, data } = await updateThemeById({
			id,
			data: updates,
		});

		if (!success) {
			throw new Error(error || "Failed to update theme");
		}

		const theme = data as UITheme;
		syncTheme(theme);
		return theme;
	};

	return {
		theme,
		isLoading,
		error,
		fetchTheme,
		updateTheme,
	};
}
