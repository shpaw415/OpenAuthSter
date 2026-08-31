import type { RequestDataContext } from "@auth";
import { onSelfHosted, ownerGroupConditions } from "@utils/server";
import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import type { Project } from "openauth-webui-shared-types";
import {
	createWebUiProject,
	LogsTable,
	OTFusersTable,
	projectTable,
	WebHookTable,
} from "openauth-webui-shared-types/database";
import {
	and,
	desc,
	drizzle,
	eq,
	gt,
	or,
	sql,
} from "openauth-webui-shared-types/drizzle";

export type DashboardKPIs = {
	totalProjects: number;
	totalUsers: number;
	totalErrors24h: number;
	totalWebhooks: number;
};

export type ProjectStats = {
	clientID: string;
	userCount: number;
	webhookCount: number;
	lastError: { message: string; timestamp: string } | null;
	errorsCount24h: number;
};

export type RecentLog = {
	id: string;
	clientID: string;
	type: "info" | "warning" | "error";
	message: string;
	timestamp: string;
};

export type DashboardAlert = {
	type: "errors" | "webhook_failure" | "version_outdated";
	projectId?: string;
	message: string;
	count?: number;
};

const USAGE_COLOR_PALETTE = [
	"#3B82F6",
	"#10B981",
	"#F59E0B",
	"#EF4444",
	"#8B5CF6",
	"#EC4899",
	"#06B6D4",
	"#84CC16",
	"#F97316",
	"#6366F1",
	"#14B8A6",
	"#A855F7",
];

export type UsageSeries = {
	name: string;
	color: string;
	counts: number[];
};

export type UsageOverTime = {
	buckets: string[];
	series: UsageSeries[];
};

export type DashboardData = {
	kpis: DashboardKPIs;
	projectStats: ProjectStats[];
	recentLogs: RecentLog[];
	alerts: DashboardAlert[];
	usageOverTime: UsageOverTime;
};

