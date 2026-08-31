import type { RequestDataContext } from "@auth";
import { ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import {
	type CopyDataSelection,
	insertLog,
	PUBLIC_CLIENT_ID,
} from "openauth-webui-shared-types";
import {
	parseDBCopyTemplate,
	WebUiCopyTemplateTable,
} from "openauth-webui-shared-types/database";
import { drizzle, eq } from "openauth-webui-shared-types/drizzle";

// GET /api/copy - List all copy templates
export async function GET(): Promise<{
	success: boolean;
	error?: string;
	data?: ReturnType<typeof parseDBCopyTemplate>[];
}> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	const session = await ctx.data.client.getUserSession("private");

	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	const db = drizzle(env.PROJECT_DB);
	const templates = await db
		.select()
		.from(WebUiCopyTemplateTable)
		.where(
			ownerGroupConditions({
				user_group_ids: session?.private?.group_ids ?? [],
				ownerGroupIdColumn: WebUiCopyTemplateTable.owner_group_id,
				otherEq: [eq(WebUiCopyTemplateTable.owner_id, session.user_id)],
				self_host: env.SELF_HOSTED,
			}),
		);

	return {
		success: true,
		data: templates.map((t) => parseDBCopyTemplate(t)),
	};
}

export type CreateCopyTemplateParams = {
	name: string;
	copyData: Partial<CopyDataSelection>;
};

// POST /api/copy - Create a new copy template
export async function POST(params: CreateCopyTemplateParams): Promise<{
	success: boolean;
	error?: string;
	data?: ReturnType<typeof parseDBCopyTemplate>;
}> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	try {
		const { name, copyData } = params;

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return {
				success: false,
				error: "Invalid or missing template name",
			};
		}

		if (!copyData || typeof copyData !== "object") {
			return {
				success: false,
				error: "Invalid or missing copy data",
			};
		}

		const db = drizzle(env.PROJECT_DB);
		const now = new Date().toISOString();

		const userData = await ctx.data.client.getMetaData();

		if (!userData || !userData.id) {


			await insertLog({
				type: "error",
				message: "Unauthorized attempt to create copy template",
				database: env.PROJECT_DB,
				clientID: PUBLIC_CLIENT_ID,
				context: {
					action: "create_copy_template",
					userData,
				},
			});

			return {
				success: false,
				error: "Unauthorized",
			};
		}

		const newTemplateEntry = (
			await db
				.insert(WebUiCopyTemplateTable)
				.values({
					name: name.trim(),
					owner_id: userData.id,
					owner_group_id: crypto.randomUUID(),
					copyData,
					created_at: now,
					updated_at: now,
				})
				.returning()
		).at(0);

		if (!newTemplateEntry) {
			return {
				success: false,
				error: "Failed to create copy template",
			};
		}

		return {
			success: true,
			data: parseDBCopyTemplate(newTemplateEntry),
		};
	} catch (err) {
		return {
			success: false,
			error:
				err instanceof Error ? err.message : "Failed to create copy template",
		};
	}
}
