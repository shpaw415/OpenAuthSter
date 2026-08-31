import { createClient, type RequestDataContext, type Roles } from "@auth";
import { onSelfHosted, ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import {
	isClientIdValid,
	OTFusersTable,
	projectTable,
} from "openauth-webui-shared-types/database";
import {
	and,
	desc,
	drizzle,
	eq,
	like,
	sql,
} from "openauth-webui-shared-types/drizzle";
import { deleteUserWithAuthState } from "openauth-webui-shared-types/user/delete";

export type ProjectUser = {
	id: string;
	identifier: string;
	data: Record<string, unknown> | null;
	session_public: Record<string, unknown> | null;
	created_at: string;
	role: string | null;
};

export type ListUsersParams = {
	clientID: string;
	page?: number;
	pageSize?: number;
	search?: string;
};

export type ListUsersResponse = {
	success: boolean;
	error?: string;
	data?: {
		users: Array<
			Omit<ReturnType<typeof OTFusersTable>["$inferSelect"], "session_private">
		>;
		total: number;
		page: number;
		pageSize: number;
	};
};

export type DeleteUserParams = {
	clientID: string;
	userID: string;
};

export type DeleteUserResponse = {
	success: boolean;
	error?: string;
};

/**
 * GET /api/users - List users for a client with pagination and optional search
 */
export async function GET(params: ListUsersParams): Promise<ListUsersResponse> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	const clientID = params.clientID?.trim();
	if (!clientID || !isClientIdValid(clientID)) {
		return { success: false, error: "Invalid or missing clientID" };
	}

	const session = await ctx.data.client
		.getUserSession("private")
		.then((s) => (s instanceof Error ? null : s));
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}
	// Verify the user has permission to view users for this client by checking project ownership
	const projectIsOwnedByUser = await onSelfHosted(
		env.SELF_HOSTED,
		Promise.resolve(true),
		() =>
			drizzle(env.PROJECT_DB)
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
				.then((e) => Boolean(e)),
	);

	if (!projectIsOwnedByUser) {
		return { success: false, error: "Unauthorized" };
	}

	const page = Math.max(1, Number(params.page) || 1);
	const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
	const search = params.search?.trim() || "";

	try {
		const db = drizzle(env.PROJECT_DB);
		const usersTable = OTFusersTable(clientID);

		const filters = search
			? like(usersTable.identifier, `%${search}%`)
			: undefined;

		const countQuery = filters
			? db
					.select({ count: sql<number>`count(*)` })
					.from(usersTable)
					.where(filters)
			: db.select({ count: sql<number>`count(*)` }).from(usersTable);

		const totalRow = await countQuery.get();
		const total = totalRow?.count ?? 0;

		let dataQuery = db
			.select({
				id: usersTable.id,
				identifier: usersTable.identifier,
				data: usersTable.data,
				session_public: usersTable.session_public,
				created_at: usersTable.created_at,
				role: usersTable.role,
				email: usersTable.email,
			})
			.from(usersTable);

		if (filters) {
			//@ts-expect-error
			dataQuery = dataQuery.where(filters);
		}

		const users = await dataQuery
			.orderBy(desc(usersTable.created_at))
			.limit(pageSize)
			.offset((page - 1) * pageSize);

		return {
			success: true,
			data: {
				users,
				total,
				page,
				pageSize,
			},
		};
	} catch (error) {
		console.error("Failed to load users:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to load users",
		};
	}
}

/**
 * DELETE /api/users - Delete a user by ID for a specific client
 */
export async function DELETE(
	params: DeleteUserParams,
): Promise<DeleteUserResponse> {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);
	const { env } = ctx;

	const session = await ctx.data.client
		.getUserSession("private")
		.then((s) => (s instanceof Error ? null : s));
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	const clientID = params.clientID.trim();
	const userID = params.userID.trim();

	if (!clientID) {
		return { success: false, error: "Invalid or missing clientID" };
	} else if (!userID) {
		return { success: false, error: "Invalid or missing userID" };
	}

	const db = drizzle(env.PROJECT_DB);

	// Verify the user has permission to delete users for this client by checking project ownership
	if (
		!(await db
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
			.then((e) => Boolean(e)))
	) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		return await deleteUserWithAuthState({
			d1db: env.PROJECT_DB,
			clientID,
			userID,
		});
	} catch (error) {
		console.error("Failed to delete user:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to delete user",
		};
	}
}

export async function PUT(
	{ project_id, user_id }: { project_id: string; user_id: string },
	options: Partial<{ role: Roles }>,
) {
	const ctx = getContext<Env, string, RequestDataContext>(arguments);

	const client = ctx.data.client;

	const session = await client.getUserSession("private");

	if (session instanceof Error) {
		return new Response("Unauthorized", { status: 401 });
	}

	const project = await drizzle(ctx.env.PROJECT_DB)
		.select({ id: projectTable.clientID, secret: projectTable.secret })
		.from(projectTable)
		.where(
			and(
				eq(projectTable.clientID, project_id),
				ownerGroupConditions({
					user_group_ids: session.private?.group_ids ?? [],
					ownerGroupIdColumn: projectTable.owner_group_id,
					otherEq: [eq(projectTable.owner_id, session?.user_id)],
					self_host: ctx.env.SELF_HOSTED,
				}),
			),
		)
		.get();

	if (!project) {
		return new Response("Unauthorized", { status: 401 });
	}

	const projectClient = createClient({
		token: client.getToken() as string,
		clientID: project_id,
		issuerURI: process.env.PUBLIC_ISSUER,
		redirectURI: process.env.PUBLIC_REDIRECT_URI,
		secret: project.secret,
	});
	if (options.role) {
		const roleUpdateRes = await projectClient.setUserRoleById(
			user_id,
			options.role,
		);
		if (roleUpdateRes instanceof Error) {
			console.error("Failed to update user role:", roleUpdateRes);
			return {
				success: false,
				error:
					roleUpdateRes instanceof Error
						? roleUpdateRes.message
						: "Failed to update user role",
			};
		}
	}

	return {
		success: true,
	};
}
