import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { WebUiCopyTemplateTable } from "openauth-webui-shared-types/database";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";
import { invites } from "../../share";

/**
 * POST /api/invites/template/copy - Invite a user to access a copy template
 */
export async function POST({
	user_id,
	template_id,
	from_name,
}: {
	user_id: string;
	template_id: number;
	from_name: string;
}) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const current_user_id = (await ctx.data.client.getMetaData())?.id;

	if (!current_user_id) {
		return { success: false, error: "Unauthorized" };
	} else if (current_user_id === user_id) {
		return { success: false, error: "You cannot invite yourself" };
	}

	// Only template owner can invite users
	const db = drizzle(ctx.env.PROJECT_DB);

	const template = await db
		.select()
		.from(WebUiCopyTemplateTable)
		.where(
			and(
				eq(WebUiCopyTemplateTable.id, template_id),
				eq(WebUiCopyTemplateTable.owner_id, current_user_id),
			),
		)
		.get();

	if (!template) {
		return {
			success: false,
			error: "Template not found or you don't have permission to invite users",
		};
	}

	const inviteManager = invites(ctx.env.PROJECT_DB);

	const existingInvite = await inviteManager.exists({
		type: "copy_template",
		user_id,
		owner_group_id: template.owner_group_id,
		from_id: current_user_id,
	});

	const create = () =>
		inviteManager.create({
			type: "copy_template",
			owner_group_id: template.owner_group_id,
			label: `Invite to Copy Template ${template.name}`,
			from: {
				id: current_user_id,
				name: from_name,
			},
			invite_user_id: user_id,
		});

	if (existingInvite && inviteManager.alreadyCollaborator(existingInvite)) {
		return {
			success: false,
			error: "User is already a collaborator",
		};
	}

	if (existingInvite) {
		await inviteManager.deleteById(existingInvite.id);
		const newInvite = await create();
		return { success: newInvite.success, error: newInvite.error };
	}

	const res = await create();
	return { success: res.success, error: res.error };
}

/**
 * DELETE /api/invites/template/copy - Revoke a copy template invite
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
		return { success: false, error: "Unauthorized" };
	} else if (current_user_id === user_id) {
		return { success: false, error: "You cannot revoke your own invite" };
	}

	const inviteManager = invites(ctx.env.PROJECT_DB);

	const existingInvite = await inviteManager.exists({
		type: "copy_template",
		user_id,
		owner_group_id,
		from_id: current_user_id,
	});

	if (existingInvite) {
		await inviteManager.deleteById(existingInvite.id);
	} else {
		return { success: false, error: "Invite not found" };
	}

	return { success: true };
}
