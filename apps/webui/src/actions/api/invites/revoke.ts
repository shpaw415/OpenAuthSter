import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { invites } from "./share";

export async function DELETE({
	owner_group_id,
	user_id,
}: {
	owner_group_id: string;
	user_id: string;
}) {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);

	const inviteManager = invites(ctx.env.PROJECT_DB);
	const res = await inviteManager.revoke(
		user_id,
		owner_group_id,
		ctx.data.client,
	);
	return {
		success: res.success,
		error: res.error,
	};
}
