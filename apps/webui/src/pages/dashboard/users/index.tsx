"use client";

import { ReadonlyJsonEditor } from "@components/ReadonlyJsonEditor";
import { PUT as updateUserData } from "@api/users";
import { useParams } from "@hooks/useParams";
import { useProject, useProjects } from "@hooks/useProjects";
import { useProjectUsers } from "@hooks/useProjectUsers";
import { Icon } from "@iconify/react";
import { navigate } from "@utils";
import { useEffect, useState } from "react";

export default function UserListPage() {
	const { project_id: clientID } = useParams<{ project_id: string }>();

	const projectsHook = useProjects();
	const projectHook = useProject(clientID);
	const [searchInput, setSearchInput] = useState("");
	const [selectedUser, setSelectedUser] = useState<null | Record<
		string,
		unknown
	>>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [editingUser, setEditingUser] = useState<null | Record<
		string,
		unknown
	>>(null);

	const {
		users,
		total,
		page,
		pageSize,
		isLoading,
		error,
		setPage,
		setSearch,
		refetch,
		deleteUser,
	} = useProjectUsers(clientID, { pageSize: 12 });

	useEffect(() => {
		const handle = setTimeout(() => setSearch(searchInput.trim()), 300);
		return () => clearTimeout(handle);
	}, [searchInput, setSearch]);

	useEffect(() => {
		if (typeof document === "undefined") return;
		const prevOverflow = document.body.style.overflow;
		if (selectedUser) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, [selectedUser]);

	const handleProjectChange = (value: string) => {
		if (!value || typeof window === "undefined") return;
		const url = new URL(window.location.href);
		url.searchParams.set("project_id", value);
		navigate(url.toString());
	};

	const totalPages = Math.max(1, Math.ceil(total / pageSize || 1));

	const formatDate = (value: string) =>
		value ? new Date(value).toLocaleString() : "Unknown";

	const publicPreview = (data: Record<string, unknown> | null) => {
		if (!data || Object.keys(data).length === 0) return "—";
		const json = JSON.stringify(data);
		return json.length > 80 ? `${json.slice(0, 80)}…` : json;
	};

	const handleDelete = async (userID: string) => {
		if (!userID) return;
		if (typeof window !== "undefined") {
			const confirmed = window.confirm("Delete this user?");
			if (!confirmed) return;
		}

		setActionError(null);
		setDeletingId(userID);

		try {
			await deleteUser(userID);
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : "Failed to delete user",
			);
		} finally {
			setDeletingId(null);
		}
	};

	if (!clientID) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
				<div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-3">
					<p className="text-white text-lg font-semibold">Select a project</p>
					<p className="text-gray-400 text-sm">
						Choose a project to view its users.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 sm:items-center">
						<label className="text-sm text-gray-300" htmlFor="project-select">
							Project
						</label>
						<select
							id="project-select"
							className="flex-1 min-w-55 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={projectsHook.isLoading}
							value={""}
							onChange={(e) => handleProjectChange(e.target.value)}
						>
							<option value="" disabled>
								{projectsHook.isLoading
									? "Loading projects..."
									: "Select project"}
							</option>
							{projectsHook.projects.map((p) => (
								<option key={p.clientID} value={p.clientID}>
									{p.name}
								</option>
							))}
						</select>
					</div>
					{projectsHook.error && (
						<div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
							{projectsHook.error}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (projectHook.isLoading && !projectHook.project) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-start gap-4 md:items-center">
					<button
						type="button"
						className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
						onClick={() => window.history.back()}
					>
						← Back
					</button>
					<div>
						<p className="text-xs uppercase tracking-wide text-gray-400">
							Users · Project
						</p>
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-bold text-white">
								{projectHook.project?.name || "Loading project name..."}
							</h1>
							{projectHook.project && (
								<span
									className={`px-2 py-1 text-xs rounded ${
										projectHook.project.active
											? "bg-green-500/10 text-green-400"
											: "bg-gray-500/10 text-gray-400"
									}`}
								>
									{projectHook.project.active ? "Active" : "Inactive"}
								</span>
							)}
						</div>
						<p className="text-gray-400 text-sm">
							{total} user{total !== 1 ? "s" : ""} tracked for this project
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3 flex-wrap justify-end">
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<label className="text-sm text-gray-400" htmlFor="project-switcher">
							Project
						</label>
						<select
							id="project-switcher"
							className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-50"
							value={clientID}
							disabled={projectsHook.isLoading}
							onChange={(e) => handleProjectChange(e.target.value)}
						>
							{projectsHook.isLoading && <option>Loading...</option>}
							{!projectsHook.isLoading &&
								projectsHook.projects.map((p) => (
									<option key={p.clientID} value={p.clientID}>
										{p.name}
									</option>
								))}
						</select>
					</div>
					<span className="text-sm text-gray-400">
						Page {page} / {totalPages}
					</span>
					<button
						type="button"
						onClick={() => {
							void refetch();
						}}
						className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
					>
						Refresh
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
					{error}
				</div>
			)}
			{projectHook.error && (
				<div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
					{projectHook.error}
				</div>
			)}
			{actionError && (
				<div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
					{actionError}
				</div>
			)}

			<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
				<div className="flex flex-col sm:flex-row gap-4 sm:items-end">
					<div className="flex-1">
						<label
							className="block text-sm font-medium text-gray-300 mb-2"
							htmlFor="search-input"
						>
							Search users
						</label>
						<input
							type="text"
							id="search-input"
							placeholder="Search by identifier"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="flex items-center gap-2 self-start sm:self-end">
						<button
							type="button"
							onClick={() => setPage(Math.max(1, page - 1))}
							disabled={page <= 1 || isLoading}
							className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/60 text-white text-sm rounded-lg transition-colors"
						>
							Prev
						</button>
						<button
							type="button"
							onClick={() => setPage(Math.min(totalPages, page + 1))}
							disabled={page >= totalPages || isLoading}
							className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/60 text-white text-sm rounded-lg transition-colors"
						>
							Next
						</button>
					</div>
				</div>
			</div>

			<div className="bg-gray-800 border border-gray-700 rounded-lg">
				{isLoading ? (
					<div className="flex items-center justify-center py-16">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
					</div>
				) : users.length === 0 ? (
					<div className="py-12 text-center text-gray-400">
						<Icon
							icon="lucide:users"
							className="w-12 h-12 mx-auto mb-2 text-gray-500"
						/>
						<p className="text-lg text-white mb-1">No users yet</p>
						<p className="text-gray-400">
							Users will appear here after they authenticate with this project.
						</p>
					</div>
				) : (
					<>
						<div className="overflow-x-auto hidden md:block">
							<table className="min-w-full divide-y divide-gray-700">
								<thead className="bg-gray-900/50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											User
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Created
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Public Session
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Metadata
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-700">
									{users.map((user) => {
										const displayName =
											(user.data?.email as string | undefined) ||
											(user.data?.name as string | undefined) ||
											user.identifier;

										return (
											<tr
												key={user.id}
												className="hover:bg-gray-900/40 cursor-pointer"
												onClick={() =>
													setSelectedUser(user as Record<string, unknown>)
												}
											>
												<td className="px-6 py-4 whitespace-normal wrap-break-word max-w-xs md:max-w-sm">
													<div className="text-white font-medium">
														{displayName}
													</div>
													<div className="text-xs text-gray-400 break-all">
														{user.identifier}
													</div>
													<div className="text-[11px] text-gray-500 font-mono mt-1">
														{user.id}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
													{formatDate(user.created_at)}
												</td>
												<td className="px-6 py-4 text-sm text-gray-300 font-mono whitespace-pre-wrap wrap-break-word max-w-xs md:max-w-sm">
													{publicPreview(user.session_public)}
												</td>
												<td className="px-6 py-4 text-sm text-gray-300 font-mono whitespace-pre-wrap wrap-break-word max-w-xs md:max-w-sm">
													{publicPreview(user.data)}
												</td>
												<td className="px-6 py-4 text-sm text-gray-300">
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																setEditingUser(user as Record<string, unknown>);
															}}
															className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
														>
															Edit
														</button>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																handleDelete(user.id);
															}}
															disabled={deletingId === user.id || isLoading}
															className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/60 text-white rounded-lg transition-colors"
														>
															{deletingId === user.id
																? "Deleting..."
																: "Delete"}
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						<div className="md:hidden divide-y divide-gray-800">
							{users.map((user) => {
								const displayName =
									(user.data?.email as string | undefined) ||
									(user.data?.name as string | undefined) ||
									user.identifier;

								return (
									<button
										type="button"
										key={user.id}
										tabIndex={0}
										onClick={() =>
											setSelectedUser(user as Record<string, unknown>)
										}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setSelectedUser(user as Record<string, unknown>);
											}
										}}
										className="w-full text-left p-4 flex flex-col gap-2 bg-gray-900/40 hover:bg-gray-900 cursor-pointer"
									>
										<div className="flex items-center justify-between gap-2">
											<div className="text-white font-semibold truncate">
												{displayName}
											</div>
											<span className="text-[11px] text-gray-500 font-mono truncate">
												{user.id}
											</span>
										</div>
										<div className="text-xs text-gray-400 break-all">
											{user.identifier}
										</div>
										<div className="text-xs text-gray-400">
											Created: {formatDate(user.created_at)}
										</div>
										<div className="text-xs text-gray-300 font-mono whitespace-pre-wrap wrap-break-word">
											Public: {publicPreview(user.session_public)}
										</div>
										<div className="text-xs text-gray-300 font-mono whitespace-pre-wrap wrap-break-word">
											Meta: {publicPreview(user.data)}
										</div>
										<div className="pt-2 flex gap-2">
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setEditingUser(user as Record<string, unknown>);
												}}
												className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(user.id);
												}}
												disabled={deletingId === user.id || isLoading}
												className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/60 text-white text-sm rounded-lg transition-colors"
											>
												{deletingId === user.id ? "Deleting..." : "Delete"}
											</button>
										</div>
									</button>
								);
							})}
						</div>
					</>
				)}
			</div>

			{editingUser && (
				<EditUserModal
					user={editingUser}
					clientID={clientID}
					availableRoles={
						(projectHook.project?.projectData?.roles as string[] | undefined) ||
						[]
					}
					onClose={() => setEditingUser(null)}
					onSaved={() => {
						setEditingUser(null);
						void refetch();
					}}
					setActionError={setActionError}
				/>
			)}
			{selectedUser && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
					<div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-auto">
						<div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
							<div>
								<p className="text-sm text-gray-400">User detail</p>
								<p className="text-white font-semibold break-all">
									{selectedUser["identifier"] as string | undefined}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setSelectedUser(null)}
								className="px-3 py-2 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-lg"
							>
								Close
							</button>
						</div>
						<div className="p-4 bg-gray-950 h-[70vh] sm:h-[60vh] min-h-0">
							<div className="h-full overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
								<ReadonlyJsonEditor
									value={selectedUser}
									path="user-detail.json"
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function EditUserModal({
	user,
	clientID,
	availableRoles,
	onClose,
	onSaved,
	setActionError,
}: {
	user: Record<string, unknown>;
	clientID: string;
	availableRoles: string[];
	onClose: () => void;
	onSaved: () => void;
	setActionError: (err: string | null) => void;
}) {
	const [role, setRole] = useState<string>((user.role as string | null) ?? "");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		setActionError(null);
		try {
			const res = await updateUserData(
				{ project_id: clientID, user_id: user.id as string },
				// biome-ignore lint/suspicious/noExplicitAny: role is dynamic
				{ role: (role || undefined) as any },
			);
			if (res instanceof Response) {
				if (!res.ok) throw new Error(await res.text());
			} else if (!res.success) {
				throw new Error(res.error || "Failed to update user");
			}
			onSaved();
		} catch (err) {
			setActionError(
				err instanceof Error ? err.message : "Failed to update user",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const displayName =
		((user.data as Record<string, unknown> | null)?.email as
			| string
			| undefined) || (user.identifier as string);

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
			<div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl w-full max-w-md">
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
					<div>
						<p className="text-sm text-gray-400">Edit user</p>
						<p className="text-white font-semibold break-all">{displayName}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
						title="Close"
					>
						<Icon icon="lucide:x" className="w-5 h-5" />
					</button>
				</div>

				<div className="p-5 space-y-4">
					<div>
						<label
							className="block text-sm font-medium text-gray-300 mb-2"
							htmlFor="user-role-select"
						>
							Role
						</label>
						{availableRoles.length > 0 ? (
							<select
								id="user-role-select"
								value={role}
								onChange={(e) => setRole(e.target.value)}
								disabled={isSaving}
								className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
							>
								<option value="">No role</option>
								{availableRoles.map((r) => (
									<option key={r} value={r}>
										{r}
									</option>
								))}
							</select>
						) : (
							<input
								id="user-role-select"
								type="text"
								value={role}
								onChange={(e) => setRole(e.target.value)}
								disabled={isSaving}
								placeholder="Enter role"
								className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
							/>
						)}
						{availableRoles.length === 0 && (
							<p className="text-gray-500 text-xs mt-1">
								No roles defined for this project. Configure roles in{" "}
								<a
									href={`/dashboard/project?project_id=${clientID}`}
									className="text-blue-400 hover:underline"
								>
									Project Settings
								</a>
								.
							</p>
						)}
					</div>
				</div>

				<div className="flex gap-3 px-5 py-4 border-t border-gray-800">
					<button
						type="button"
						onClick={onClose}
						disabled={isSaving}
						className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving}
						className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
					>
						{isSaving ? (
							<>
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
