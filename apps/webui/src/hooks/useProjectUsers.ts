import {
	DELETE as deleteProjectUser,
	GET as getProjectUsers,
	type ProjectUser,
} from "@api/users";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

type CachedProjectUsersPage = {
	users: ProjectUser[];
	total: number;
};

const projectUsersCache = createServerCache<CachedProjectUsersPage>();

function getProjectUsersCacheKey(
	clientID: string,
	page: number,
	pageSize: number,
	search: string,
) {
	return `${clientID}:${pageSize}:${page}:${search}`;
}

function clearProjectUsersCache(clientID: string) {
	projectUsersCache.clearMatching((key) => key.startsWith(`${clientID}:`));
}

export type UseProjectUsersOptions = {
	pageSize?: number;
	initialSearch?: string;
};

export function useProjectUsers(
	clientID: string,
	options: UseProjectUsersOptions = {},
) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState(options.initialSearch || "");
	const [error, setError] = useState<string | null>(null);

	const pageSize = options.pageSize ?? 20;
	const cacheKey = getProjectUsersCacheKey(clientID, page, pageSize, search);
	const cachedPage = useServerCacheValue(projectUsersCache, cacheKey);
	const users = cachedPage?.users ?? [];
	const total = cachedPage?.total ?? 0;
	const [isLoading, setIsLoading] = useState(
		() =>
			Boolean(clientID) &&
			projectUsersCache.getSnapshot(cacheKey) === undefined,
	);

	useEffect(() => {
		setPage(1);
		setSearch(options.initialSearch || "");
	}, [options.initialSearch]);

	const fetchUsers = useCallback(
		async (params?: { page?: number; search?: string }, force = true) => {
			if (!clientID) return;

			const nextPage = params?.page ?? page;
			const nextSearch = params?.search ?? search;
			const nextKey = getProjectUsersCacheKey(
				clientID,
				nextPage,
				pageSize,
				nextSearch,
			);

			if (force || projectUsersCache.getSnapshot(nextKey) === undefined) {
				setIsLoading(true);
			}
			setError(null);

			try {
				await projectUsersCache.fetch(
					nextKey,
					async () => {
						const response = await getProjectUsers({
							clientID,
							page: nextPage,
							pageSize,
							search: nextSearch,
						});

						if (!response.success || !response.data) {
							throw new Error(response.error || "Failed to fetch users");
						}

						return {
							users: response.data.users,
							total: response.data.total,
						};
					},
					{ force },
				);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		},
		[clientID, page, pageSize, search],
	);

	useEffect(() => {
		if (!clientID) return;
		void fetchUsers(undefined, false);
	}, [fetchUsers, clientID]);

	const updateSearch = (value: string) => {
		setPage(1);
		setSearch(value);
	};

	return {
		users,
		total,
		page,
		pageSize,
		search,
		isLoading,
		error,
		setPage,
		setSearch: updateSearch,
		refetch: (force = true) => fetchUsers({ page, search }, force),
		deleteUser: async (userID: string) => {
			if (!clientID) {
				throw new Error("Missing client ID");
			}

			setError(null);

			const res = await deleteProjectUser({ clientID, userID });

			if (!res.success) {
				throw new Error(res.error || "Failed to delete user");
			}

			clearProjectUsersCache(clientID);
			await fetchUsers({ page, search }, true);
		},
	};
}
