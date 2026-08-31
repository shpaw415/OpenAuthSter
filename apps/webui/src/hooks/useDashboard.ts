import type { DashboardData } from "@api/dashboard";
import { GET as getDashboard } from "@api/dashboard";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

const DASHBOARD_CACHE_KEY = "dashboard";
const dashboardCache = createServerCache<DashboardData | null>();

export interface UseDashboardOptions {
	pollInterval?: number;
}

export function useDashboard(options?: UseDashboardOptions) {
	const { pollInterval } = options ?? {};
	const cachedData = useServerCacheValue(dashboardCache, DASHBOARD_CACHE_KEY);
	const data = cachedData ?? null;
	const [isLoading, setIsLoading] = useState(
		() => dashboardCache.getSnapshot(DASHBOARD_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const refetch = useCallback(async (force = true) => {
		if (
			force ||
			dashboardCache.getSnapshot(DASHBOARD_CACHE_KEY) === undefined
		) {
			setIsLoading(true);
		}
		setError(null);
		try {
			await dashboardCache.fetch(
				DASHBOARD_CACHE_KEY,
				async () => {
					const response = await getDashboard();
					if (!response.success) {
						throw new Error(response.error || "Failed to fetch dashboard");
					}
					return response.data ?? null;
				},
				{ force },
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void refetch(false);
	}, [refetch]);

	useEffect(() => {
		if (!pollInterval || pollInterval <= 0) return;
		const id = setInterval(() => {
			void refetch(true);
		}, pollInterval);
		return () => clearInterval(id);
	}, [pollInterval, refetch]);

	return {
		data,
		isLoading,
		error,
		refetch,
	};
}
