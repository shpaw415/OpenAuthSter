import type { RequestDataContext } from "@auth";
import { onSelfHosted, ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import {
	createWebUiProject,
	type Project,
	type ProviderConfig,
} from "openauth-webui-shared-types";
import {
	createUserTable,
	insertLog,
	isClientIdValid,
	projectTable,
} from "openauth-webui-shared-types/database";
import { drizzle, eq } from "openauth-webui-shared-types/drizzle";
import {
	CloudflareClientError,
	createClient,
	createCustomDomainForProject,
	deleteCustomDomainForProject,
} from "../../../cloudflare";
import { generateSecret } from "./share";

// GET /api/projects - List all projects
export async function GET(): Promise<{
	success: boolean;
	error?: string;
	data: Project[];
}> {
	const { env, data } = getContext<Env, never, RequestDataContext>(arguments);

	const session = await data.client.getUserSession("private");

	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
			data: [],
		};
	}

	const db = drizzle(env.PROJECT_DB);
	const projects = await db
		.select()
		.from(projectTable)
		.where(
			ownerGroupConditions({
				user_group_ids: session.private?.group_ids ?? [],
				ownerGroupIdColumn: projectTable.owner_group_id,
				otherEq: [eq(projectTable.owner_id, session.user_id)],
				self_host: env.SELF_HOSTED,
			}),
		);

	onSelfHosted(
		env.SELF_HOSTED,
		() =>
			projects.push(
				createWebUiProject({
					secret: env.WEBUI_SECRET,
					originURL: env.PUBLIC_REDIRECT_URI,
				}),
			),
		null,
	);

	return {
		success: true,
		data: projects,
	};
}

export type createProjectParams = {
	name: string;
	providers_data?: ProviderConfig[];
};

// POST /api/projects - Create a new project
export async function POST(params: {
	name: string;
	providers_data?: ProviderConfig[];
}): Promise<{ success: boolean; error?: string; data?: Project }> {
	const ctx = getContext<Env, never, RequestDataContext>(arguments);
	const { env, data } = ctx;

	const currentUserId = (await data.client.getMetaData())?.id;

	if (!currentUserId) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	try {
		const { name, providers_data = [] } = params;
		const clientID = [
			"_",
			name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
			crypto.randomUUID().split("-")[0],
		].join("_");

		if (!name || typeof name !== "string") {
			return {
				success: false,
				error: "missing project name",
			};
		}

		if (!isClientIdValid(clientID)) {
			return {
				success: false,
				error:
					"Invalid clientID format only alphanumeric and underscores, 3-30 characters, must start with a letter or underscore",
			};
		}

		// Check if project already exists
		const db = drizzle(env.PROJECT_DB);
		const existing = await db
			.select()
			.from(projectTable)
			.where(eq(projectTable.clientID, clientID))
			.limit(1);

		if (existing.length > 0) {
			return {
				success: false,
				error: "Project with this clientID already exists",
			};
		}

		const cfClient = createClient(env);
		const cfDomaineCreate = await createCustomDomainForProject(env, cfClient);

		if (!cfDomaineCreate || !cfDomaineCreate.id || !cfDomaineCreate.hostname) {
			return {
				success: false,
				error: `Failed to create Cloudflare custom domain for project. Cloudflare info: ${JSON.stringify(
					cfDomaineCreate,
				)}`,
			};
		}

		const newProject: Project = {
			name,
			clientID,
			owner_id: currentUserId,
			owner_group_id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
			active: true,
			providers_data,
			originURL: "",
			authEndpointURL: cfDomaineCreate.hostname,
			cloudflareDomaineID: cfDomaineCreate.id,
			registerOnInvite: false,
			secret: generateSecret(),
			theme_id: null,
			projectData: {},
		};

		const [insertedProject] = await db
			.insert(projectTable)
			.values(newProject)
			.returning();

		if (!insertedProject) {
			await deleteCustomDomainForProject(
				env,
				cfClient,
				cfDomaineCreate.id as string,
			).catch(() => {});
			return {
				success: false,
				error: "Failed to create project",
			};
		}

		return await createUserTable(clientID, env.PROJECT_DB)
			.then(() => ({ success: true, data: insertedProject }))
			.catch(async (err) => {
				console.error(
					`Failed to create user table for project ${clientID}: ${err}`,
				);
				await db
					.delete(projectTable)
					.where(eq(projectTable.clientID, clientID))
					.catch(() => {});
				await deleteCustomDomainForProject(
					env,
					cfClient,
					cfDomaineCreate.id as string,
				).catch(() => {});
				return {
					success: false,
					error: "Failed to create user table for project",
				};
			});
	} catch (error) {
		await insertLog({
			type: "error",
			clientID: env.PUBLIC_CLIENT_ID,
			message: error instanceof Error ? error.message : String(error),
			database: env.PROJECT_DB,
			endpoint: "/api/projects",
			context: {
				...(error instanceof CloudflareClientError
					? { cloudflareErrorData: error.data }
					: {}),
				stack: error instanceof Error ? error.stack : undefined,
			},
		});
		console.error("Error in POST /api/projects:", error);
		return {
			success: false,
			error:
				"Invalid request body: " +
				(error instanceof Error ? error.message : String(error)),
		};
	}
}
