import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";

export async function GET({ user_ids }: { user_ids: string[] }) {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);

	const users = await ctx.data.client.getManyUserById(user_ids);

	if (users instanceof Error) {
		return {
			success: false,
			error: users.message,
		};
	}

	return {
		success: true,
		data: users.data.users.map((user) => {
			const { session_private, ...authorized } = user;
			return authorized;
		}),
	};
}
