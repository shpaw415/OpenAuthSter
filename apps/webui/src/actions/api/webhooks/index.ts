import type { RequestDataContext } from "@auth";
import { onSelfHosted, ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { projectTable } from "openauth-webui-shared-types";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";
import { WebHook } from "openauth-webui-shared-types/webhook";
import type {
	ExtendedWebHookConfig,
	WebHookConfig,
	WebHookEvents,
} from "openauth-webui-shared-types/webhook/types";
import type { ActionResponse } from "../../../api-helper";

export async function GET({
	clientID,
	filters,
}: {
	clientID: string;
	filters?: Partial<{
		event: WebHookEvents;
		id: string;
	}>;
}): Promise<ActionResponse<ExtendedWebHookConfig[]>> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const wh = new WebHook({ db: ctx.env.PROJECT_DB });

	const session = await ctx.data.client.getUserSession("private");

	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	const projectIsOwnedByUser = onSelfHosted(
		ctx.env.SELF_HOSTED,
		Promise.resolve(true),
		() =>
			drizzle(ctx.env.PROJECT_DB)
				.select({ id: projectTable.clientID })
				.from(projectTable)
				.where(
					and(
						eq(projectTable.clientID, clientID),
						ownerGroupConditions({
							user_group_ids: session?.private?.group_ids ?? [],
							ownerGroupIdColumn: projectTable.owner_group_id,
							otherEq: [eq(projectTable.owner_id, session.user_id)],
							self_host: ctx.env.SELF_HOSTED,
						}),
					),
				)
				.then((result) => Boolean(result.at(0))),
	);

	if (!projectIsOwnedByUser) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	try {
		return {
			success: true,
			data: await wh.getWebHooks(clientID, filters),
		};
	} catch (error) {
		return {
			success: false,
			error: "Failed to fetch webhooks",
			details: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * Create a new webhook for a specific client and event.
 * @param clientID - The ID of the client for which the webhook is being registered.
 * @param event - The event that will trigger the webhook (e.g., "login_success", "password_reset", "code_sent").
 * @param config - The configuration for the webhook, including the URL, HTTP method, and optional headers.
 */
export async function POST({
	clientID,
	event,
	config,
}: {
	clientID: string;
	event: WebHookEvents;
	config: WebHookConfig;
}): Promise<ActionResponse<ExtendedWebHookConfig>> {
	const ctx = getContext<Env, any, any>(arguments);
	try {
		return {
			success: true,
			data: await new WebHook({ db: ctx.env.PROJECT_DB }).register({
				clientID,
				event,
				config,
			}),
		};
	} catch (error) {
		return {
			error: "Failed to register webhook",
			details: error instanceof Error ? error.message : String(error),
			success: false,
		};
	}
}

export async function DELETE({
	webHookID,
	clientID,
}: {
	webHookID: string;
	clientID: string;
}): Promise<ActionResponse<null>> {
	const ctx = getContext<Env, any, any>(arguments);
	try {
		await new WebHook({ db: ctx.env.PROJECT_DB }).deleteWebHook(
			webHookID,
			clientID,
		);
		return {
			success: true,
			data: null,
		};
	} catch (error) {
		return {
			error: "Failed to delete webhook",
			details: error instanceof Error ? error.message : String(error),
			success: false,
		};
	}
}

export async function PUT({
	webHookID,
	config,
}: {
	webHookID: string;
	config: Partial<WebHookConfig>;
}): Promise<ActionResponse<WebHookConfig>> {
	const ctx = getContext<Env, any, any>(arguments);
	const wh = new WebHook({ db: ctx.env.PROJECT_DB });
	try {
		return {
			success: true,
			data: await wh.update({ webHookID, config }),
		};
	} catch (error) {
		return {
			error: "Failed to update webhook",
			details: error instanceof Error ? error.message : String(error),
			success: false,
		};
	}
}
