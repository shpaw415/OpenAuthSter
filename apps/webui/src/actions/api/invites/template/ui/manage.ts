import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { uiStyleTable } from "openauth-webui-shared-types/database";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";
import { invites } from "../../share";

/**
 * POST /api/invites/ui_template - Invite a user to access a UI theme
 */
export async function POST({
	user_id,
	theme_id,
	from_name,
}: {
	user_id: string;
	theme_id: number;
	from_name: string;
}) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const current_user_id = (await ctx.data.client.getMetaData())?.id;

	if (!current_user_id) {
		return {
			success: false,
			error: "Unauthorized",
		};
	} else if (current_user_id === user_id) {
		return {
			success: false,
			error: "You cannot invite yourself",
		};
	}

	// Only theme owner can invite users
	const db = drizzle(ctx.env.PROJECT_DB);

	const theme = await db
		.select()
		.from(uiStyleTable)
		.where(
			and(
				eq(uiStyleTable.id, theme_id),
				eq(uiStyleTable.owner_id, current_user_id),
			),
		)
		.get();

	if (!theme) {
		return {
			success: false,
			error: "Theme not found or you don't have permission to invite users",
		};
	}

	const inviteManager = invites(ctx.env.PROJECT_DB);

	const existingInvite = await inviteManager.exists({
		type: "ui_template",
		user_id,
		owner_group_id: theme.owner_group_id,
		from_id: current_user_id,
	});

	const create = () => {
		return inviteManager.create({
			type: "ui_template",
			owner_group_id: theme.owner_group_id,
			label: `Invite to UI Theme ${theme.name}`,
			from: {
				id: current_user_id,
				name: from_name,
			},
			invite_user_id: user_id,
		});
	};

	if (existingInvite && inviteManager.alreadyCollaborator(existingInvite)) {
		return {
			success: false,
			error: "User is already a collaborator",
		};
	}

	if (existingInvite) {
		await inviteManager.deleteById(existingInvite.id);
		const newInvite = await create();

		return {
			success: newInvite.success,
			error: newInvite.error,
		};
	}

	const res = await create();

	return {
		success: res.success,
		error: res.error,
	};
}

/**
 * DELETE /api/invites/ui_template - Revoke a UI theme invite
 */
export async function DELETE({
	user_id,
	owner_group_id,
}: {
	user_id: string;
	owner_group_id: string;
}) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const current_user_id = (await ctx.data.client.getMetaData())?.id;

	if (!current_user_id) {
		return {
			success: false,
			error: "Unauthorized",
		};
	} else if (current_user_id === user_id) {
		return {
			success: false,
			error: "You cannot revoke your own invite",
		};
	}

	const inviteManager = invites(ctx.env.PROJECT_DB);

	const existingInvite = await inviteManager.exists({
		type: "ui_template",
		user_id,
		owner_group_id,
		from_id: current_user_id,
	});

	if (existingInvite) {
		await inviteManager.deleteById(existingInvite.id);
	} else {
		return {
			success: false,
			error: "Invite not found",
		};
	}

	return {
		success: true,
	};
}
