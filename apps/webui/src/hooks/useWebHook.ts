import {
	DELETE as DeleteWebHook,
	POST as Register,
	GET as RetriveWebooks,
	PUT as UpdateWebHook,
} from "@api/webhooks";
import type {
	ExtendedWebHookConfig,
	WebHookConfig,
	WebHookEvents,
} from "openauth-webui-shared-types/webhook/types";
import { useCallback } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";

const webHooksCache = createServerCache<ExtendedWebHookConfig[]>();

function upsertWebHook(
	webhooks: ExtendedWebHookConfig[],
	nextWebHook: ExtendedWebHookConfig,
) {
	const existingIndex = webhooks.findIndex(
		(webhook) => webhook.id === nextWebHook.id,
	);

	if (existingIndex === -1) {
		return [...webhooks, nextWebHook];
	}

	return webhooks.map((webhook) =>
		webhook.id === nextWebHook.id ? nextWebHook : webhook,
	);
}

export function useWebHook(projectID: string) {
	const webhooks = useServerCacheValue(webHooksCache, projectID) ?? [];
	const registerWebHook = useCallback(
		async (event: WebHookEvents, config: WebHookConfig) => {
			const res = await Register({ clientID: projectID, event, config });
			if (!res.success) return res;
			webHooksCache.update(projectID, (currentWebHooks) =>
				upsertWebHook(currentWebHooks ?? [], res.data),
			);
			return res;
		},
		[projectID],
	);
	const getWebHooks = useCallback(
		async (force = true) => {
			try {
				const data = await webHooksCache.fetch(
					projectID,
					async () => {
						const res = await RetriveWebooks({ clientID: projectID });
						if (!res.success) {
							throw new Error(res.error || "Failed to retrieve webhooks");
						}
						return res.data;
					},
					{ force },
				);

				return { success: true as const, data };
			} catch (error) {
				return {
					success: false as const,
					error:
						error instanceof Error
							? error.message
							: "Failed to retrieve webhooks",
				};
			}
		},
		[projectID],
	);

	const deleteWebHook = useCallback(
		async (webHookID: string) => {
			const res = await DeleteWebHook({ webHookID, clientID: projectID });
			if (!res.success) return res;
			webHooksCache.update(projectID, (currentWebHooks) =>
				(currentWebHooks ?? []).filter((webhook) => webhook.id !== webHookID),
			);
			return res;
		},
		[projectID],
	);

	const updateWebHook = useCallback(
		async (webHookID: string, config: Partial<WebHookConfig>) => {
			const res = await UpdateWebHook({
				webHookID,
				config,
			});
			if (!res.success) return res;
			webHooksCache.update(projectID, (currentWebHooks) =>
				(currentWebHooks ?? []).map((webhook) =>
					webhook.id === webHookID ? { ...webhook, ...res.data } : webhook,
				),
			);
			return res;
		},
		[projectID],
	);

	return {
		webhooks,
		registerWebHook,
		getWebHooks,
		deleteWebHook,
		updateWebHook,
	};
}
