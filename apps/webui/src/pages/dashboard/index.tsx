"use client";

import type { DashboardAlert } from "@api/dashboard";
import { UsageChart } from "@components/UsageChart";
import { useDashboard } from "@hooks/useDashboard";
import { useProjects } from "@hooks/useProjects";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getCurrentIssuerVersion,
	getCurrentWebUiVersion,
	getLatestVersion,
} from "../../version-check";

const typeTone: Record<"info" | "warning" | "error", string> = {
	info: "bg-blue-500/10 text-blue-200 border border-blue-500/30",
	warning: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
	error: "bg-red-500/10 text-red-200 border border-red-500/30",
};

const typeLabel: Record<"info" | "warning" | "error", string> = {
	info: "Info",
	warning: "Warning",
	error: "Error",
};

const typeIcon: Record<"info" | "warning" | "error", string> = {
	info: "lucide:info",
	warning: "lucide:alert-triangle",
	error: "lucide:alert-circle",
};

const formatDate = (iso: string) => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(iso));
	} catch (_) {
		return iso;
	}
};

function StatCard({
	label,
	value,
	tone,
	icon,
}: {
	label: string;
	value: number | string;
	tone: string;
	icon: string;
}) {
	return (
		<div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3">
			<div className="min-w-0">
				<p className="text-base font-medium text-gray-400">{label}</p>
				<p className={`text-2xl font-semibold leading-tight mt-1 ${tone}`}>
					{value}
				</p>
			</div>
			<Icon icon={icon} className={`w-10 h-10 shrink-0 ${tone} opacity-80`} />
		</div>
	);
}

function StatCardSkeleton() {
	return (
		<div className="bg-gray-900 border border-gray-800 rounded-xl p-3 animate-pulse">
			<div className="h-4 w-16 bg-gray-700 rounded mb-1" />
			<div className="h-8 w-12 bg-gray-700 rounded" />
		</div>
	);
}

function ChartSkeleton() {
	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 p-4 animate-pulse">
			<div className="h-5 w-48 bg-gray-700 rounded mb-4" />
			<div className="h-64 bg-gray-700/50 rounded flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600" />
			</div>
		</div>
	);
}

function RecentActivitySkeleton() {
	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 p-4 animate-pulse">
			<div className="flex items-center justify-between mb-4">
				<div className="h-5 w-32 bg-gray-700 rounded" />
				<div className="h-4 w-16 bg-gray-700 rounded" />
			</div>
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="flex gap-3 py-2 border-b border-gray-700 last:border-0"
					>
						<div className="h-5 w-12 bg-gray-700 rounded shrink-0" />
						<div className="h-4 flex-1 bg-gray-700/70 rounded" />
						<div className="h-4 w-20 bg-gray-700/50 rounded shrink-0" />
					</div>
				))}
			</div>
		</div>
	);
}

function ProjectCardSkeleton() {
	return (
		<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div className="w-3 h-3 rounded-full bg-gray-600" />
					<div className="h-5 w-24 bg-gray-700 rounded" />
				</div>
				<div className="h-5 w-14 bg-gray-700 rounded" />
			</div>
			<div className="space-y-2 mb-4">
				<div className="h-4 w-full bg-gray-700/70 rounded" />
				<div className="h-4 w-3/4 bg-gray-700/70 rounded" />
				<div className="h-4 w-1/2 bg-gray-700/70 rounded" />
			</div>
			<div className="flex gap-2">
				<div className="flex-1 h-9 bg-gray-700 rounded" />
				<div className="h-9 w-20 bg-gray-700 rounded" />
			</div>
		</div>
	);
}

