import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { invites } from "../share";

/**
 * Accept a project invite using the invite code.
 * This endpoint is called when a user clicks on an invite link.
 * It verifies the invite code, adds the user to the project, and then deletes the invite.
 */
export async function POST({ code }: { code: string }) {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);

	const userId = (await ctx.data.client.getMetaData())?.id;

	if (!userId) {
		return { success: false, error: "Unauthorized" };
	}

	return await invites(ctx.env.PROJECT_DB).confirmInvite(
		code,
		userId,
		"project",
		ctx.data.client,
	);
}
