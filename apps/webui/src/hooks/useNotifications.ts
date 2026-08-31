import { DELETE as declineInvite, GET as getInvites } from "@api/invites";
import { POST as acceptProjectInvite } from "@api/invites/project/accept";
import { POST as acceptCopyTemplateInvite } from "@api/invites/template/copy/accept";
import { POST as acceptEmailTemplateInvite } from "@api/invites/template/email/accept";
import { POST as acceptUITemplateInvite } from "@api/invites/template/ui/accept";
import type { inviteTable } from "openauth-webui-shared-types/database";
import { useCallback, useEffect, useState } from "react";
import { createServerCache, useServerCacheValue } from "./serverCache";
import { useAuth } from "./useAuth";

export type InviteRow = typeof inviteTable.$inferSelect;

const INVITES_CACHE_KEY = "received:pending";
const invitesCache = createServerCache<InviteRow[]>();

export function useNotifications() {
	const auth = useAuth();
	const invites = useServerCacheValue(invitesCache, INVITES_CACHE_KEY) ?? [];
	const [isLoading, setIsLoading] = useState(
		() => invitesCache.getSnapshot(INVITES_CACHE_KEY) === undefined,
	);
	const [error, setError] = useState<string | null>(null);

	const refetch = useCallback(async (force = false) => {
		if (force || invitesCache.getSnapshot(INVITES_CACHE_KEY) === undefined) {
			setIsLoading(true);
		}
		setError(null);
		try {
			await invitesCache.fetch(
				INVITES_CACHE_KEY,
				async () => {
					const res = await getInvites({ type: "received", status: "pending" });
					if (!res?.success) {
						throw new Error(res?.error ?? "Failed to load notifications");
					}
					return (res.data ?? []) as InviteRow[];
				},
				{ force },
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const invalidate = useCallback(async () => {
		invitesCache.invalidate(INVITES_CACHE_KEY);
		await refetch(true);
	}, [refetch]);

	useEffect(() => {
		if (!auth?.isAuthenticated) return;
		void refetch(false);
	}, [auth?.isAuthenticated, refetch]);

	const pendingCount = invites.filter(
		(i) => new Date(i.expires_at) > new Date(),
	).length;

	// ─── Actions ───────────────────────────────────────────────────────────────

	const accept = useCallback(
		async (
			invite: InviteRow,
		): Promise<{ success: boolean; error?: string }> => {
			let res: { success: boolean; error?: string } | undefined;

			if (invite.type === "project") {
				res = await acceptProjectInvite({ code: invite.code });
			} else if (invite.type === "email_template") {
				res = await acceptEmailTemplateInvite({ code: invite.code });
			} else if (invite.type === "ui_template") {
				res = await acceptUITemplateInvite({ code: invite.code });
			} else if (invite.type === "copy_template") {
				res = await acceptCopyTemplateInvite({ code: invite.code });
			}

			if (res?.success) await invalidate();
			return res ?? { success: false, error: "Unknown invite type" };
		},
		[invalidate],
	);

	const decline = useCallback(
		async (
			invite: InviteRow,
		): Promise<{ success: boolean; error?: string }> => {
			const res = await declineInvite({ code: invite.code });
			if (res?.success) await invalidate();
			return res ?? { success: false, error: "Unknown invite type" };
		},
		[invalidate],
	);

	return {
		invites,
		pendingCount,
		isLoading,
		error,
		refetch,
		invalidate,
		accept,
		decline,
	};
}
