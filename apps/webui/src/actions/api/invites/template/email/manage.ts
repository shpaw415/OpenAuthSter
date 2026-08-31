import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { emailTemplatesTable, projectTable } from "openauth-webui-shared-types";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";
import { invites } from "../../share";

/**
 * POST /api/projects/invite - Invite a user to a project
 */
export async function POST({
	user_id,
	from_name,
	template_name,
}: {
	user_id: string;
	from_name: string;
	template_name: string;
}) {
	const ctx = getContext<Env, "", RequestDataContext>(arguments);

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

	const db = drizzle(ctx.env.PROJECT_DB);

	const template = await db
		.select()
		.from(emailTemplatesTable)
		.where(
			and(
				eq(emailTemplatesTable.name, template_name),
				eq(emailTemplatesTable.owner_id, current_user_id),
			),
		)
		.get();

	if (!template) {
		return {
			success: false,
			error:
				"Email template not found or you do not have permission to manage it",
		};
	}

	const inviteManager = invites(ctx.env.PROJECT_DB);

	const existingInvite = await inviteManager.exists({
		type: "email_template",
		user_id,
		owner_group_id: template.owner_group_id,
		from_id: current_user_id,
	});

	const create = () => {
		return inviteManager.create({
			type: "email_template",
			owner_group_id: template.owner_group_id,
			label: `Invite to Email Template ${template.name}`,
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
 * DELETE /api/projects/invite - Revoke an invite
 */
export async function DELETE({
	user_id,
	owner_group_id,
}: {
	user_id: string;
	owner_group_id: string;
}) {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);

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
		type: "email_template",
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
