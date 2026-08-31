import { POST as createInviteLink } from "@api/invitelink";
import { AppSnackbar } from "@components/AppSnackbar";
import { FunctionEditorModal } from "@components/FunctionEditorModal";
import { SelectWrapper, TemplateSelection } from "@components/InputFields";
import { ProviderIcon } from "@components/provider-icons";
import { useCopyTemplates } from "@hooks/useCopyTemplates";
import { useParams } from "@hooks/useParams";
import { useProject } from "@hooks/useProjects";
import { useUIThemes } from "@hooks/useUIThemes";
import { useWebHook } from "@hooks/useWebHook";
import { Icon } from "@iconify/react";
import type {
	Project,
	ProjectData,
	ProviderCategory,
	ProviderConfig,
	ProviderType,
} from "openauth-webui-shared-types";
import {
	getProviderMeta,
	getProvidersByCategory,
} from "openauth-webui-shared-types";
import type {
	ExtendedWebHookConfig,
	WebHookConfig,
	WebHookEvents,
} from "openauth-webui-shared-types/webhook/types";
import { WebHookEventsDetails } from "openauth-webui-shared-types/webhook/types";
import { useCallback, useEffect, useState } from "react";

const CATEGORIES: { id: ProviderCategory; label: string; icon: string }[] = [
	{ id: "social", label: "Social", icon: "lucide:users" },
	{ id: "enterprise", label: "Enterprise", icon: "lucide:building-2" },
	{ id: "custom", label: "Custom", icon: "lucide:wrench" },
	{ id: "form", label: "Form-based", icon: "lucide:file-text" },
];

const STANDARD_PROJECT_DATA_FIELDS = [
	"appName",
	"companyName",
	"supportEmail",
	"websiteUrl",
	"logoUrl",
	"primaryColor",
	"emailFrom",
	"roles",
] as const;

const WEBHOOK_EVENT_OPTIONS = WebHookEventsDetails;

const getWebHookEventLabel = (event: WebHookEvents) => {
	return (
		WEBHOOK_EVENT_OPTIONS.find((option) => option.event === event)?.label ||
		event
	);
};

