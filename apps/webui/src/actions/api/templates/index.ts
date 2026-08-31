import type { RequestDataContext } from "@auth";
import { ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import type { EmailTemplateProps } from "openauth-webui-shared-types";
import { emailTemplatesTable } from "openauth-webui-shared-types/database";
import { drizzle, eq, or } from "openauth-webui-shared-types/drizzle";

export type EmailTemplate = typeof emailTemplatesTable.$inferSelect;

// GET /api/templates - List all email templates
export async function GET(): Promise<{
	success: boolean;
	error?: string;
	data: EmailTemplate[];
}> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	const session = await ctx.data.client.getUserSession("private");

	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
			data: [],
		};
	}

	const currentUserId = session.user_id;

	const db = drizzle(env.PROJECT_DB);
	const templates = await db
		.select()
		.from(emailTemplatesTable)
		.where(
			ownerGroupConditions({
				user_group_ids: session.private?.group_ids || [],
				ownerGroupIdColumn: emailTemplatesTable.owner_group_id,
				otherEq: [eq(emailTemplatesTable.owner_id, currentUserId)],
				self_host: ctx.env.SELF_HOSTED,
			}),
		);

	return {
		success: true,
		data: templates,
	};
}

export type CreateTemplateParams = EmailTemplateProps;

// POST /api/templates - Create a new email template
export async function POST(params: CreateTemplateParams): Promise<{
	success: boolean;
	error?: string;
	data?: EmailTemplate;
}> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	try {
		const currentUserId = (await ctx.data.client.getMetaData())?.id;

		if (!currentUserId) {
			return {
				success: false,
				error: "Unauthorized",
			};
		}

		const { name, body, subject } = params;

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return {
				success: false,
				error: "Invalid or missing template name",
			};
		}

		if (!subject || typeof subject !== "string") {
			return {
				success: false,
				error: "Invalid or missing subject",
			};
		}

		if (!body || typeof body !== "string") {
			return {
				success: false,
				error: "Invalid or missing body",
			};
		}

		const db = drizzle(env.PROJECT_DB);
		const now = new Date().toISOString();

		const newTemplate: typeof emailTemplatesTable.$inferInsert = {
			name: name.trim(),
			body,
			subject,
			owner_id: currentUserId,
			owner_group_id: crypto.randomUUID(),
			created_at: now,
			updated_at: now,
		};

		return {
			success: true,
			data: (
				await db.insert(emailTemplatesTable).values(newTemplate).returning()
			).at(0) as EmailTemplate,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to create template",
		};
	}
}
