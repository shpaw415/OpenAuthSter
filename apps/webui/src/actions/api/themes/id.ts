import type { RequestDataContext } from "@auth";
import type { Theme } from "@kagii/openauth/ui/theme";
import { ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { uiStyleTable } from "openauth-webui-shared-types/database";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";
import type { UITheme } from "./index";

// GET /api/themes/:id - Get a specific theme
export async function GET(params: { id: number }): Promise<{
	success: boolean;
	error?: string;
	data?: UITheme;
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const { env } = ctx;

	const { id } = params;

	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}

	const session = await ctx.data.client.getUserSession("private");

	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	const db = drizzle(env.PROJECT_DB);
	const themes = (
		await db
			.select()
			.from(uiStyleTable)
			.where(
				and(
					eq(uiStyleTable.id, id),
					ownerGroupConditions({
						user_group_ids: session?.private?.group_ids ?? [],
						ownerGroupIdColumn: uiStyleTable.owner_group_id,
						otherEq: [eq(uiStyleTable.owner_id, session.user_id)],
						self_host: env.SELF_HOSTED,
					}),
				),
			)
			.limit(1)
	).at(0);
	if (!themes) {
		return {
			success: false,
			error: "Theme not found",
		};
	}

	return {
		success: true,
		data: {
			id: themes.id,
			name: themes.name,
			themeData: themes.themeData as Theme,
			owner_id: themes.owner_id,
			owner_group_id: themes.owner_group_id,
		},
	};
}

export type UpdateThemeParams = {
	id: number;
	data: Partial<Theme>;
};

// PUT /api/themes/:id - Update a theme
export async function PUT(params: UpdateThemeParams): Promise<{
	success: boolean;
	error?: string;
	data?: UITheme;
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const { env } = ctx;

	const { id, data } = params;

	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}

	const db = drizzle(env.PROJECT_DB);

	const currentUserId = (await ctx.data.client.getMetaData())?.id;

	if (!currentUserId) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	// Get current theme
	const [existing] = await db
		.select()
		.from(uiStyleTable)
		.where(
			and(eq(uiStyleTable.id, id), eq(uiStyleTable.owner_id, currentUserId)),
		)
		.limit(1);

	if (!existing) {
		return {
			success: false,
			error: "Theme not found or you don't have permission to update it",
		};
	}

	const [updated] = await db
		.update(uiStyleTable)
		.set({
			themeData: {
				...existing.themeData,
				...data,
			},
		})
		.where(eq(uiStyleTable.id, id))
		.returning();

	if (!updated) {
		return {
			success: false,
			error: "Failed to update theme",
		};
	}

	return {
		success: true,
		data: updated,
	};
}

// DELETE /api/themes/:id - Delete a theme
export async function DELETE(params: { id: number }): Promise<{
	success: boolean;
	error?: string;
}> {
	const ctx = getContext<Env, any, RequestDataContext>(arguments);
	const { env } = ctx;

	const { id } = params;

	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}

	const db = drizzle(env.PROJECT_DB);

	const currentUserId = (await ctx.data.client.getMetaData())?.id;

	if (!currentUserId) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	// Check if theme exists
	const existing = await db
		.select()
		.from(uiStyleTable)
		.where(
			and(eq(uiStyleTable.id, id), eq(uiStyleTable.owner_id, currentUserId)),
		)
		.limit(1);

	if (existing.length === 0) {
		return {
			success: false,
			error: "Theme not found or you don't have permission to delete it",
		};
	}

	await db
		.delete(uiStyleTable)
		.where(
			and(eq(uiStyleTable.id, id), eq(uiStyleTable.owner_id, currentUserId)),
		);

	return {
		success: true,
	};
}
