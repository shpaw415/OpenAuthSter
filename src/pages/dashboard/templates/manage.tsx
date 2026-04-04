import { FunctionEditorModal } from "@components/FunctionEditorModal";
import { HeaderIconButton } from "@components/HeaderIconButton";
import { useAuth } from "@hooks/useAuth";
import { useEmailTemplate, useEmailTemplates } from "@hooks/useEmailTemplates";
import { useParams } from "@hooks/useParams";
import { useProject } from "@hooks/useProjects";
import { Icon } from "@iconify/react";
import Editor from "@monaco-editor/react";
import { navigate } from "@utils";
import Mustache from "mustache";
import type * as monacoModule from "monaco-editor";
import type { EmailTemplateProps } from "openauth-webui-shared-types";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { transform } from "sucrase";

type MonacoWithHtmlCssDefaults = typeof monacoModule & {
	languages: typeof monacoModule.languages & {
		html: {
			htmlDefaults: {
				options: {
					suggest?: Record<string, boolean>;
				};
				setOptions: (options: {
					suggest?: Record<string, boolean>;
				}) => void;
			};
		};
		css: {
			cssDefaults: {
				options: {
					validate?: boolean;
				};
				setOptions: (options: { validate?: boolean }) => void;
			};
		};
	};
};

export const OBJECT_DEFAULT_HTML_TEMPLATE = await Bun.file(
	"src/assets/email-template.html",
).text();

const DEFAULT_MOCK_DATA = {
	code: "123456",
	to: "user@example.com",
	appName: "Your Company",
	AcceptLanguage: "en-US,en;q=0.9",
	htmlToLang: `function::return props.AcceptLanguage ? props.AcceptLanguage.split(",")[0].split(";")[0] : "en"`,
};

const extractMustacheVariables = (template: string) => {
	const regex = /\{\{([^{}]+)\}\}/g;
	const matches = template.matchAll(regex);
	const variables = new Set<string>();

	for (const match of matches) {
		const varName = match[1]?.trim();
		if (
			varName &&
			!varName.startsWith("#") &&
			!varName.startsWith("/") &&
			!varName.startsWith("^")
		) {
			variables.add(varName);
		}
	}

	return Array.from(variables);
};

