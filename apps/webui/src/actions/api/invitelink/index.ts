import type { RequestDataContext } from "@auth";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import {
	projectTable,
	WebUiInviteLinkTable,
} from "openauth-webui-shared-types/database";
import { drizzle, eq } from "openauth-webui-shared-types/drizzle";

export async function POST(params: {
	clientID: string;
	copyID?: string;
	expireInMin: number;
	originURL: string;
}): Promise<{
	success: boolean;
	data?: { link: string };
	error?: string;
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);

	const project = await drizzle(ctx.env.PROJECT_DB)
		.select({
			originURL: projectTable.originURL,
		})
		.from(projectTable)
		.where(eq(projectTable.clientID, params.clientID))
		.get();

	if (!project)
		return {
			success: false,
			error: "Project not found",
		};
	else if (!project.originURL) {
		return {
			success: false,
			error: "Project origin URL is not set",
		};
	}

	if (
		!Number.isFinite(params.expireInMin) ||
		params.expireInMin < 1 ||
		params.expireInMin > 10080
	) {
		return {
			success: false,
			error: "expireInMin must be between 1 and 10080 (1 week)",
		};
	}

	let originUrl: URL;
	try {
		const authorizedOrigins = project.originURL.split(",").map((u) => u.trim());
		if (!authorizedOrigins.includes(params.originURL)) {
			return {
				success: false,
				error:
					"Provided origin URL is not in the list of authorized origins for this project",
			};
		}
		originUrl = new URL(params.originURL);
	} catch {
		return {
			success: false,
			error: "Project origin URL is invalid",
		};
	}

	const id = crypto.randomUUID();

	const url = originUrl;
	url.searchParams.set("invite_id", id);
	url.searchParams.set("client_id", params.clientID);
	if (params.copyID) {
		url.searchParams.set("copy_id", params.copyID);
	}

	const newLink = await drizzle(ctx.env.PROJECT_DB)
		.insert(WebUiInviteLinkTable)
		.values({
			id,
			clientID: params.clientID,
			link: url.toString(),
			expiresAt: new Date(
				Date.now() + params.expireInMin * 60 * 1000,
			).toISOString(), // Expires in specified minutes
			created_at: new Date().toISOString(),
		})
		.returning({ link: WebUiInviteLinkTable.link })
		.get();

	if (!newLink) {
		return {
			success: false,
			error: "Failed to create invite link",
		};
	}

	return {
		success: true,
		data: { link: newLink.link },
	};
}
