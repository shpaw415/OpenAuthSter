import type { RequestDataContext } from "@auth";
import { ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { LogsTable, projectTable } from "openauth-webui-shared-types/database";
import {
	and,
	desc,
	drizzle,
	eq,
	inArray,
	sql,
} from "openauth-webui-shared-types/drizzle";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

async function getProjectOwnership(
	clientID: string,
	ctx: ReturnType<typeof getContext<Env, any, RequestDataContext>>,
): Promise<boolean> {
	const { env } = ctx;
	const session = await ctx.data.client.getUserSession("private");
	if (session instanceof Error) return false;

	if (env.SELF_HOSTED === "true") return true;

	return drizzle(env.PROJECT_DB)
		.select({ id: projectTable.clientID })
		.from(projectTable)
		.where(
			and(
				eq(projectTable.clientID, clientID),
				ownerGroupConditions({
					user_group_ids: session?.private?.group_ids ?? [],
					ownerGroupIdColumn: projectTable.owner_group_id,
					otherEq: [eq(projectTable.owner_id, session.user_id)],
					self_host: env.SELF_HOSTED,
				}),
			),
		)
		.get()
		.then((e) => Boolean(e));
}

// GET /api/logs - Get paginated logs for a project
export async function GET(params: {
	clientID: string;
	page?: number;
	limit?: number;
}): Promise<{
	success: boolean;
	error?: string;
	data: Array<typeof LogsTable.$inferSelect>;
	pagination?: { page: number; limit: number; total: number };
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const { env } = ctx;

	const { clientID } = params;

	if (!clientID || typeof clientID !== "string") {
		return {
			success: false,
			error: "Invalid or missing clientID",
			data: [],
		};
	}

	const owned = await getProjectOwnership(clientID, ctx);
	if (!owned) {
		return { success: false, error: "Unauthorized", data: [] };
	}

	const page = Math.max(1, Number(params.page) || 1);
	const limit = Math.min(
		MAX_LIMIT,
		Math.max(1, Number(params.limit) || DEFAULT_LIMIT),
	);
	const offset = (page - 1) * limit;

	const db = drizzle(env.PROJECT_DB);

	const [countRow, logs] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(LogsTable)
			.where(eq(LogsTable.clientID, clientID))
			.get(),
		db
			.select()
			.from(LogsTable)
			.where(eq(LogsTable.clientID, clientID))
			.orderBy(desc(LogsTable.timestamp))
			.limit(limit)
			.offset(offset),
	]);

	return {
		success: true,
		data: logs,
		pagination: { page, limit, total: countRow?.count ?? 0 },
	};
}

// DELETE /api/logs - Delete logs by IDs for a project
export async function DELETE(params: {
	clientID: string;
	ids: string[];
}): Promise<{
	success: boolean;
	error?: string;
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const { env } = ctx;

	const { clientID, ids } = params;

	if (!clientID || typeof clientID !== "string") {
		return { success: false, error: "Invalid or missing clientID" };
	}

	if (!Array.isArray(ids) || ids.length === 0) {
		return { success: false, error: "No IDs provided" };
	}

	const owned = await getProjectOwnership(clientID, ctx);
	if (!owned) {
		return { success: false, error: "Unauthorized" };
	}

	const db = drizzle(env.PROJECT_DB);
	await db
		.delete(LogsTable)
		.where(and(eq(LogsTable.clientID, clientID), inArray(LogsTable.id, ids)));

	return { success: true };
}