export default function ProjectDetail() {
	const params = useParams<{
		project_id: string;
		category?: ProviderCategory;
	}>();
	const projectHook = useProject(params.project_id);
	const { themes, isLoading: themesLoading } = useUIThemes();
	const [activeCategory, setActiveCategory] = useState<ProviderCategory>(
		params.category || "social",
	);
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState<{
		message: string;
	} | null>(null);
	const [isProjectDataExpanded, setIsProjectDataExpanded] = useState(false);
	const [projectData, setProjectData] = useState<ProjectData>({});
	const [customFieldKey, setCustomFieldKey] = useState("");
	const [fnEditorModal, setFnEditorModal] = useState<{
		key: string;
		draft: string;
	} | null>(null);

	useEffect(() => {
		if (!params.category) return;
		if (activeCategory === params.category) return;
		setActiveCategory(params.category);
	}, [params.category, activeCategory]);

	// Sync projectData when project loads
	useEffect(() => {
		if (projectHook.project?.projectData) {
			setProjectData(projectHook.project.projectData);
		}
	}, [projectHook.project?.projectData]);

	const providers = projectHook.project?.providers_data || [];

	const getProviderConfig = (
		type: ProviderType,
	): ProviderConfig | undefined => {
		return providers.find((p) => p.type === type);
	};

	const handleRemoveProvider = async (type: ProviderType) => {
		if (!confirm(`Remove ${getProviderMeta(type)?.name} provider?`)) return;

		setIsSaving(true);
		try {
			const newProviders = providers.filter((p) => p.type !== type);
			await projectHook.updateProviders(newProviders);
			setNotification({ message: "Provider removed" });
		} catch (err) {
			setNotification({
				message:
					err instanceof Error ? err.message : "Failed to remove provider",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleToggleProvider = async (type: ProviderType) => {
		const existing = getProviderConfig(type);
		if (!existing) return;

		setIsSaving(true);
		try {
			const newProviders = providers.map((p) =>
				p.type === type ? { ...p, enabled: !p.enabled } : p,
			);
			await projectHook.updateProviders(newProviders);
		} catch (err) {
			setNotification({
				message:
					err instanceof Error ? err.message : "Failed to toggle provider",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const {
		webhooks,
		registerWebHook,
		getWebHooks,
		deleteWebHook,
		updateWebHook,
	} = useWebHook(projectHook.project?.clientID || "");
	const [isWebHookModalOpen, setIsWebHookModalOpen] = useState(false);
	const [activeWebHook, setActiveWebHook] =
		useState<ExtendedWebHookConfig | null>(null);
	const [isWebHookSaving, setIsWebHookSaving] = useState(false);

	const categoryProviders = getProvidersByCategory(activeCategory).filter(
		(p) => !["yahoo"].includes(p.type),
	);
	const enabledCount = providers.filter((p) => p.enabled).length;

	useEffect(() => {
		if (!projectHook.project?.clientID) return;
		getWebHooks().catch((err) => {
			setNotification({
				message: err instanceof Error ? err.message : "Failed to load webhooks",
			});
		});
	}, [getWebHooks, projectHook.project?.clientID]);

	const handleOpenCreateWebhook = () => {
		setActiveWebHook(null);
		setIsWebHookModalOpen(true);
	};

	const handleOpenEditWebhook = (webhook: ExtendedWebHookConfig) => {
		setActiveWebHook(webhook);
		setIsWebHookModalOpen(true);
	};

	const handleCloseWebhookModal = () => {
		setIsWebHookModalOpen(false);
		setActiveWebHook(null);
	};

	const handleSaveWebhook = async (config: WebHookConfig) => {
		setIsWebHookSaving(true);
		try {
			const res = activeWebHook
				? await updateWebHook(activeWebHook.id, config)
				: await registerWebHook(config.event, config);
			if (!res?.success) {
				throw new Error(res?.error || "Failed to save webhook");
			}
			setNotification({
				message: activeWebHook ? "Webhook updated" : "Webhook created",
			});
			handleCloseWebhookModal();
		} catch (err) {
			setNotification({
				message: err instanceof Error ? err.message : "Failed to save webhook",
			});
		} finally {
			setIsWebHookSaving(false);
		}
	};

	const handleDeleteWebhook = async (webhook: ExtendedWebHookConfig) => {
		if (!confirm("Delete this webhook?")) return;
		setIsWebHookSaving(true);
		try {
			const res = await deleteWebHook(webhook.id);
			if (!res?.success) {
				throw new Error(res?.error || "Failed to delete webhook");
			}
			setNotification({ message: "Webhook deleted" });
		} catch (err) {
			setNotification({
				message:
					err instanceof Error ? err.message : "Failed to delete webhook",
			});
		} finally {
			setIsWebHookSaving(false);
		}
	};

	if (projectHook.isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	}

	if (projectHook.error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex flex-col items-center justify-center py-20">
					<div className="relative mb-6">
						<div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
						<div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-900/40 border border-red-700/50">
							<Icon
								icon="lucide:alert-circle"
								className="w-10 h-10 text-red-400"
							/>
						</div>
					</div>
					<h2 className="text-xl font-semibold text-white mb-2">
						Something went wrong
					</h2>
					<p className="text-red-300 text-sm text-center max-w-md mb-8">
						{projectHook.error}
					</p>
					<a
						href="/dashboard"
						className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
					>
						<Icon icon="lucide:arrow-left" className="w-4 h-4" />
						<span>Back to Dashboard</span>
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-10">
			{/* Notification */}
			<AppSnackbar
				notification={notification}
				onClose={() => setNotification(null)}
			/>

			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<a
						href="/dashboard"
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white sm:w-auto"
					>
						<Icon icon="lucide:arrow-left" className="w-5 h-5" />
						<span>Back</span>
					</a>
					<div className="min-w-0 flex-1">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							<h2 className="text-2xl font-bold text-white wrap-break-word">
								{projectHook.project?.name}
							</h2>
							<span
								className={`inline-flex w-fit rounded px-2 py-1 text-xs ${
									projectHook.project?.active
										? "bg-green-500/10 text-green-400"
										: "bg-gray-500/10 text-gray-400"
								}`}
							>
								{projectHook.project?.active ? "Active" : "Inactive"}
							</span>
						</div>
						<p className="mt-1 text-sm text-gray-400 sm:text-base">
							{enabledCount} provider{enabledCount !== 1 ? "s" : ""} enabled
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
					<a
						href={`/dashboard/project/collaborator?project_id=${projectHook.project?.clientID}`}
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white sm:w-auto"
					>
						<Icon icon="lucide:users" className="w-4 h-4" />
						<span>Collaborators</span>
					</a>
					<label className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-gray-800/70 px-4 py-3 sm:w-auto sm:justify-start sm:gap-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
						<span className="text-sm text-gray-300 sm:text-base">
							Project Active
						</span>
						<button
							type="button"
							onClick={() =>
								projectHook.updateProject({
									active: !projectHook.project?.active,
								})
							}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								projectHook.project?.active ? "bg-green-600" : "bg-gray-600"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									projectHook.project?.active
										? "translate-x-6"
										: "translate-x-1"
								}`}
							/>
						</button>
					</label>
				</div>
			</div>

			{/* Project Client Info */}
			<ProjectClientInfo
				project={projectHook.project}
				updateProject={projectHook.updateProject}
				setNotification={setNotification}
			/>

			{/* General Settings */}
			<div>
				<h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
					<Icon icon="lucide:settings" className="w-5 h-5 text-blue-400" />
					General Settings
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Theme Selection */}
					<SelectWrapper
						icon={
							<Icon icon="lucide:palette" className="w-5 h-5 text-gray-300" />
						}
						name="UI Theme"
						action={
							<a
								href="/dashboard/theme"
								className="text-xs text-blue-400 hover:text-blue-300"
							>
								Manage Themes
							</a>
						}
					>
						<select
							value={projectHook.project?.theme_id || ""}
							onChange={async (e) => {
								setIsSaving(true);
								try {
									await projectHook.updateProject({
										theme_id: Number(e.target.value) || null,
									});
									setNotification({ message: "Theme updated" });
								} catch (err) {
									setNotification({
										message:
											err instanceof Error
												? err.message
												: "Failed to update theme",
									});
								} finally {
									setIsSaving(false);
								}
							}}
							disabled={isSaving || themesLoading}
							className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
						>
							<option value="">No theme selected</option>
							{themes.map((theme) => (
								<option key={theme.id} value={theme.id}>
									{theme.themeData.title || theme.id}
								</option>
							))}
						</select>
						{projectHook.project?.theme_id && (
							<p className="text-gray-500 text-xs mt-2">
								Using theme:{" "}
								{
									themes.find((t) => t.id === projectHook.project?.theme_id)
										?.name
								}
							</p>
						)}
					</SelectWrapper>
					<AllowOriginForm
						isSaving={isSaving}
						setIsSaving={setIsSaving}
						updateProject={projectHook.updateProject}
						setNotification={setNotification}
						project={projectHook.project as Project}
					/>
					<RegisterOnInviteForm
						isSaving={isSaving}
						setIsSaving={setIsSaving}
						updateProject={projectHook.updateProject}
						setNotification={setNotification}
						project={projectHook.project as Project}
					/>
				</div>
			</div>

			{/* Project Data Section */}
			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
				<button
					type="button"
					onClick={() => setIsProjectDataExpanded(!isProjectDataExpanded)}
					className="w-full flex items-center justify-between text-left"
				>
					<div>
						<h2 className="text-xl font-semibold text-white flex items-center gap-2">
							<Icon icon="lucide:globe" className="w-5 h-5 text-blue-400" />
							Global Variables
							<span className="text-xs font-normal text-gray-400">
								(Data available in email templates)
							</span>
						</h2>
						<p className="text-gray-400 text-sm">
							Configure variables like app name, company info, and custom fields
							for email templates
						</p>
					</div>
					<span
						className={`text-gray-400 transition-transform ${
							isProjectDataExpanded ? "rotate-180" : ""
						}`}
					>
						▼
					</span>
				</button>

				{isProjectDataExpanded && (
					<div className="mt-6 space-y-6">
						{/* Standard Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="app-name"
								>
									App Name
								</label>
								<input
									type="text"
									id="app-name"
									value={projectData.appName || ""}
									onChange={(e) =>
										setProjectData({ ...projectData, appName: e.target.value })
									}
									placeholder="My Application"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{appName}}"}
								</p>
							</div>

							{/* Email from setup */}
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="email-from"
								>
									Email From
								</label>
								<input
									type="text"
									id="email-from"
									value={projectData.emailFrom || ""}
									onChange={(e) =>
										setProjectData({
											...projectData,
											emailFrom: e.target.value,
										})
									}
									placeholder="no-reply@example.com"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Not meant for templates - used as the sender email address
								</p>
							</div>

							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="company-name"
								>
									Company Name
								</label>
								<input
									type="text"
									id="company-name"
									value={projectData.companyName || ""}
									onChange={(e) =>
										setProjectData({
											...projectData,
											companyName: e.target.value,
										})
									}
									placeholder="Acme Inc."
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{companyName}}"}
								</p>
							</div>
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="support-email"
								>
									Support Email
								</label>
								<input
									type="email"
									id="support-email"
									value={projectData.supportEmail || ""}
									onChange={(e) =>
										setProjectData({
											...projectData,
											supportEmail: e.target.value,
										})
									}
									placeholder="support@example.com"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{supportEmail}}"}
								</p>
							</div>
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="website-url"
								>
									Website URL
								</label>
								<input
									type="url"
									id="website-url"
									value={projectData.websiteUrl || ""}
									onChange={(e) =>
										setProjectData({
											...projectData,
											websiteUrl: e.target.value,
										})
									}
									placeholder="https://example.com"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{websiteUrl}}"}
								</p>
							</div>
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="logo-url"
								>
									Logo URL
								</label>
								<input
									type="url"
									id="logo-url"
									value={projectData.logoUrl || ""}
									onChange={(e) =>
										setProjectData({ ...projectData, logoUrl: e.target.value })
									}
									placeholder="https://example.com/logo.png"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{logoUrl}}"}
								</p>
							</div>
							<RolesField
								roles={
									(projectData.roles as unknown as string[] | undefined) || []
								}
								onChange={(roles) =>
									setProjectData({
										...projectData,
										roles,
									})
								}
							/>
							<div>
								<label
									className="block text-gray-300 text-sm mb-1"
									htmlFor="primary-color"
								>
									Primary Color
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										id="primary-color"
										value={projectData.primaryColor || ""}
										onChange={(e) =>
											setProjectData({
												...projectData,
												primaryColor: e.target.value,
											})
										}
										placeholder="#3B82F6"
										className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
									<input
										type="color"
										value={projectData.primaryColor || "#3B82F6"}
										onChange={(e) =>
											setProjectData({
												...projectData,
												primaryColor: e.target.value,
											})
										}
										className="w-10 h-10 rounded cursor-pointer border border-gray-600"
									/>
								</div>
								<p className="text-gray-500 text-xs mt-1">
									Use in templates: {"{{primaryColor}}"}
								</p>
							</div>
						</div>

						{/* Custom Fields */}
						<div className="border-t border-gray-700 pt-6">
							<h4 className="text-white font-medium mb-2">Custom Fields</h4>
							<div className="space-y-2">
								{Object.entries(projectData)
									.filter(
										([key]) =>
											!STANDARD_PROJECT_DATA_FIELDS.includes(
												key as (typeof STANDARD_PROJECT_DATA_FIELDS)[number],
											),
									)
									.map(([key, value]) => [
										key,
										Array.isArray(value) ? value.join(",") : value,
									])
									.map(([key, value]) => (
										<div key={key} className="flex gap-2 items-center">
											<span className="text-gray-400 text-sm w-32 truncate">
												{key}:
											</span>
											{value?.startsWith("function::") ? (
												<div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-purple-950/40 border border-purple-700/50 rounded">
													<Icon
														icon="lucide:code-2"
														className="w-4 h-4 text-purple-400 shrink-0"
													/>
													<span className="text-purple-300 text-xs font-mono truncate flex-1">
														function
													</span>
													<button
														type="button"
														onClick={() =>
															setFnEditorModal({
																key: key as string,
																draft: value.slice(
																	"function::".length,
																) as string,
															})
														}
														className="text-purple-400 hover:text-purple-200 text-xs underline"
													>
														Edit
													</button>
												</div>
											) : (
												<input
													type="text"
													value={value || ""}
													onChange={(e) =>
														setProjectData({
															...projectData,
															[key as string]: e.target.value,
														})
													}
													className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
												/>
											)}
											<button
												type="button"
												onClick={() => {
													const newData = { ...projectData };
													delete newData[key as string];
													setProjectData(newData);
												}}
												className="px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
											>
												<Icon icon="lucide:x" className="w-4 h-4" />
											</button>
											<span className="text-gray-500 text-xs">
												{`{{${key}}}`}
											</span>
										</div>
									))}

								{/* Add Custom Field */}
								<div className="flex gap-2 items-center mt-2">
									<input
										type="text"
										value={customFieldKey}
										onChange={(e) =>
											setCustomFieldKey(
												e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
											)
										}
										placeholder="fieldName"
										className="w-32 px-3 py-1.5 bg-gray-900 border border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
									/>
									<button
										type="button"
										onClick={() => {
											if (customFieldKey && !projectData[customFieldKey]) {
												setProjectData({
													...projectData,
													[customFieldKey]: "",
												});
												setCustomFieldKey("");
											}
										}}
										disabled={
											!customFieldKey ||
											!!projectData[customFieldKey] ||
											STANDARD_PROJECT_DATA_FIELDS.includes(
												customFieldKey as (typeof STANDARD_PROJECT_DATA_FIELDS)[number],
											)
										}
										className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
									>
										+ Add Field
									</button>
								</div>
							</div>
						</div>

						<TemplateSelection project_id={params.project_id} />

						{/* Save Button */}
						<div className="flex justify-end pt-2">
							<button
								type="button"
								onClick={async () => {
									setIsSaving(true);
									try {
										await projectHook.updateProject({ projectData });
										setNotification({ message: "Project data saved" });
									} catch (err) {
										setNotification({
											message:
												err instanceof Error
													? err.message
													: "Failed to save project data",
										});
									} finally {
										setIsSaving(false);
									}
								}}
								disabled={isSaving}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
							>
								{isSaving ? (
									<>
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										Saving...
									</>
								) : (
									"Save Project Data"
								)}
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Webhooks */}
			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
				<div className="flex items-start justify-between gap-4 mb-6">
					<div>
						<h2 className="text-xl font-semibold text-white flex items-center gap-2">
							<Icon icon="lucide:webhook" className="w-5 h-5 text-blue-400" />
							Webhooks
						</h2>
						<p className="text-gray-400 text-sm">
							Send event payloads to your endpoints in real time.
						</p>
					</div>
					<button
						type="button"
						onClick={handleOpenCreateWebhook}
						disabled={isWebHookSaving}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						+ Create Webhook
					</button>
				</div>

				{webhooks.length === 0 ? (
					<div className="rounded-lg border border-dashed border-gray-700 p-6 text-center">
						<p className="text-gray-400 text-sm">No webhooks configured yet.</p>
					</div>
				) : (
					<div className="space-y-4">
						{webhooks.map((webhook) => (
							<div
								key={webhook.id}
								className="bg-gray-900/60 border border-gray-700 rounded-lg p-4"
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<div className="flex flex-wrap items-center gap-2">
											<span className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-400">
												{getWebHookEventLabel(webhook.event)}
											</span>
											<span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
												{webhook.method}
											</span>
										</div>
										<p className="text-gray-200 break-all mt-2">
											{webhook.url}
										</p>
										<p className="text-gray-500 text-xs mt-1">
											{webhook.headers
												? `${Object.keys(webhook.headers).length} headers`
												: "No headers"}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => handleOpenEditWebhook(webhook)}
											disabled={isWebHookSaving}
											className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => handleDeleteWebhook(webhook)}
											disabled={isWebHookSaving}
											className="px-3 py-1.5 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Authentication Providers */}
			<div>
				<h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
					<Icon icon="lucide:shield-check" className="w-5 h-5 text-blue-400" />
					Authentication Providers
				</h2>

				{/* Enabled Providers Summary */}
				{enabledCount > 0 && (
					<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
						<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
							<Icon
								icon="lucide:check-circle"
								className="w-5 h-5 text-green-400"
							/>
							Enabled Providers
						</h3>
						<div className="flex flex-wrap gap-4">
							{providers
								.filter((p) => p.enabled)
								.map((p) => {
									const meta = getProviderMeta(p.type);
									return (
										<div
											key={p.type}
											className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg"
										>
											<ProviderIcon
												type={p.type}
												className="w-4 h-4 text-gray-300"
											/>
											<span className="text-white">{meta?.name}</span>
										</div>
									);
								})}
						</div>
					</div>
				)}

				<div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
					{CATEGORIES.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => {
								setActiveCategory(cat.id);
								const url = new URL(window.location.href);
								url.searchParams.set("category", cat.id);
								window.history.pushState({}, "", url);
							}}
							className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
								activeCategory === cat.id
									? "bg-blue-600 text-white"
									: "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
							}`}
						>
							<Icon icon={cat.icon} className="w-4 h-4 mr-2 inline" />
							{cat.label}
						</button>
					))}
				</div>

				{/* Provider Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{categoryProviders.map((meta) => {
						const config = getProviderConfig(meta.type);
						const isConfigured = !!config;
						const isEnabled = config?.enabled || false;

						return (
							<div
								key={meta.type}
								className={`bg-gray-800 rounded-lg p-6 border transition-colors ${
									isEnabled
										? "border-green-500/50"
										: isConfigured
											? "border-yellow-500/30"
											: "border-gray-700"
								}`}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center space-x-3">
										<ProviderIcon
											type={meta.type}
											className="w-8 h-8 text-gray-300"
										/>
										<div>
											<h3 className="text-xl font-semibold text-white">
												{meta.name}
											</h3>
											<p className="text-gray-500 text-sm">
												{meta.description}
											</p>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between mt-4">
									<div className="flex items-center space-x-2">
										{isConfigured ? (
											<>
												<span
													className={`px-2 py-1 text-xs rounded ${
														isEnabled
															? "bg-green-500/10 text-green-400"
															: "bg-yellow-500/10 text-yellow-400"
													}`}
												>
													{isEnabled ? "Enabled" : "Configured"}
												</span>
												{isConfigured && (
													<button
														type="button"
														onClick={() => handleToggleProvider(meta.type)}
														disabled={isSaving}
														className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
															isEnabled ? "bg-green-600" : "bg-gray-600"
														}`}
													>
														<span
															className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
																isEnabled ? "translate-x-5" : "translate-x-1"
															}`}
														/>
													</button>
												)}
											</>
										) : (
											<span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-400">
												Not configured
											</span>
										)}
									</div>

									<div className="flex space-x-2">
										{isConfigured && (
											<button
												type="button"
												onClick={() => handleRemoveProvider(meta.type)}
												disabled={isSaving}
												className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
												title="Remove"
											>
												<Icon icon="lucide:trash-2" className="w-4 h-4" />
											</button>
										)}
										<a
											href={`/dashboard/project/provider?project_id=${projectHook.project?.clientID}&provider_type=${meta.type}`}
											className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
										>
											{isConfigured ? "Edit" : "Configure"}
										</a>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{isWebHookModalOpen && (
				<WebHookModal
					data={activeWebHook || undefined}
					isSaving={isWebHookSaving}
					onClose={handleCloseWebhookModal}
					onSave={handleSaveWebhook}
				/>
			)}
			<FunctionEditorModal
				variableKey={fnEditorModal?.key ?? ""}
				value={fnEditorModal !== null ? fnEditorModal.draft : null}
				props={projectData as Record<string, string>}
				onAccept={(body) => {
					if (fnEditorModal) {
						setProjectData({
							...projectData,
							[fnEditorModal.key]: `function::${body}`,
						});
					}
					setFnEditorModal(null);
				}}
				onClose={() => setFnEditorModal(null)}
				onRemove={() => {
					if (fnEditorModal) {
						setProjectData({
							...projectData,
							[fnEditorModal.key]: "",
						});
					}
					setFnEditorModal(null);
				}}
			/>
		</div>
	);
}

function ProjectClientInfo({
	project,
	updateProject,
	setNotification,
}: {
	project: Project | null;
	updateProject: (data: Partial<Project>) => Promise<void>;
	setNotification: (notif: { message: string } | null) => void;
}) {
	const [showSecret, setShowSecret] = useState(false);
	const [isRotatingSecret, setIsRotatingSecret] = useState(false);

	const handleRotateSecret = async () => {
		if (!project?.secret) {
			setNotification({ message: "Project secret is unavailable" });
			return;
		}

		if (
			!confirm(
				"Rotate the Client Secret? Existing server-side integrations using the current secret will stop working until they are updated.",
			)
		) {
			return;
		}

		setIsRotatingSecret(true);
		try {
			await updateProject({ secret: project.secret });
			setShowSecret(true);
			setNotification({
				message:
					"Client Secret rotated. Update your server-side integrations with the new value.",
			});
		} catch (err) {
			setNotification({
				message:
					err instanceof Error ? err.message : "Failed to rotate Client Secret",
			});
		} finally {
			setIsRotatingSecret(false);
		}
	};

	if (!project) {
		return (
			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
				<div className="flex items-center space-x-2 mb-5">
					<div className="w-5 h-5 rounded bg-gray-700" />
					<div className="h-6 w-44 rounded bg-gray-700" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div className="space-y-2">
						<div className="h-4 w-20 rounded bg-gray-700" />
						<div className="h-9 rounded-lg bg-gray-700" />
					</div>
					<div className="space-y-2">
						<div className="h-4 w-24 rounded bg-gray-700" />
						<div className="h-9 rounded-lg bg-gray-700" />
					</div>
					<div className="space-y-2 md:col-span-2">
						<div className="h-4 w-28 rounded bg-gray-700" />
						<div className="h-9 rounded-lg bg-gray-700" />
						<div className="h-3 w-3/4 rounded bg-gray-700 mt-2" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
			<div className="flex items-center space-x-2 mb-5">
				<Icon icon="lucide:key" className="w-5 h-5 text-blue-400" />
				<h2 className="text-xl font-semibold text-white">
					Project Credentials
				</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="space-y-2">
					<label className="text-gray-400 text-sm" htmlFor="client-id">
						Client-ID
					</label>
					<div className="flex items-center gap-2">
						<code className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white font-mono text-sm rounded-lg break-all">
							{project?.clientID}
						</code>
						<button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText(project?.clientID || "");
								setNotification({ message: "Client-ID copied!" });
							}}
							className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
							title="Copy Client-ID"
						>
							<Icon icon="lucide:clipboard-copy" className="w-4 h-4" />
						</button>
					</div>
				</div>
				<div className="space-y-2">
					<label className="text-gray-400 text-sm" htmlFor="issuer-url">
						Issuer URL
					</label>
					<div className="flex items-center gap-2">
						<code className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white font-mono text-sm rounded-lg break-all">
							https://{project?.authEndpointURL}
						</code>
						<button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText(
									`https://${project?.authEndpointURL}` || "",
								);
								setNotification({ message: "Auth Endpoint URL copied!" });
							}}
							className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
							title="Copy Auth Endpoint URL"
						>
							<Icon icon="lucide:clipboard-copy" className="w-4 h-4" />
						</button>
					</div>
				</div>
				{/* Secret */}
				<div className="space-y-2 md:col-span-2">
					<div>
						<div className="flex items-center justify-between gap-3 mb-1">
							<div className="flex items-center gap-2">
							<label className="text-gray-400 text-sm" htmlFor="client-secret">
								Client Secret
							</label>
							<button
								type="button"
								onClick={() => setShowSecret(!showSecret)}
								disabled={isRotatingSecret}
								className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors inline-flex items-center justify-center"
								title={showSecret ? "Hide Client Secret" : "Show Client Secret"}
							>
								{showSecret ? (
									<Icon icon="lucide:eye-off" className="w-4 h-4" />
								) : (
									<Icon icon="lucide:eye" className="w-4 h-4" />
								)}
							</button>
							</div>
							<button
								type="button"
								onClick={() => {
									void handleRotateSecret();
								}}
								disabled={isRotatingSecret}
								className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
								title="Rotate Client Secret"
							>
								{isRotatingSecret ? (
									<>
										<div className="w-4 h-4 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin" />
										Rotating...
									</>
								) : (
									<>
										<Icon icon="lucide:refresh-cw" className="w-4 h-4" />
										Rotate Secret
									</>
								)}
							</button>
						</div>
						<div className="flex items-center gap-2">
							<code className="flex-1 min-w-0 px-3 py-2 bg-gray-900 border border-gray-600 text-white font-mono text-sm rounded-lg break-all">
								{showSecret
									? project?.secret
									: "*".repeat(project?.secret?.length || 0)}
							</code>
							<button
								type="button"
								onClick={() => {
									navigator.clipboard.writeText(project?.secret || "");
									setNotification({ message: "Client Secret copied!" });
								}}
								disabled={isRotatingSecret}
								className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors inline-flex items-center justify-center shrink-0"
								title="Copy Client Secret"
							>
								<Icon icon="lucide:clipboard-copy" className="w-4 h-4" />
							</button>
						</div>
						<p className="text-gray-500 text-xs mt-2">
							Do not share your Client Secret with anyone. it can modify any
							part of the user data. ONLY use it in secure server-side
							environments.
						</p>
						<p className="text-amber-300/80 text-xs mt-2">
							Rotating the secret immediately invalidates the previous one.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function RegisterOnInviteForm({
	project,
	setNotification,
	updateProject,
	isSaving,
	setIsSaving,
}: {
	project: Project;
	setNotification: (notif: { message: string } | null) => void;
	updateProject: (data: Partial<Project>) => Promise<void>;
	isSaving?: boolean;
	setIsSaving: (saving: boolean) => void;
}) {
	const [value, setValue] = useState(Boolean(project?.registerOnInvite));
	const [modaleOpen, setModalOpen] = useState(false);

	const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
		async (e) => {
			const checked = e.target.checked;
			setIsSaving(true);
			try {
				await updateProject({ registerOnInvite: checked });
				setValue(checked);
				setNotification({
					message: `Register on Invite Only ${
						checked ? "enabled" : "disabled"
					}`,
				});
			} catch (err) {
				setNotification({
					message:
						err instanceof Error
							? err.message
							: "Failed to update Register on Invite Only setting",
				});
			} finally {
				setIsSaving(false);
			}
		},
		[setIsSaving, setNotification, updateProject],
	);

	return (
		<SelectWrapper
			icon={<Icon icon="lucide:mail" className="w-5 h-5 text-gray-300" />}
			name="Register on Invite Only"
		>
			<div className="mt-4">
				<label className="inline-flex items-center cursor-pointer">
					<div className="relative flex items-center justify-center">
						<input
							type="checkbox"
							checked={value}
							disabled={isSaving}
							onChange={handleChange}
							className="peer appearance-none w-5 h-5 rounded border-2 border-gray-400 checked:border-blue-500 checked:bg-blue-500 cursor-pointer transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600"
						/>
						<Icon
							icon="lucide:check"
							className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
						/>
					</div>
					<span className="ml-3 text-gray-300 hover:text-gray-100 transition-colors duration-150 select-none font-medium">
						Register on Invite Only
					</span>
				</label>
				{value && (
					<div className="mt-4">
						<button
							type="button"
							onClick={() => setModalOpen(true)}
							className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							<Icon icon="lucide:user-plus" className="w-4 h-4" />
							Create Invite Link
						</button>
					</div>
				)}
				{modaleOpen && (
					<InviteLinkModal
						project={project}
						onClose={() => setModalOpen(false)}
						setNotification={setNotification}
					/>
				)}
			</div>
		</SelectWrapper>
	);
}

function InviteLinkModal({
	project,
	onClose,
	setNotification,
}: {
	project: Project;
	onClose: () => void;
	setNotification: (notif: { message: string } | null) => void;
}) {
	const [inviteLink, setInviteLink] = useState<string | null>(null);
	const [copyID, setCopyID] = useState<string | null>(null);
	const [expiresIn, setExpiresIn] = useState<number>(60);
	const allowedOrigins =
		project.originURL
			?.split(",")
			.map((o) => o.trim())
			.filter(Boolean) || [];
	const [allowOrigin, setAllowOrigin] = useState<string>(
		allowedOrigins[0] || "",
	);
	const [isLoading, setIsLoading] = useState(false);
	const { templates, isLoading: isTemplatesLoading } = useCopyTemplates();

	const onCreate = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await createInviteLink({
				clientID: project.clientID,
				copyID: copyID || undefined,
				expireInMin: expiresIn,
				originURL: allowOrigin,
			});
			if (res.error) {
				throw new Error(res.error);
			}
			setInviteLink(res.data?.link as string);
			setNotification({ message: "Invite link created successfully!" });
		} catch (err) {
			setNotification({
				message:
					err instanceof Error ? err.message : "Failed to create invite link",
			});
		} finally {
			setIsLoading(false);
		}
	}, [copyID, expiresIn, allowOrigin, project.clientID, setNotification]);

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Icon icon="lucide:link" className="w-6 h-6 text-gray-300" />
						<h2 className="text-xl font-semibold text-white">
							Create Invite Link
						</h2>
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

				<div className="space-y-4">
					{/* Allow Origin Select */}
					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="allowed-origin"
						>
							Allow Origin
						</label>
						<select
							id="allowed-origin"
							value={allowOrigin}
							onChange={(e) => setAllowOrigin(e.target.value)}
							disabled={isLoading || allowedOrigins.length === 0}
							className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{allowedOrigins.length === 0 ? (
								<option value="">No origins configured</option>
							) : (
								allowedOrigins.map((origin) => (
									<option key={origin} value={origin}>
										{origin}
									</option>
								))
							)}
						</select>
						<p className="text-gray-500 text-xs mt-1">
							The origin the invite link will redirect to
						</p>
					</div>

					{/* Copy Template Select */}
					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="copy-template-section"
						>
							Copy Template
						</label>
						{isTemplatesLoading ? (
							<div className="h-10 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
							</div>
						) : (
							<select
								id="copy-template-section"
								value={copyID || ""}
								onChange={(e) => setCopyID(e.target.value || null)}
								disabled={isLoading}
								className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<option value="">Select a template (optional)</option>
								{templates.map((template) => (
									<option key={template.name} value={template.name}>
										{template.name}
									</option>
								))}
							</select>
						)}
						<p className="text-gray-500 text-xs mt-1">
							Choose a copy/template to associate with this invite link
						</p>
					</div>

					{/* Expires In Input */}
					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="expires-in"
						>
							Expires In (minutes)
						</label>
						<div className="flex items-center gap-2">
							<input
								type="number"
								value={expiresIn}
								onChange={(e) =>
									setExpiresIn(Math.max(1, parseInt(e.target.value, 10) || 60))
								}
								disabled={isLoading}
								min="1"
								max="10080"
								className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							/>
							<span className="text-gray-400 text-sm whitespace-nowrap">
								{Math.floor(expiresIn / 60) > 0
									? `${Math.floor(expiresIn / 60)}h ${expiresIn % 60}m`
									: `${expiresIn}m`}
							</span>
						</div>
						<p className="text-gray-500 text-xs mt-1">
							Link will expire after the specified duration
						</p>
					</div>
				</div>

				{inviteLink && (
					<div className="mt-6 p-4 bg-linear-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-600/30 backdrop-blur-sm">
						<div className="flex items-center gap-2 mb-3">
							<span className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<title>Invite Link Created</title>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								Invite Link Created
							</span>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<code className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-600 text-green-400 font-mono text-xs rounded-lg break-all select-all max-h-24 overflow-y-auto">
									{inviteLink}
								</code>
								<button
									type="button"
									onClick={() => {
										navigator.clipboard.writeText(inviteLink);
										setNotification({
											message: "Invite link copied to clipboard!",
										});
									}}
									className="p-2.5 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-all duration-200 border border-green-600/30 hover:border-green-500/50"
									title="Copy to clipboard"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Copy to clipboard</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</button>
							</div>
							<p className="text-green-400/70 text-xs">
								Share this link with users to allow them to register via invite
							</p>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onCreate}
						disabled={isLoading}
						className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								Creating...
							</>
						) : (
							<>
								<Icon icon="lucide:check" className="w-4 h-4" />
								Create Link
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

function RolesField({
	roles,
	onChange,
}: {
	roles: string[];
	onChange: (roles: string[]) => void;
}) {
	const [newRole, setNewRole] = useState("");

	const handleAdd = () => {
		const trimmed = newRole.trim();
		if (trimmed && !roles.includes(trimmed)) {
			onChange([...roles, trimmed]);
			setNewRole("");
		}
	};

	return (
		<div className="md:col-span-2">
			<label className="block text-gray-300 text-sm mb-1" htmlFor="roles-input">
				Roles
			</label>
			<div className="flex flex-wrap gap-2 mb-2 min-h-8">
				{roles.map((role) => (
					<span
						key={role}
						className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/40 border border-blue-700/50 rounded text-blue-300 text-sm"
					>
						{role}
						<button
							type="button"
							onClick={() => onChange(roles.filter((r) => r !== role))}
							className="text-blue-400 hover:text-blue-200 ml-1"
							title={`Remove ${role}`}
						>
							<Icon icon="lucide:x" className="w-3 h-3" />
						</button>
					</span>
				))}
				{roles.length === 0 && (
					<span className="text-gray-500 text-sm">No roles defined</span>
				)}
			</div>
			<div className="flex gap-2">
				<input
					id="roles-input"
					type="text"
					value={newRole}
					onChange={(e) =>
						setNewRole(e.target.value.replace(/[^a-zA-Z0-9_\-:.]/g, ""))
					}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAdd();
						}
					}}
					placeholder="e.g. admin"
					className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
				/>
				<button
					type="button"
					onClick={handleAdd}
					disabled={!newRole.trim() || roles.includes(newRole.trim())}
					className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
				>
					+ Add Role
				</button>
			</div>
			<p className="text-gray-500 text-xs mt-1">
				Use in templates: {"{{roles}}"}
			</p>
		</div>
	);
}