export default function EmailTemplatesManage() {
	const [isEditMode, setIsEditMode] = useState(false);
	const [templateName, setTemplateName] = useState("");
	const [projectId, setProjectId] = useState("");
	const [emailTemplateProps, setEmailTemplateProps] =
		useState<EmailTemplateProps>({
			subject: "",
			body: OBJECT_DEFAULT_HTML_TEMPLATE,
			name: "",
		});
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [showPreview, setShowPreview] = useState(true);
	const [showVariables, setShowVariables] = useState(true);
	const [mockData, setMockData] =
		useState<Record<string, string | string[]>>(DEFAULT_MOCK_DATA);
	const [mockDataError, setMockDataError] = useState<string | null>(null);
	const [mockDataInitialized, setMockDataInitialized] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
	const [showFormFields, setShowFormFields] = useState(true);
	const [HelpDoc, setHelpDoc] = useState<FC | null>(null);
	const [isExportingProjectData, setIsExportingProjectData] = useState(false);
	const [createSandboxedFunction, setCreateSandboxedFunction] = useState<
		((fn: string) => (props: Record<string, unknown>) => unknown) | null
	>(null);
	const [fnEditorModal, setFnEditorModal] = useState<{
		key: string;
		draft: string | string[];
	} | null>(null);

	const auth = useAuth();

	useEffect(() => {
		import("../../../sandbox").then((mod) =>
			setCreateSandboxedFunction(() => mod.createSandboxedFunction),
		);
	}, []);

	// Fetch project data if project_id is provided
	const { project: linkedProject, updateProject: updateLinkedProject } =
		useProject(projectId);

	const parseEmailTemplateProps = useCallback(
		(props: Record<string, string | string[]>) => {
			return Object.fromEntries(
				Object.entries(props).map(([key, value]) => {
					if (
						typeof value === "string" &&
						value.startsWith("function::") &&
						createSandboxedFunction
					) {
						return [
							key,
							createSandboxedFunction(
								transform(value.replace("function::", ""), {
									transforms: ["typescript"],
								}).code,
							).bind(null, props),
						];
					}
					return [key, value];
				}),
			);
		},
		[createSandboxedFunction],
	);

	// Lazy-load help documentation when panel is first opened
	useEffect(() => {
		if (!showHelp || HelpDoc) return;
		import("@docs/templates/mustache-guide.mdx").then((mod) =>
			setHelpDoc(() => mod.default),
		);
	}, [showHelp, HelpDoc]);

	// Parse template with mustache
	const parsedPreview = useMemo(() => {
		try {
			setMockDataError(null);
			return Mustache.render(
				emailTemplateProps.body,
				parseEmailTemplateProps(mockData),
			);
		} catch (err) {
			setMockDataError(
				err instanceof Error ? err.message : "Failed to parse template",
			);
			return emailTemplateProps.body;
		}
	}, [emailTemplateProps.body, mockData, parseEmailTemplateProps]);

	// Extract mustache variables from template
	const templateBodyVariables = useMemo(
		() => extractMustacheVariables(emailTemplateProps.body),
		[emailTemplateProps.body],
	);

	const templateBodyVariableSet = useMemo(
		() => new Set(templateBodyVariables),
		[templateBodyVariables],
	);

	const templateVariables = useMemo(() => {
		const variables = new Set<string>(templateBodyVariables);
		// Also include project data keys so users can see available variables
		if (linkedProject?.projectData) {
			Object.keys(linkedProject.projectData).forEach((key) => {
				if (linkedProject.projectData?.[key]) {
					variables.add(key);
				}
			});
		}
		return Array.from(variables);
	}, [linkedProject?.projectData, templateBodyVariables]);

	const exportableProjectData = useMemo(() => {
		return templateBodyVariables.reduce<Record<string, string>>(
			(exportData, variable) => {
				const value = mockData[variable];
				if (typeof value === "string" && value.trim()) {
					exportData[variable] = value;
				}
				return exportData;
			},
			{},
		);
	}, [mockData, templateBodyVariables]);

	const { edit, project_id } = useParams<{
		edit?: string;
		project_id?: string;
	}>();

	// Get template name and project_id from URL
	useEffect(() => {
		if (edit) {
			setIsEditMode(true);
			setTemplateName(edit);
		}
		if (project_id) {
			setProjectId(project_id);
		}
	}, [edit, project_id]);

	// Initialize and sync mock data with project data when available
	useEffect(() => {
		const projectData = linkedProject?.projectData;
		if (projectData) {
			setMockData((prevMockData) => {
				const newMockData: Record<string, string | string[]> = {
					...DEFAULT_MOCK_DATA,
					...prevMockData,
				};
				// Merge project data into mock data (project data takes precedence for unedited fields)
				Object.entries(projectData).forEach(([key, value]) => {
					if (value && !mockDataInitialized) {
						// Only override if not yet initialized (first load)
						newMockData[key] = value;
					} else if (value && !(key in prevMockData)) {
						// Add new project fields that don't exist yet
						newMockData[key] = value;
					}
				});
				return newMockData;
			});
			if (!mockDataInitialized) {
				setMockDataInitialized(true);
			}
		}
	}, [linkedProject?.projectData, mockDataInitialized]);

	// Hook for fetching existing template in edit mode
	const { template, isLoading, error, updateTemplate } = useEmailTemplate(
		isEditMode ? templateName : "",
	);

	const isTemplateOwner = useMemo(
		() => template?.owner_id === auth.userMeta?.id,
		[template, auth.userMeta],
	);

	// Hook for creating new templates
	const { createTemplate } = useEmailTemplates();

	// Load template data when editing
	useEffect(() => {
		if (template && isEditMode) {
			setEmailTemplateProps({
				name: template.name,
				subject: template.subject,
				body: template.body,
			});
		}
	}, [template, isEditMode]);

	const showNotification = (type: "success" | "error", message: string) => {
		setNotification({ type, message });
		setTimeout(() => setNotification(null), 3000);
	};

	const handleExportProjectData = async () => {
		if (!linkedProject) {
			showNotification(
				"error",
				"Link a project before exporting template data",
			);
			return;
		}

		if (Object.keys(exportableProjectData).length === 0) {
			showNotification("error", "No populated template variables to export");
			return;
		}

		setIsExportingProjectData(true);
		try {
			await updateLinkedProject({
				projectData: {
					...(linkedProject.projectData ?? {}),
					...exportableProjectData,
				},
			});
			showNotification(
				"success",
				`Exported ${Object.keys(exportableProjectData).length} template variable${
					Object.keys(exportableProjectData).length === 1 ? "" : "s"
				} to project data`,
			);
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error
					? err.message
					: "Failed to export template variables",
			);
		} finally {
			setIsExportingProjectData(false);
		}
	};

	const handleSave = async () => {
		// Validation
		if (!emailTemplateProps.name.trim()) {
			showNotification("error", "Template name is required");
			return;
		}
		if (!emailTemplateProps.subject.trim()) {
			showNotification("error", "Subject is required");
			return;
		}
		if (!emailTemplateProps.body.trim()) {
			showNotification("error", "Template body is required");
			return;
		}

		setIsSaving(true);
		try {
			if (isEditMode) {
				await updateTemplate({
					subject: emailTemplateProps.subject,
					body: emailTemplateProps.body,
				});
				showNotification("success", "Template updated successfully");
			} else {
				await createTemplate(emailTemplateProps);
				showNotification("success", "Template created successfully");
				// Redirect to list after creating
				setTimeout(() => {
					navigate("/dashboard/templates");
				}, 1500);
			}
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Failed to save template",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditorChange = useCallback((value: string | undefined) => {
		if (value !== undefined) {
			setEmailTemplateProps((prev) => ({ ...prev, body: value }));
		}
	}, []);

	const handleTemplateEditorBeforeMount = useCallback(
		(monaco: typeof monacoModule) => {
			const htmlCssMonaco = monaco as MonacoWithHtmlCssDefaults;

			htmlCssMonaco.languages.html.htmlDefaults.setOptions({
				...htmlCssMonaco.languages.html.htmlDefaults.options,
				suggest: {
					...(htmlCssMonaco.languages.html.htmlDefaults.options.suggest ?? {}),
					html5: true,
				},
			});

			htmlCssMonaco.languages.css.cssDefaults.setOptions({
				...htmlCssMonaco.languages.css.cssDefaults.options,
				validate: true,
			});
		},
		[],
	);

	if (isEditMode && isLoading) {
		return (
			<div className="flex items-center justify-center h-48">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (isEditMode && error) {
		return (
			<div className="p-6 max-w-lg mx-auto mt-8">
				<div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
					<p className="text-red-300">{error}</p>
					<a
						href="/dashboard/templates"
						className="inline-block mt-4 text-blue-400 hover:text-blue-300 transition-colors"
					>
						← Back to Templates
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] flex flex-col overflow-hidden">
			<style>{`
				.email-template-editor .monaco-editor .find-widget {
					right: 4rem !important;
				}
			`}</style>
			{/* Notification */}
			{notification && (
				<div
					className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm ${
						notification.type === "success"
							? "bg-green-600 text-white"
							: "bg-red-600 text-white"
					}`}
				>
					{notification.message}
				</div>
			)}

			{/* Header */}
			<header className="shrink-0 flex items-center justify-between px-4 h-12 border-b border-gray-700 bg-gray-900">
				<div className="flex items-center gap-2 min-w-0">
					<a
						href="/dashboard/templates"
						className="text-gray-400 hover:text-white transition-colors shrink-0"
						title="Back to Templates"
					>
						<Icon icon="lucide:arrow-left" className="w-4 h-4" />
					</a>
					<span className="text-gray-600 text-sm shrink-0 hidden sm:block">
						/
					</span>
					<span className="text-gray-400 text-sm hidden sm:block shrink-0">
						Templates
					</span>
					<span className="text-gray-600 text-sm hidden sm:block shrink-0">
						/
					</span>
					<span className="text-sm font-medium text-white truncate">
						{isEditMode ? templateName : "New Template"}
					</span>
				</div>
				<div className="flex items-center gap-1.5 shrink-0">
					{isTemplateOwner && (
						<HeaderIconButton
							as="a"
							href={`/dashboard/templates/collaborator?project_id=${projectId}${templateName ? `&template_name=${templateName}` : ""}`}
							icon="lucide:users"
							title="Email Template Collaborators"
						/>
					)}
					<HeaderIconButton
						onClick={() => setShowHelp(true)}
						icon="lucide:book-open"
						title="Mustache template guide"
					/>
					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
					>
						{isSaving ? (
							<>
								<div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
								Saving…
							</>
						) : (
							<>
								<Icon icon="lucide:save" className="w-3.5 h-3.5" />
								Save
							</>
						)}
					</button>
				</div>
			</header>

			{/* Form fields */}
			<div className="shrink-0 border-b border-gray-700">
				<button
					type="button"
					onClick={() => setShowFormFields((v) => !v)}
					className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
				>
					<span className="flex items-center gap-1.5 min-w-0">
						<Icon icon="lucide:settings-2" className="w-3.5 h-3.5 shrink-0" />
						{showFormFields ? (
							"Template Settings"
						) : (
							<span className="flex items-center gap-1.5 min-w-0">
								<span>Template Settings</span>
								{emailTemplateProps.name && (
									<span className="text-gray-500 font-normal truncate">
										— {emailTemplateProps.name}
									</span>
								)}
								{emailTemplateProps.subject && (
									<span className="text-gray-500 font-normal hidden sm:inline truncate">
										{" "}
										· {emailTemplateProps.subject}
									</span>
								)}
							</span>
						)}
					</span>
					<Icon
						icon="lucide:chevron-down"
						className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${showFormFields ? "rotate-180" : ""}`}
					/>
				</button>
				{showFormFields && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pb-3">
						<div>
							<label
								className="block text-xs font-medium text-gray-400 mb-1"
								htmlFor="templateName"
							>
								Template Name
							</label>
							<input
								type="text"
								id="templateName"
								value={emailTemplateProps.name}
								onChange={(e) =>
									setEmailTemplateProps((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
								disabled={isEditMode}
								placeholder="e.g., password-reset, welcome-email"
								className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
							/>
						</div>
						<div>
							<label
								className="block text-xs font-medium text-gray-400 mb-1"
								htmlFor="emailSubject"
							>
								Email Subject
							</label>
							<input
								type="text"
								id="emailSubject"
								value={emailTemplateProps.subject}
								onChange={(e) =>
									setEmailTemplateProps((prev) => ({
										...prev,
										subject: e.target.value,
									}))
								}
								placeholder="e.g., Reset your password"
								className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Main panels */}
			<div className="flex-1 flex min-h-0">
				{/* Left: Monaco Editor */}
				<div
					className={`email-template-editor flex-col flex-1 min-w-0 min-h-0 ${mobileTab === "editor" ? "flex" : "hidden sm:flex"}`}
				>
					<div className="shrink-0 flex items-center px-3 py-1.5 bg-gray-800 border-b border-gray-700">
						<span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
							HTML
						</span>
					</div>
					<div className="flex-1 min-h-0">
						<Editor
							height="100%"
							beforeMount={handleTemplateEditorBeforeMount}
							language="html"
							path="email-template.html"
							value={emailTemplateProps.body}
							onChange={handleEditorChange}
							theme="vs-dark"
							options={{
								minimap: { enabled: false },
								fontSize: 14,
								wordWrap: "on",
								lineNumbers: "on",
								hover: {
									sticky: false,
								},
								find: {
									addExtraSpaceOnTop: true,
								},
								scrollBeyondLastLine: false,
								automaticLayout: true,
								tabSize: 2,
								formatOnPaste: true,
								formatOnType: true,
								quickSuggestions: {
									other: true,
									comments: false,
									strings: true,
								},
								suggestOnTriggerCharacters: true,
								acceptSuggestionOnEnter: "smart",
								tabCompletion: "on",
								fixedOverflowWidgets: true,
							}}
						/>
					</div>
				</div>

				{/* Right: Preview panel */}
				{showPreview ? (
					<div
						className={`flex-col min-h-0 border-l border-gray-700 ${mobileTab === "preview" ? "flex w-full sm:w-[42%] sm:shrink-0" : "hidden sm:flex sm:w-[42%] sm:shrink-0"}`}
					>
						{/* Preview header */}
						<div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-gray-200">
									Preview
								</span>
								<span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full leading-none">
									{templateVariables.length} var
									{templateVariables.length !== 1 ? "s" : ""}
								</span>
							</div>
							<div className="flex items-center gap-0.5">
								<button
									type="button"
									onClick={() => setShowVariables((v) => !v)}
									className={`p-1.5 rounded transition-colors ${
										showVariables
											? "text-blue-400 bg-blue-900/30"
											: "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
									}`}
									title={showVariables ? "Hide variables" : "Show variables"}
								>
									<Icon
										icon="lucide:sliders-horizontal"
										className="w-3.5 h-3.5"
									/>
								</button>
								<button
									type="button"
									onClick={() => setShowPreview(false)}
									className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
									title="Close preview"
								>
									<Icon
										icon="lucide:panel-right-close"
										className="w-3.5 h-3.5"
									/>
								</button>
							</div>
						</div>

						{/* Variables section */}
						{showVariables && (
							<div className="shrink-0 border-b border-gray-700 max-h-56 overflow-y-auto">
								<div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 bg-gray-800/60 sticky top-0">
									{linkedProject ? (
										<span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
											Using: {linkedProject.clientID}
										</span>
									) : (
										<span className="text-xs text-gray-500">Mock data</span>
									)}
									<div className="flex items-center gap-2">
										{linkedProject && (
											<button
												type="button"
												onClick={handleExportProjectData}
												disabled={isExportingProjectData}
												className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
												title="Export the current template variable values to the linked project's project data"
											>
												{isExportingProjectData ? (
													<>
														<div className="animate-spin rounded-full h-3 w-3 border border-emerald-200/30 border-t-emerald-200" />
														Exporting...
													</>
												) : (
													<>
														<Icon icon="lucide:upload" className="w-3 h-3" />
														Export to project data
													</>
												)}
											</button>
										)}
										<button
											type="button"
											onClick={() => {
												setMockData(DEFAULT_MOCK_DATA);
												setMockDataInitialized(false);
											}}
											className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
										>
											Reset
										</button>
									</div>
								</div>
								<div className="p-3 bg-gray-900">
									{mockDataError && (
										<div className="mb-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-xs">
											{mockDataError}
										</div>
									)}
									{templateVariables.length === 0 ? (
										<p className="text-gray-500 text-xs">
											No variables detected. Use {"{{variableName}}"} in your
											template.
										</p>
									) : (
										<div className="grid grid-cols-1 gap-2">
											{templateVariables.map((variable) => {
												const isInTemplate =
													templateBodyVariableSet.has(variable);
												const isFromProject =
													linkedProject?.projectData?.[variable] !== undefined;
												return (
													<div
														key={variable}
														className="flex items-center gap-2"
													>
														<label
															className="text-gray-400 text-xs w-24 truncate shrink-0 flex items-center gap-1"
															htmlFor={variable}
														>
															{`{{${variable}}}`}
															{isFromProject && !isInTemplate && (
																<span
																	className="text-yellow-400"
																	title="Available from project - not used in template yet"
																>
																	<Icon
																		icon="lucide:alert-triangle"
																		className="w-3 h-3"
																	/>
																</span>
															)}
															{isFromProject && isInTemplate && (
																<span
																	className="text-green-400"
																	title="From project data"
																>
																	<Icon
																		icon="lucide:check"
																		className="w-3 h-3"
																	/>
																</span>
															)}
														</label>
														{typeof mockData[variable] === "string" &&
														mockData[variable].startsWith("function::") ? (
															<div className="flex-1 flex items-center gap-2 min-w-0">
																<code className="flex-1 px-2 py-1 bg-gray-800 border border-purple-600/50 text-purple-300 rounded text-xs font-mono truncate min-w-0">
																	{"fn(props) { "}
																	{mockData[variable]
																		.slice("function::".length)
																		.slice(0, 40) || "…"}
																	{" }"}
																</code>
																<button
																	type="button"
																	onClick={() =>
																		setFnEditorModal({
																			key: variable,
																			draft: (mockData[variable] ?? "").slice(
																				"function::".length,
																			),
																		})
																	}
																	className="shrink-0 p-1 text-purple-400 hover:text-white hover:bg-gray-700 rounded"
																	title="Edit function"
																>
																	<Icon
																		icon="lucide:code-2"
																		className="w-4 h-4"
																	/>
																</button>
															</div>
														) : (
															<input
																type="text"
																id={variable}
																value={mockData[variable] || ""}
																onChange={(e) =>
																	setMockData((prev) => ({
																		...prev,
																		[variable]: e.target.value,
																	}))
																}
																placeholder={`Value for ${variable}`}
																className={`flex-1 px-2 py-1 bg-gray-800 border text-white placeholder-gray-500 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
																	isFromProject
																		? "border-green-600/50"
																		: "border-gray-600"
																}`}
															/>
														)}
														{!templateBodyVariableSet.has(variable) && (
															<span className="text-xs text-yellow-500 shrink-0">
																unused
															</span>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							</div>
						)}

						{/* iframe */}
						<div className="flex-1 min-h-0 bg-white overflow-hidden">
							<iframe
								srcDoc={parsedPreview}
								title="Email Preview"
								className="w-full h-full border-0"
								sandbox="allow-same-origin"
							/>
						</div>
					</div>
				) : (
					<div className="hidden sm:flex shrink-0 w-9 flex-col items-center pt-2 border-l border-gray-700">
						<button
							type="button"
							onClick={() => setShowPreview(true)}
							className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded transition-colors"
							title="Open preview"
						>
							<Icon icon="lucide:panel-right-open" className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>

			{/* Mobile bottom tab bar */}
			<nav className="sm:hidden shrink-0 flex border-t border-gray-700 bg-gray-900 h-12">
				<button
					type="button"
					onClick={() => setMobileTab("editor")}
					className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${mobileTab === "editor" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
				>
					<Icon icon="lucide:code-2" className="w-4 h-4" />
					Editor
				</button>
				<button
					type="button"
					onClick={() => {
						setMobileTab("preview");
						setShowPreview(true);
					}}
					className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${mobileTab === "preview" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
				>
					<Icon icon="lucide:eye" className="w-4 h-4" />
					Preview
				</button>
			</nav>

			{/* Help Side Panel */}
			{showHelp && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						aria-label="Close help panel"
						className="fixed inset-0 z-40 bg-black/50 cursor-default"
						onClick={() => setShowHelp(false)}
						onKeyDown={(e) => e.key === "Escape" && setShowHelp(false)}
					/>
					{/* Panel */}
					<div className="fixed inset-y-0 right-0 z-50 w-full sm:w-180 bg-gray-900 border-l border-gray-700 flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-gray-800 shrink-0">
							<div className="flex items-center gap-2">
								<Icon
									icon="lucide:book-open"
									className="w-5 h-5 text-green-400"
								/>
								<h2 className="text-white font-semibold text-base">
									Mustache Template Guide
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setShowHelp(false)}
								className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
								aria-label="Close help"
							>
								<Icon icon="lucide:x" className="w-5 h-5" />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-5">
							<div
								className="prose prose-invert prose-sm max-w-none
									prose-headings:text-blue-400 prose-headings:font-semibold
									prose-h1:text-xl prose-h1:mb-4 prose-h1:mt-0
									prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-700
									prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4
									prose-p:text-gray-300 prose-p:leading-relaxed
									prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline
									prose-strong:text-white prose-strong:font-semibold
									prose-code:text-emerald-400 prose-code:bg-gray-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
									prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
									prose-table:border-collapse prose-table:w-full
									prose-th:bg-gray-900 prose-th:text-gray-200 prose-th:font-medium prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-gray-700
									prose-td:text-gray-300 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-700
									prose-li:text-gray-300 prose-li:marker:text-gray-500
									prose-ul:my-2 prose-ol:my-2
									prose-hr:border-gray-700
									prose-blockquote:border-l-yellow-500 prose-blockquote:text-yellow-300/80"
							>
								{HelpDoc ? (
									<HelpDoc />
								) : (
									<div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
										<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500" />
										Loading guide...
									</div>
								)}
							</div>
						</div>
					</div>
				</>
			)}
			<FunctionEditorModal
				variableKey={fnEditorModal?.key ?? ""}
				value={fnEditorModal?.draft ?? null}
				props={mockData}
				onAccept={(body) => {
					if (fnEditorModal) {
						setMockData((prev) => ({
							...prev,
							[fnEditorModal.key]: `function::${body}`,
						}));
					}
					setFnEditorModal(null);
				}}
				onClose={() => setFnEditorModal(null)}
				onRemove={() => {
					if (fnEditorModal) {
						setMockData((prev) => ({ ...prev, [fnEditorModal.key]: "" }));
					}
					setFnEditorModal(null);
				}}
			/>
		</div>
	);
}