// GET /api/dashboard - Aggregated dashboard data
export async function GET(): Promise<{
	success: boolean;
	error?: string;
	data?: DashboardData;
}> {
	const { env, data } = getContext<Env, "", RequestDataContext>(arguments);
	const db = drizzle(env.PROJECT_DB);

	const session = await data.client.getUserSession("private");
	if (session instanceof Error) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	try {
		// 1. Fetch projects
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

		if (projects.length === 0) {
			return {
				success: true,
				data: {
					kpis: {
						totalProjects: 0,
						totalUsers: 0,
						totalErrors24h: 0,
						totalWebhooks: 0,
					},
					projectStats: [],
					recentLogs: [],
					alerts: [],
					usageOverTime: {
						buckets: [],
						series: [],
					},
				},
			};
		}

		const projectStatsMap = new Map<
			string,
			Omit<ProjectStats, "clientID"> & { clientID: string }
		>();

		// Initialize project stats
		for (const p of projects) {
			projectStatsMap.set(p.clientID, {
				clientID: p.clientID,
				userCount: 0,
				webhookCount: 0,
				lastError: null,
				errorsCount24h: 0,
			});
		}

		// 2. User count per project
		for (const p of projects) {
			try {
				const usersTable = OTFusersTable(p.clientID);
				const countRow = await db
					.select({ count: sql<number>`count(*)` })
					.from(usersTable)
					.get();
				const stats = projectStatsMap.get(p.clientID);
				if (stats) {
					stats.userCount = (countRow?.count as number) ?? 0;
				}
			} catch (_) {
				// Table may not exist for some edge cases
			}
		}

		// 3. Webhooks - fetch all and group by clientID
		const webhooks = await db
			.select()
			.from(WebHookTable)
			.where(or(...projects.map((p) => eq(WebHookTable.clientID, p.clientID))));
		const webhookCountByProject = new Map<string, number>();
		for (const wh of webhooks) {
			const c = webhookCountByProject.get(wh.clientID) ?? 0;
			webhookCountByProject.set(wh.clientID, c + 1);
		}
		for (const [clientID, count] of webhookCountByProject) {
			const stats = projectStatsMap.get(clientID);
			if (stats) stats.webhookCount = count;
		}

		// 4. Recent logs (all projects, limit 15)
		const recentLogsRows = await db
			.select({
				id: LogsTable.id,
				clientID: LogsTable.clientID,
				type: LogsTable.type,
				message: LogsTable.message,
				timestamp: LogsTable.timestamp,
			})
			.from(LogsTable)
			.where(or(...projects.map((p) => eq(LogsTable.clientID, p.clientID))))
			.orderBy(desc(LogsTable.timestamp))
			.limit(15);

		const recentLogs: RecentLog[] = recentLogsRows.map((row) => ({
			id: row.id,
			clientID: row.clientID,
			type: row.type as "info" | "warning" | "error",
			message: row.message,
			timestamp: row.timestamp,
		}));

		// 5. Errors in last 24h - SQLite: timestamp is ISO string, compare with datetime
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
		const errors24hRows = await db
			.select()
			.from(LogsTable)
			.where(
				and(
					eq(LogsTable.type, "error"),
					gt(LogsTable.timestamp, oneDayAgo),
					or(...projects.map((p) => eq(LogsTable.clientID, p.clientID))),
				),
			);

		const totalErrors24h = errors24hRows.length;

		// Per-project error counts and last error
		const errorsByProject = new Map<string, typeof errors24hRows>();
		for (const row of errors24hRows) {
			const arr = errorsByProject.get(row.clientID) ?? [];
			arr.push(row);
			errorsByProject.set(row.clientID, arr);
		}

		for (const [clientID, errs] of errorsByProject) {
			const stats = projectStatsMap.get(clientID);
			if (stats) {
				stats.errorsCount24h = errs.length;
				// Last error = most recent (errors24hRows are not necessarily sorted by project, but we have them)
				const sorted = [...errs].sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				);
				stats.lastError = {
					message: sorted.at(0)?.message ?? "Unknown error",
					timestamp: sorted.at(0)?.timestamp ?? "Unknown timestamp",
				};
			}
		}

		// For projects with errors but no lastError set yet (from all logs)
		const allErrorLogs = await db
			.select()
			.from(LogsTable)
			.where(
				and(
					eq(LogsTable.type, "error"),
					or(...projects.map((p) => eq(LogsTable.clientID, p.clientID))),
				),
			)
			.orderBy(desc(LogsTable.timestamp));

		for (const row of allErrorLogs) {
			const stats = projectStatsMap.get(row.clientID);
			if (stats && !stats.lastError) {
				stats.lastError = {
					message: row.message ?? "Unknown error",
					timestamp: row.timestamp ?? "Unknown timestamp",
				};
			}
		}

		// 6. Build alerts
		const alerts: DashboardAlert[] = [];

		for (const stats of projectStatsMap.values()) {
			if (stats.errorsCount24h > 0) {
				alerts.push({
					type: "errors",
					projectId: stats.clientID,
					message: `Project \`${projects.find((p) => p.clientID === stats.clientID)?.name || stats.clientID}\` has ${stats.errorsCount24h} error(s) in the last 24 hours`,
					count: stats.errorsCount24h,
				});
			}
		}

		// Webhook failures - check recent logs for "webhook" and "fail"
		for (const log of recentLogsRows) {
			const msg = (log.message || "").toLowerCase();
			if (msg.includes("webhook") && msg.includes("fail")) {
				const existing = alerts.find(
					(a) => a.type === "webhook_failure" && a.projectId === log.clientID,
				);
				if (!existing) {
					alerts.push({
						type: "webhook_failure",
						projectId: log.clientID,
						message: `Webhook delivery failed for project ${log.clientID}`,
					});
				}
			}
		}

		// 7. Build KPIs
		const totalUsers = [...projectStatsMap.values()].reduce(
			(sum, s) => sum + s.userCount,
			0,
		);
		const totalWebhooks = webhooks.length;

		const kpis: DashboardKPIs = {
			totalProjects: projects.length,
			totalUsers,
			totalErrors24h,
			totalWebhooks,
		};

		// 8. Usage over time (last 24h, hourly buckets)
		const logs24hRows = await db
			.select({ clientID: LogsTable.clientID, timestamp: LogsTable.timestamp })
			.from(LogsTable)
			.where(
				and(
					gt(LogsTable.timestamp, oneDayAgo),
					or(...projects.map((p) => eq(LogsTable.clientID, p.clientID))),
				),
			);

		const now = new Date();
		const buckets: string[] = [];
		for (let i = 23; i >= 0; i--) {
			const d = new Date(now.getTime() - i * 60 * 60 * 1000);
			buckets.push(
				`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
					2,
					"0",
				)}-${String(d.getDate()).padStart(2, "0")}T${String(
					d.getHours(),
				).padStart(2, "0")}:00`,
			);
		}

		const bucketToIndex = new Map(buckets.map((b, i) => [b, i]));

		const countByProjectAndBucket = new Map<string, number[]>();
		for (const p of projects) {
			countByProjectAndBucket.set(p.clientID, Array(buckets.length).fill(0));
		}

		for (const row of logs24hRows) {
			const d = new Date(row.timestamp);
			const bucketKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
				2,
				"0",
			)}-${String(d.getDate()).padStart(2, "0")}T${String(
				d.getHours(),
			).padStart(2, "0")}:00`;
			const idx = bucketToIndex.get(bucketKey);
			if (idx !== undefined) {
				const arr = countByProjectAndBucket.get(row.clientID);
				if (arr?.[idx] !== undefined) arr[idx]++;
				else {
					const newArr = Array(buckets.length).fill(0);
					newArr[idx] = 1;
					countByProjectAndBucket.set(row.clientID, newArr);
				}
			}
		}

		const usageSeries: UsageSeries[] = projects.map((p, i) => ({
			name: p.name,
			color: USAGE_COLOR_PALETTE[i % USAGE_COLOR_PALETTE.length] as string,
			counts:
				countByProjectAndBucket.get(p.clientID) ??
				Array(buckets.length).fill(0),
		}));

		const usageOverTime: UsageOverTime = { buckets, series: usageSeries };

		return {
			success: true,
			data: {
				kpis,
				projectStats: [...projectStatsMap.values()],
				recentLogs,
				alerts,
				usageOverTime,
			},
		};
	} catch (error) {
		console.error("Dashboard API error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to load dashboard",
		};
	}
}