function AllowOriginForm({
	isSaving,
	setIsSaving,
	updateProject,
	setNotification,
	project,
}: {
	isSaving?: boolean;
	setIsSaving: (saving: boolean) => void;
	updateProject: (data: Partial<Project>) => Promise<void>;
	setNotification: (notif: { message: string } | null) => void;
	project: Project;
}) {
	const [value, setValue] = useState(project?.originURL || "");

	return (
		<SelectWrapper
			icon={<Icon icon="lucide:globe" className="w-5 h-5 text-gray-300" />}
			name="Allow Origin URL"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					setIsSaving(true);
					updateProject({
						originURL: value,
					})
						.then(() => {
							setNotification({ message: "Origin URL updated" });
						})
						.catch((err) => {
							setNotification({
								message:
									err instanceof Error
										? err.message
										: "Failed to update origin URL",
							});
						})
						.finally(() => {
							setIsSaving(false);
						});
				}}
			>
				<input
					name="origin"
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="https://example.com,https://app.example.com"
					className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSaving}
				/>
				<p className="mt-1 text-xs text-gray-400">
					Separate multiple origins with a comma.
				</p>
				<button
					type="submit"
					disabled={isSaving}
					className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					Save
				</button>
			</form>
		</SelectWrapper>
	);
}

function WebHookModal({
	data,
	onClose,
	onSave,
	isSaving,
}: {
	data?: ExtendedWebHookConfig;
	onClose: () => void;
	onSave: (config: WebHookConfig) => void | Promise<void>;
	isSaving?: boolean;
}) {
	const [url, setUrl] = useState("");
	const [method, setMethod] = useState<WebHookConfig["method"]>("POST");
	const [event, setEvent] = useState<WebHookEvents>("registration_success");
	const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
		[],
	);

	useEffect(() => {
		if (data) {
			setUrl(data.url || "");
			setMethod(data.method || "POST");
			setEvent(data.event || "registration_success");
			setHeaders(
				data.headers
					? Object.entries(data.headers).map(([key, value]) => ({
							key,
							value: value as string,
						}))
					: [],
			);
		} else {
			setUrl("");
			setMethod("POST");
			setEvent("registration_success");
			setHeaders([]);
		}
	}, [data]);

	const selectedEvent = WEBHOOK_EVENT_OPTIONS.find(
		(option) => option.event === event,
	);

	const handleHeaderChange = (
		index: number,
		field: "key" | "value",
		value: string,
	) => {
		setHeaders((prev) =>
			prev.map((header, idx) =>
				idx === index ? { ...header, [field]: value } : header,
			),
		);
	};

	const handleHeaderAdd = () => {
		setHeaders((prev) => [...prev, { key: "", value: "" }]);
	};

	const handleHeaderRemove = (index: number) => {
		setHeaders((prev) => prev.filter((_, idx) => idx !== index));
	};

	const handleSubmit = (eventAction: React.FormEvent) => {
		eventAction.preventDefault();
		const normalizedHeaders = headers
			.map((header) => ({
				key: header.key.trim(),
				value: header.value.trim(),
			}))
			.filter((header) => header.key && header.value);
		const headersRecord = normalizedHeaders.length
			? Object.fromEntries(
					normalizedHeaders.map((header) => [header.key, header.value]),
				)
			: undefined;

		onSave({
			url: url.trim(),
			method,
			event,
			headers: headersRecord,
		});
	};

	const isValid = Boolean(url.trim());

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-white">
						{data ? "Edit Webhook" : "Create Webhook"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
						title="Close"
					>
						<Icon icon="lucide:x" className="w-5 h-5" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="event-select"
						>
							Event
						</label>
						<select
							value={event}
							onChange={(eventChange) =>
								setEvent(eventChange.target.value as WebHookEvents)
							}
							disabled={isSaving}
							className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{WEBHOOK_EVENT_OPTIONS.map((option) => (
								<option key={option.event} value={option.event}>
									{option.label}
								</option>
							))}
						</select>
						{selectedEvent && (
							<p className="text-gray-500 text-xs mt-1">
								{selectedEvent.description}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="endpoint-url"
						>
							Endpoint URL
						</label>
						<input
							type="url"
							id="endpoint-url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/webhooks"
							disabled={isSaving}
							className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>

					<div>
						<label
							className="block text-gray-300 text-sm font-medium mb-2"
							htmlFor="http-method"
						>
							HTTP Method
						</label>
						<div className="flex gap-2">
							{(["POST", "GET"] as Array<WebHookConfig["method"]>).map(
								(methodOption) => (
									<button
										type="button"
										key={methodOption}
										onClick={() => setMethod(methodOption)}
										disabled={isSaving}
										className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
											method === methodOption
												? "bg-blue-600 border-blue-500 text-white"
												: "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500"
										}`}
									>
										{methodOption}
									</button>
								),
							)}
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between mb-2">
							<label
								className="block text-gray-300 text-sm font-medium"
								htmlFor="headers-section"
							>
								Headers (optional)
							</label>
							<button
								type="button"
								onClick={handleHeaderAdd}
								disabled={isSaving}
								className="text-xs text-blue-400 hover:text-blue-300"
							>
								+ Add Header
							</button>
						</div>
						{headers.length === 0 ? (
							<p className="text-gray-500 text-xs">No headers added yet.</p>
						) : (
							<div className="space-y-2">
								{headers.map((header, index) => (
									<div
										key={`${header.key}-${header.value}`}
										className="flex gap-2"
									>
										<input
											type="text"
											id={`header-key-${index}`}
											value={header.key}
											onChange={(e) =>
												handleHeaderChange(index, "key", e.target.value)
											}
											placeholder="Header"
											disabled={isSaving}
											className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
										<input
											type="text"
											id={`header-value-${index}`}
											value={header.value}
											onChange={(e) =>
												handleHeaderChange(index, "value", e.target.value)
											}
											placeholder="Value"
											disabled={isSaving}
											className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
										<button
											type="button"
											onClick={() => handleHeaderRemove(index)}
											disabled={isSaving}
											className="px-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg"
											title="Remove header"
										>
											<Icon icon="lucide:x" className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="flex gap-3 pt-4 border-t border-gray-700">
						<button
							type="button"
							onClick={onClose}
							disabled={isSaving}
							className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSaving || !isValid}
							className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{isSaving ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Saving...
								</>
							) : (
								"Save Webhook"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