export default function AdminPanel() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newName, setNewName] = useState("");
	const [createError, setCreateError] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [versionOutdated, setVersionOutdated] = useState(false);

	const projectHook = useProjects();
	const dashboard = useDashboard({ pollInterval: 60000 * 5 }); // Refresh every 5 minutes

	const checkVersions = useCallback(async () => {
		if (process.env.NODE_ENV === "development") return;
		try {
			const [latestWebUI, latestIssuer] = await Promise.all([
				getLatestVersion("OpenAuthSter-webUI"),
				getLatestVersion("OpenAuthSter-issuer"),
			]);
			const currentWebUI = getCurrentWebUiVersion();
			const currentIssuer = await getCurrentIssuerVersion(
				process.env.PUBLIC_ISSUER ?? "",
			);
			setVersionOutdated(
				currentWebUI !== latestWebUI || currentIssuer !== latestIssuer,
			);
		} catch (_) {
			// Ignore version check errors
		}
	}, []);

	useEffect(() => {
		checkVersions();
	}, [checkVersions]);

	const allAlerts = useMemo((): DashboardAlert[] => {
		const apiAlerts = dashboard.data?.alerts ?? [];
		if (versionOutdated) {
			return [
				...apiAlerts,
				{
					type: "version_outdated",
					message:
						"A newer version of OpenAuthSter is available. Update for the latest features.",
				},
			];
		}
		return apiAlerts;
	}, [dashboard.data?.alerts, versionOutdated]);

	const handleCreate = async () => {
		if (!newName.trim()) {
			setCreateError("Project name is required");
			return;
		}

		setIsCreating(true);
		setCreateError("");

		try {
			await projectHook.createProject(newName.trim());
			setShowCreateModal(false);
			setNewName("");
			await dashboard.refetch();
		} catch (err) {
			setCreateError(
				err instanceof Error ? err.message : "Failed to create project",
			);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDelete = async (clientID: string) => {
		setIsDeleting(true);
		try {
			await projectHook.deleteProject(clientID);
			setDeleteConfirm(null);
			await dashboard.refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete project");
		} finally {
			setIsDeleting(false);
		}
	};

	const getProjectStats = (clientID: string) =>
		dashboard.data?.projectStats.find((s) => s.clientID === clientID);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
						<Icon
							icon="lucide:layout-dashboard"
							className="w-8 h-8 text-blue-400"
						/>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-white">Dashboard</h2>
						<p className="text-gray-400 mt-1">
							Manage authentication providers for your projects
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setShowCreateModal(true)}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
				>
					<Icon icon="lucide:plus" className="w-5 h-5" />
					<span>New Project</span>
				</button>
			</div>

			{/* KPIs */}
			{!dashboard.data ? (
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<StatCardSkeleton key={i} />
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Projects"
						value={dashboard.data.kpis.totalProjects}
						tone="text-white"
						icon="lucide:folder-kanban"
					/>
					<StatCard
						label="Users"
						value={dashboard.data.kpis.totalUsers}
						tone="text-blue-200"
						icon="lucide:users"
					/>
					<StatCard
						label="Errors (24h)"
						value={dashboard.data.kpis.totalErrors24h}
						tone="text-red-200"
						icon="lucide:alert-circle"
					/>
					<StatCard
						label="Webhooks"
						value={dashboard.data.kpis.totalWebhooks}
						tone="text-green-200"
						icon="lucide:webhook"
					/>
				</div>
			)}

			{/* Usage chart */}
			{!dashboard.data ? (
				<ChartSkeleton />
			) : (
				<UsageChart
					usageOverTime={dashboard.data.usageOverTime}
					isLoading={false}
				/>
			)}

			{/* Alerts */}
			{allAlerts.length > 0 && (
				<div className="space-y-2">
					{allAlerts.map((alert) => (
						<div
							key={alert.message}
							className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
						>
							<Icon
								icon="lucide:alert-triangle"
								className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-amber-200">{alert.message}</p>
								<div className="mt-2 flex gap-2">
									{alert.type === "errors" && alert.projectId && (
										<a
											href={`/dashboard/activity?project_id=${encodeURIComponent(
												alert.projectId,
											)}`}
											className="text-xs text-amber-300 hover:text-amber-200 underline inline-flex items-center gap-1"
										>
											<Icon icon="lucide:scroll-text" className="w-3.5 h-3.5" />
											View logs
										</a>
									)}
									{alert.type === "webhook_failure" && alert.projectId && (
										<a
											href={`/dashboard/project?project_id=${encodeURIComponent(
												alert.projectId,
											)}`}
											className="text-xs text-amber-300 hover:text-amber-200 underline inline-flex items-center gap-1"
										>
											<Icon icon="lucide:settings" className="w-3.5 h-3.5" />
											Configure
										</a>
									)}
									{alert.type === "version_outdated" && (
										<a
											href="/dashboard/configurations"
											className="text-xs text-amber-300 hover:text-amber-200 underline inline-flex items-center gap-1"
										>
											<Icon icon="lucide:download" className="w-3.5 h-3.5" />
											Check updates
										</a>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Recent activity */}
			{!dashboard.data ? (
				<RecentActivitySkeleton />
			) : (
				dashboard.data &&
				dashboard.data.recentLogs.length > 0 && (
					<div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-white flex items-center gap-2">
								<Icon
									icon="lucide:activity"
									className="w-5 h-5 text-blue-400"
								/>
								Recent activity
							</h3>
							<a
								href="/dashboard/activity"
								className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
							>
								View all
								<Icon icon="lucide:arrow-right" className="w-4 h-4" />
							</a>
						</div>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{dashboard.data.recentLogs.slice(0, 10).map((log) => (
								<div
									key={log.id}
									className="flex items-start gap-3 py-2 border-b border-gray-700 last:border-0"
								>
									<span
										className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1 ${
											typeTone[log.type]
										}`}
									>
										<Icon icon={typeIcon[log.type]} className="w-3.5 h-3.5" />
										{typeLabel[log.type]}
									</span>
									<p className="text-sm text-gray-300 line-clamp-2 flex-1 min-w-0">
										{log.message}
									</p>
									<span className="text-xs text-gray-500 shrink-0">
										{
											projectHook.projects.find(
												(p) => p.clientID === log.clientID,
											)?.name
										}
									</span>
									<span className="text-xs text-gray-500 shrink-0">
										{formatDate(log.timestamp)}
									</span>
								</div>
							))}
						</div>
					</div>
				)
			)}

			{/* Project Grid */}
			{projectHook.isLoading ? (
				<div>
					<div className="h-6 w-24 bg-gray-700 rounded animate-pulse mb-4" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<ProjectCardSkeleton key={i} />
						))}
					</div>
				</div>
			) : projectHook.projects.length === 0 ? (
				<div className="bg-gray-800 rounded-lg p-12 text-center">
					<Icon
						icon="lucide:package"
						className="w-12 h-12 mx-auto mb-4 text-gray-500"
					/>
					<h3 className="text-xl font-medium text-white mb-2">
						No projects yet
					</h3>
					<p className="text-gray-400 mb-6">
						Create your first project to start configuring authentication
						providers
					</p>
					<button
						type="button"
						onClick={() => setShowCreateModal(true)}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
					>
						<Icon icon="lucide:plus" className="w-5 h-5" />
						Create Project
					</button>
				</div>
			) : (
				<div>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
						<Icon
							icon="lucide:folder-kanban"
							className="w-5 h-5 text-blue-400"
						/>
						Projects
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{projectHook.projects.map((project) => {
							const stats = getProjectStats(project.clientID);
							const hasRecentErrors = (stats?.errorsCount24h ?? 0) > 0;

							return (
								<div
									key={project.clientID}
									className={`bg-gray-800 rounded-lg p-6 border transition-colors ${
										hasRecentErrors
											? "border-red-500/50 hover:border-red-500/70"
											: "border-gray-700 hover:border-gray-600"
									}`}
								>
									<div className="flex items-start justify-between mb-4">
										<div className="flex items-center space-x-3">
											<div
												className={`p-1.5 rounded-lg ${
													project.active
														? "bg-green-500/20 text-green-400"
														: "bg-gray-600/50 text-gray-500"
												}`}
											>
												<Icon
													icon={
														project.active
															? "lucide:folder-open"
															: "lucide:folder"
													}
													className="w-4 h-4"
												/>
											</div>
											<h3 className="text-xl font-semibold text-white truncate max-w-45">
												{project.name}
											</h3>
										</div>
										<span
											className={`px-2 py-1 text-xs rounded ${
												project.active
													? "bg-green-500/10 text-green-400"
													: "bg-gray-500/10 text-gray-400"
											}`}
										>
											{project.active ? "Active" : "Inactive"}
										</span>
									</div>

									<div className="text-sm text-gray-400 mb-4 space-y-2">
										<div className="flex items-center gap-2">
											<Icon
												icon="lucide:calendar"
												className="w-4 h-4 shrink-0 text-gray-500"
											/>
											<span>
												Created:{" "}
												{new Date(project.created_at).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Icon
												icon="lucide:shield-check"
												className="w-4 h-4 shrink-0 text-gray-500"
											/>
											<span>
												Providers:{" "}
												{project?.providers_data?.filter((p) => p.enabled)
													.length || 0}{" "}
												enabled
											</span>
										</div>
										{stats !== undefined && (
											<>
												<div className="flex items-center gap-2">
													<Icon
														icon="lucide:users"
														className="w-4 h-4 shrink-0 text-gray-500"
													/>
													<span>Users: {stats.userCount}</span>
												</div>
												<div className="flex items-center gap-2">
													<Icon
														icon="lucide:webhook"
														className="w-4 h-4 shrink-0 text-gray-500"
													/>
													<span>Webhooks: {stats.webhookCount}</span>
												</div>
												{stats.lastError && (
													<div
														className="flex items-center gap-2 text-red-400 truncate"
														title={stats.lastError.message}
													>
														<Icon
															icon="lucide:alert-circle"
															className="w-4 h-4 shrink-0"
														/>
														<span>
															Last error:{" "}
															{stats.lastError.message.length > 40
																? stats.lastError.message.slice(0, 40) + "…"
																: stats.lastError.message}
														</span>
													</div>
												)}
											</>
										)}
									</div>

									<div className="flex space-x-2">
										<a
											href={`/dashboard/project?project_id=${encodeURIComponent(
												project.clientID,
											)}`}
											className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors text-center inline-flex items-center justify-center gap-2"
										>
											<Icon icon="lucide:settings" className="w-4 h-4" />
											Manage
										</a>
										<button
											type="button"
											onClick={() => setDeleteConfirm(project.clientID)}
											className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
										>
											<Icon icon="lucide:trash-2" className="w-4 h-4" />
											Delete
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
						<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
							<Icon
								icon="lucide:folder-plus"
								className="w-6 h-6 text-blue-400"
							/>
							Create New Project
						</h3>

						{createError && (
							<div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
								<Icon icon="lucide:alert-circle" className="w-5 h-5 shrink-0" />
								{createError}
							</div>
						)}

						<div className="mb-6">
							<label
								className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2"
								htmlFor="client-id-tag"
							>
								<Icon icon="lucide:tag" className="w-4 h-4 text-gray-500" />
								Project Name
							</label>
							<input
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="My Project"
							/>
							<p className="text-gray-500 text-sm mt-2">
								A unique identifier for your project (e.g., my-app, web-client)
							</p>
						</div>

						<div className="flex space-x-3">
							<button
								type="button"
								onClick={() => {
									setShowCreateModal(false);
									setNewName("");
									setCreateError("");
								}}
								className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
							>
								<Icon icon="lucide:x" className="w-4 h-4" />
								Cancel
							</button>
							<button
								type="button"
								onClick={handleCreate}
								disabled={isCreating}
								className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
							>
								{isCreating ? (
									<>
										<Icon
											icon="lucide:loader-2"
											className="w-4 h-4 animate-spin"
										/>
										Creating...
									</>
								) : (
									<>
										<Icon icon="lucide:plus" className="w-4 h-4" />
										Create
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
						<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
							<Icon icon="lucide:trash-2" className="w-6 h-6 text-red-400" />
							Delete Project
						</h3>
						<p className="text-gray-300 mb-6">
							Are you sure you want to delete{" "}
							<span className="text-white font-semibold">{deleteConfirm}</span>?
							This action cannot be undone.
						</p>
						<div className="flex space-x-3">
							<button
								type="button"
								onClick={() => setDeleteConfirm(null)}
								className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
							>
								<Icon icon="lucide:x" className="w-4 h-4" />
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleDelete(deleteConfirm)}
								disabled={isDeleting}
								className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
							>
								<Icon
									icon={isDeleting ? "lucide:loader-circle" : "lucide:trash-2"}
									className={`w-4 h-4 ${isDeleting ? "animate-spin" : ""}`}
								/>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
