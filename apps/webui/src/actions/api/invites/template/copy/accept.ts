import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { invites } from "../../share";

/**
 * Accept a copy template invite using the invite code.
 * Verifies the invite code, adds the user to the template group, then deletes the invite.
 */
export async function POST({ code }: { code: string }) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const userId = (await ctx.data.client.getMetaData())?.id;

	if (!userId) {
		return { success: false, error: "Unauthorized" };
	}

	const manager = invites(ctx.env.PROJECT_DB);
	return await manager.confirmInvite(
		code,
		userId,
		"copy_template",
		ctx.data.client,
	);
}
