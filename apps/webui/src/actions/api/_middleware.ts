"no action";
import {
	createClient,
	type PrivateSessionData,
	type PublicSessionData,
	type RequestDataContext,
    type Roles,
} from "@auth";
import type { EventContext } from "@cloudflare/workers-types";
import type { ProviderType } from "openauthster-shared";
import type { OpenAuthsterClient } from "openauthster-shared/client/user";

export async function onRequest(
	context: EventContext<Env, never, RequestDataContext>,
) {
	// @ts-expect-error - This is a custom property we add in development for mocking authentication
	if (context.env.NODE_ENV === "development") {
		const host = new URL(context.request.url).hostname;
		if (host !== "localhost" && host !== "127.0.0.1") {
			console.error(
				"Unauthorized request in development environment from host:",
				host,
				". Only localhost and 127.0.0.1 are allowed.",
				"Set NODE_ENV to production to disable this check.",
			);
			return new Response("Unauthorized", { status: 401 });
		}
		/**
		 * In development, we mock the authentication by injecting a fake client into the context.
		 */
		// @ts-expect-error - We are intentionally mocking the client for development
		context.data.client = {
			getMetaData: async () => ({
				id: "admin",
				identifier: "admin@example.com",
				provider: "password",
				role: "admin",
			}),
			getUserSession: async () => ({
				public: {},
				private: {
					group_ids: ["admin"],
				},
				user_id: "admin",
				provider: "password",
				user_identifier: "admin@example.com",
				role: "admin",
			}),
		} as OpenAuthsterClient<PublicSessionData, PrivateSessionData, Roles, never, never>;

		return await context.next();
	}

	try {
		const auth = await createClient({
			clientID: context.env.PUBLIC_CLIENT_ID,
			issuerURI: context.env.PUBLIC_ISSUER,
			redirectURI: context.env.PUBLIC_REDIRECT_URI,
			secret: context.env.WEBUI_SECRET,
		}).setTokenFromRequest(context.request as unknown as Request);

		if (!auth.isAuthenticated) {
			return new Response("Unauthorized", { status: 401 });
		}

		context.data.client = auth;
		return await context.next();
	} catch (err) {
		console.error("Error in API middleware:", err);
		const message = err instanceof Error ? err.message : String(err);
		if (
			message.includes("Failed to verify token") ||
			message.includes("Invalid URL") ||
			message.includes("jwks")
		) {
			return new Response("Unauthorized", { status: 401 });
		}
		return new Response("Internal Server Error", { status: 500 });
	}
}
