import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { inviteTable } from "openauth-webui-shared-types";
import { and, drizzle, eq, or } from "openauth-webui-shared-types/drizzle";
import { invites } from "./share";
/**
 * GET /api/invites - Get all invites for the authenticated user
 * this endpoints retrive all invites for the authenticated user, both sent and received. It can be used to display a list of pending invites in the UI.
 */
export async function GET({
	type,
	status,
	owner_group_id,
}: {
	type: "received" | "sent" | "all";
	status?: "pending" | "accepted" | "declined";
	owner_group_id?: string;
}) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const db = drizzle(ctx.env.PROJECT_DB);
	const userInfo = await ctx.data.client.getMetaData();

	if (!userInfo?.id) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}
	if (type === "received") {
		const invites = await db
			.select()
			.from(inviteTable)
			.where(
				status
					? and(
							eq(inviteTable.user_id, userInfo.id),
							eq(inviteTable.status, status),
							owner_group_id
								? eq(inviteTable.owner_group_id, owner_group_id)
								: undefined,
						)
					: owner_group_id
						? and(
								eq(inviteTable.user_id, userInfo.id),
								eq(inviteTable.owner_group_id, owner_group_id),
							)
						: eq(inviteTable.user_id, userInfo.id),
			)
			.all();

		return {
			success: true,
			data: invites,
		};
	} else if (type === "sent") {
		const invites = await db
			.select()
			.from(inviteTable)
			.where(
				status
					? and(
							eq(inviteTable.from_user_id, userInfo.id),
							eq(inviteTable.status, status),
							owner_group_id
								? eq(inviteTable.owner_group_id, owner_group_id)
								: undefined,
						)
					: owner_group_id
						? and(
								eq(inviteTable.from_user_id, userInfo.id),
								eq(inviteTable.owner_group_id, owner_group_id),
							)
						: eq(inviteTable.from_user_id, userInfo.id),
			)
			.all();

		return {
			success: true,
			data: invites,
		};
	} else if (type === "all") {
		const invites = await db
			.select()
			.from(inviteTable)
			.where(
				status
					? and(
							or(
								eq(inviteTable.user_id, userInfo.id),
								eq(inviteTable.from_user_id, userInfo.id),
							),
							eq(inviteTable.status, status),
							owner_group_id
								? eq(inviteTable.owner_group_id, owner_group_id)
								: undefined,
						)
					: owner_group_id
						? and(
								or(
									eq(inviteTable.user_id, userInfo.id),
									eq(inviteTable.from_user_id, userInfo.id),
								),
								eq(inviteTable.owner_group_id, owner_group_id),
							)
						: or(
								eq(inviteTable.user_id, userInfo.id),
								eq(inviteTable.from_user_id, userInfo.id),
							),
			)
			.all();

		return {
			success: true,
			data: invites,
		};
	}
}

/**
 * DELETE /api/invites - Decline (dismiss) a received invite by its code
 */
export async function DELETE({ code }: { code: string }) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);
	const userInfo = await ctx.data.client.getMetaData();
	if (!userInfo?.id) {
		return { success: false, error: "Unauthorized" };
	}

	const res = await invites(ctx.env.PROJECT_DB).declineInvite(
		code,
		userInfo.id,
	);
	return {
		success: res.success,
		error: res.error,
	};
}
