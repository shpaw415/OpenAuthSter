import { AppSnackbar } from "@components/AppSnackbar";
import { useUITheme, useUIThemes } from "@hooks/useUIThemes";
import { Icon } from "@iconify/react";
import type { Theme } from "@kagii/openauth/ui/theme";
import { navigate } from "@utils";
import { useCallback, useEffect, useState } from "react";

const importTheme = {
	SST: () => import("@kagii/openauth/ui/theme").then((m) => m.THEME_SST),
	supabase: () =>
		import("@kagii/openauth/ui/theme").then((m) => m.THEME_SUPABASE),
	terminal: () =>
		import("@kagii/openauth/ui/theme").then((m) => m.THEME_TERMINAL),
	vercel: () => import("@kagii/openauth/ui/theme").then((m) => m.THEME_VERCEL),
};

const DEFAULT_THEME: Theme = {
	title: "My Auth",
	primary: "#4F46E5",
	radius: "md",
	favicon: "",
	logo: "",
	background: "",
	font: {
		family: "",
		scale: "1",
	},
	css: "",
};

export default function UIThemeManage() {
	const [isEditMode, setIsEditMode] = useState(false);
	const [themeName, setThemeName] = useState("");
	const [themeId, setThemeId] = useState<number | null>(null);
	const [themeData, setThemeData] = useState<Partial<Theme>>(DEFAULT_THEME);
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
	const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
	const [mobilePanel, setMobilePanel] = useState<"settings" | "preview">(
		"settings",
	);
	const [showModal, setShowModal] = useState(false);

	// Get theme ID from URL for edit mode
	useEffect(() => {
		const url = new URL(window.location.href);
		const editId = url.searchParams.get("edit");
		if (editId) {
			setIsEditMode(true);
			setThemeId(Number(editId));
		} else {
			setShowModal(true);
		}
	}, []);

	const handleSetPresetTheme = useCallback(async (presetKey: string) => {
		if (presetKey === "none") return;
		const themeImporter = importTheme[presetKey as keyof typeof importTheme];
		if (!themeImporter) return;
		const presetTheme = await themeImporter();
		setThemeData(presetTheme);
	}, []);

	// Hook for fetching existing theme in edit mode
	const { theme, isLoading, error } = useUITheme(isEditMode ? themeId : null);

	// Hook for creating new themes
	const { createTheme } = useUIThemes();

	// Hook for updating themes
	const { updateTheme } = useUITheme(isEditMode ? themeId : null);

	// Load theme data when editing
	useEffect(() => {
		if (theme && isEditMode) {
			setThemeData(theme.themeData);
		}
	}, [theme, isEditMode]);

	const handleSave = async () => {
		// Validation
		if (!themeName.trim() && !isEditMode) {
			setNotification({ type: "error", message: "Theme Name is required" });
			return;
		}
		if (!themeData.primary) {
			setNotification({ type: "error", message: "Primary color is required" });
			return;
		}

		setIsSaving(true);
		try {
			if (isEditMode) {
				await updateTheme(themeData);
				setNotification({
					type: "success",
					message: "Theme updated successfully",
				});
			} else {
				await createTheme({ name: themeName, themeData });
				setNotification({
					type: "success",
					message: "Theme created successfully",
				});
				setTimeout(() => {
					navigate("/dashboard/theme");
				}, 1500);
			}
		} catch (err) {
			setNotification({
				type: "error",
				message: err instanceof Error ? err.message : "Failed to save theme",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleColorChange = useCallback(
		(
			field: "primary" | "background",
			value: string,
			mode?: "light" | "dark",
		) => {
			setThemeData((prev) => {
				if (mode) {
					const current = prev[field];
					if (typeof current === "object") {
						return { ...prev, [field]: { ...current, [mode]: value } };
					}
					return {
						...prev,
						[field]: { light: value, dark: value, [mode]: value },
					};
				}
				return { ...prev, [field]: value };
			});
		},
		[],
	);

	const toggleColorScheme = useCallback(
		(field: "primary" | "background" | "logo") => {
			setThemeData((prev) => {
				const current = prev[field];
				if (typeof current === "string") {
					return { ...prev, [field]: { light: current, dark: current } };
				}
				return { ...prev, [field]: current?.light || current?.dark || "" };
			});
		},
		[],
	);

	if (isEditMode && isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	}

	if (isEditMode && error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
					<p className="text-red-300">{error}</p>
					<a
						href="/dashboard/theme"
						className="inline-block mt-4 text-blue-400 hover:text-blue-300 transition-colors"
					>
						← Back to Themes
					</a>
				</div>
			</div>
		);
	}

	if (showModal)
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<form
					className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
					onSubmit={(e) => {
						e.preventDefault();
						const themeKey = new FormData(e.currentTarget).get("preset-theme");
						handleSetPresetTheme(themeKey as string).then(() =>
							setShowModal(false),
						);
					}}
				>
					<h2 className="text-lg font-semibold text-white mb-4">
						Select a Default Theme
					</h2>
					<select
						defaultValue="none"
						name="preset-theme"
						className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						{[...Object.keys(importTheme), "none"].map((key) => (
							<option key={key} value={key}>
								{key}
							</option>
						))}
					</select>
					<button
						type="submit"
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Accept
					</button>
				</form>
			</div>
		);

	return (
		<div className="max-w-7xl mx-auto px-4 pb-24 pt-4 sm:px-6 sm:py-6 md:pb-6 lg:px-8 lg:py-8">
			{/* Notification */}
			<AppSnackbar
				notification={notification}
				onClose={() => setNotification(null)}
			/>

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
					<a
						href="/dashboard/theme"
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white sm:w-auto sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
					>
						<span>←</span>
						Back
					</a>
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-white">
							{isEditMode ? "Edit Theme" : "Create Theme"}
						</h1>
						<p className="text-gray-400 text-sm sm:text-base mt-1">
							{isEditMode
								? `Editing: ${themeId}`
								: "Create a new UI theme for your auth pages"}
						</p>
					</div>
				</div>
				<div className="flex w-full items-center gap-2 sm:w-auto">
					{isEditMode && themeId && (
						<a
							href={`/dashboard/theme/collaborator?theme_id=${themeId}`}
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white sm:flex-none"
						>
							<Icon icon="lucide:users" className="h-4 w-4" />
							<span className="hidden sm:inline">Collaborators</span>
						</a>
					)}
					<button
						onClick={handleSave}
						disabled={isSaving}
						type="submit"
						className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
					>
						{isSaving ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
								<span className="hidden sm:inline">Saving...</span>
							</>
						) : (
							<>
								Save<span className="hidden sm:inline"> Theme</span>
							</>
						)}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Form */}
				<div
					className={`${mobilePanel === "preview" ? "hidden" : "block"} space-y-6 lg:col-span-2 lg:block`}
				>
					{/* Theme ID */}
					{!isEditMode && (
						<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
							<label
								className="block text-sm font-medium text-gray-300 mb-2"
								htmlFor="theme-id"
							>
								Theme ID
							</label>
							<input
								type="text"
								id="theme-id"
								value={themeName}
								onChange={(e) => setThemeName(e.target.value)}
								placeholder="e.g., my-custom-theme"
								className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<p className="text-gray-500 text-xs mt-1">
								A unique identifier for this theme
							</p>
						</div>
					)}

					{/* Tabs */}
					<div className="flex overflow-x-auto border-b border-gray-700">
						<button
							type="button"
							onClick={() => setActiveTab("basic")}
							className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === "basic"
									? "text-blue-400 border-b-2 border-blue-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
						>
							Basic Settings
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("advanced")}
							className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors ${
								activeTab === "advanced"
									? "text-blue-400 border-b-2 border-blue-400"
									: "text-gray-400 hover:text-gray-300"
							}`}
						>
							Advanced
						</button>
					</div>

					{activeTab === "basic" && (
						<div className="space-y-4">
							{/* Title */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-2"
									htmlFor="theme-title"
								>
									Title
								</label>
								<input
									type="text"
									id="theme-title"
									value={themeData.title || ""}
									onChange={(e) =>
										setThemeData((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder="Your App Name"
									className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							{/* Primary Color */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<label
										className="text-sm font-medium text-gray-300"
										htmlFor="theme-primary"
									>
										Primary Color
									</label>
									<button
										type="button"
										onClick={() => toggleColorScheme("primary")}
										className="text-xs text-blue-400 hover:text-blue-300"
									>
										{typeof themeData.primary === "object"
											? "Use single color"
											: "Use light/dark"}
									</button>
								</div>
								{typeof themeData.primary === "object" ? (
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-primary-light"
											>
												Light
											</label>
											<div className="flex flex-col gap-2 sm:flex-row">
												<input
													type="color"
													value={themeData.primary.light}
													onChange={(e) =>
														handleColorChange(
															"primary",
															e.target.value,
															"light",
														)
													}
													className="w-10 h-10 rounded cursor-pointer bg-transparent"
												/>
												<input
													type="text"
													value={themeData.primary.light}
													onChange={(e) =>
														handleColorChange(
															"primary",
															e.target.value,
															"light",
														)
													}
													className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg text-sm"
												/>
											</div>
										</div>
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-primary-dark"
											>
												Dark
											</label>
											<div className="flex gap-2">
												<input
													type="color"
													id="theme-primary-dark"
													value={themeData.primary.dark}
													onChange={(e) =>
														handleColorChange("primary", e.target.value, "dark")
													}
													className="w-10 h-10 rounded cursor-pointer bg-transparent"
												/>
												<input
													type="text"
													id="theme-primary-dark"
													value={themeData.primary.dark}
													onChange={(e) =>
														handleColorChange("primary", e.target.value, "dark")
													}
													className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg text-sm"
												/>
											</div>
										</div>
									</div>
								) : (
									<div className="flex gap-2">
										<input
											type="color"
											value={themeData.primary as string}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													primary: e.target.value,
												}))
											}
											className="w-10 h-10 rounded cursor-pointer bg-transparent"
										/>
										<input
											type="text"
											value={themeData.primary as string}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													primary: e.target.value,
												}))
											}
											placeholder="#4F46E5"
											className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
								)}
							</div>

							{/* Border Radius */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-2"
									htmlFor="theme-radius"
								>
									Border Radius
								</label>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
									{(["none", "sm", "md", "lg", "full"] as const).map(
										(radius) => (
											<button
												type="button"
												key={radius}
												onClick={() =>
													setThemeData((prev) => ({ ...prev, radius }))
												}
												className={`px-3 py-2 text-sm rounded-lg transition-colors ${
													themeData.radius === radius
														? "bg-blue-600 text-white"
														: "bg-gray-700 text-gray-300 hover:bg-gray-600"
												}`}
											>
												{radius.charAt(0).toUpperCase() + radius.slice(1)}
											</button>
										),
									)}
								</div>
							</div>

							{/* Logo URL */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<label
										className="text-sm font-medium text-gray-300"
										htmlFor="theme-logo"
									>
										Logo URL
									</label>
									<button
										type="button"
										onClick={() => toggleColorScheme("logo")}
										className="text-xs text-blue-400 hover:text-blue-300"
									>
										{typeof themeData.logo === "object"
											? "Use single logo"
											: "Use light/dark"}
									</button>
								</div>
								{typeof themeData.logo === "object" ? (
									<div className="space-y-3">
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-logo-light"
											>
												Light Mode Logo
											</label>
											<input
												type="url"
												value={themeData.logo?.light || ""}
												onChange={(e) =>
													setThemeData((prev) => ({
														...prev,
														logo: {
															light: e.target.value,
															dark:
																typeof prev.logo === "object"
																	? prev.logo.dark
																	: prev.logo || "",
														},
													}))
												}
												placeholder="https://example.com/logo-light.svg"
												className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg"
											/>
										</div>
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-logo-dark"
											>
												Dark Mode Logo
											</label>
											<input
												type="url"
												id="theme-logo-dark"
												value={themeData.logo?.dark || ""}
												onChange={(e) =>
													setThemeData((prev) => ({
														...prev,
														logo: {
															light:
																typeof prev.logo === "object"
																	? prev.logo.light
																	: prev.logo || "",
															dark: e.target.value,
														},
													}))
												}
												placeholder="https://example.com/logo-dark.svg"
												className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg"
											/>
										</div>
									</div>
								) : (
									<input
										type="url"
										value={(themeData.logo as string) || ""}
										onChange={(e) =>
											setThemeData((prev) => ({
												...prev,
												logo: e.target.value,
											}))
										}
										placeholder="https://example.com/logo.svg"
										className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								)}
							</div>

							{/* Favicon URL */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-2"
									htmlFor="theme-favicon"
								>
									Favicon URL
								</label>
								<input
									type="url"
									id="theme-favicon"
									value={themeData.favicon || ""}
									onChange={(e) =>
										setThemeData((prev) => ({
											...prev,
											favicon: e.target.value,
										}))
									}
									placeholder="https://example.com/favicon.ico"
									className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					)}

					{activeTab === "advanced" && (
						<div className="space-y-4">
							{/* Background Color */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<label
										className="text-sm font-medium text-gray-300"
										htmlFor="theme-background"
									>
										Background Color
									</label>
									<button
										type="button"
										onClick={() => toggleColorScheme("background")}
										className="text-xs text-blue-400 hover:text-blue-300"
									>
										{typeof themeData.background === "object"
											? "Use single color"
											: "Use light/dark"}
									</button>
								</div>
								{typeof themeData.background === "object" ? (
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-background-light"
											>
												Light
											</label>
											<div className="flex flex-col gap-2 sm:flex-row">
												<input
													type="color"
													value={themeData.background?.light || "#ffffff"}
													onChange={(e) =>
														handleColorChange(
															"background",
															e.target.value,
															"light",
														)
													}
													className="w-10 h-10 rounded cursor-pointer bg-transparent"
												/>
												<input
													type="text"
													value={themeData.background?.light || ""}
													id="theme-background-light"
													onChange={(e) =>
														handleColorChange(
															"background",
															e.target.value,
															"light",
														)
													}
													className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg text-sm"
												/>
											</div>
										</div>
										<div>
											<label
												className="text-xs text-gray-400 mb-1 block"
												htmlFor="theme-background-dark"
											>
												Dark
											</label>
											<div className="flex gap-2">
												<input
													type="color"
													id="theme-background-dark"
													value={themeData.background?.dark || "#000000"}
													onChange={(e) =>
														handleColorChange(
															"background",
															e.target.value,
															"dark",
														)
													}
													className="w-10 h-10 rounded cursor-pointer bg-transparent"
												/>
												<input
													type="text"
													value={themeData.background?.dark || ""}
													onChange={(e) =>
														handleColorChange(
															"background",
															e.target.value,
															"dark",
														)
													}
													className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg text-sm"
												/>
											</div>
										</div>
									</div>
								) : (
									<div className="flex gap-2">
										<input
											type="color"
											value={(themeData.background as string) || "#ffffff"}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													background: e.target.value,
												}))
											}
											className="w-10 h-10 rounded cursor-pointer bg-transparent"
										/>
										<input
											type="text"
											value={(themeData.background as string) || ""}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													background: e.target.value,
												}))
											}
											placeholder="#FFFFFF"
											className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg"
										/>
									</div>
								)}
							</div>

							{/* Font Settings */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-3"
									htmlFor="theme-font-family"
								>
									Font Settings
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label
											className="text-xs text-gray-400 mb-1 block"
											htmlFor="theme-font-family"
										>
											Font Family
										</label>
										<input
											type="text"
											id="theme-font-family"
											value={themeData.font?.family || ""}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													font: { ...prev.font, family: e.target.value },
												}))
											}
											placeholder="Inter, system-ui, sans-serif"
											className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg"
										/>
									</div>
									<div>
										<label
											className="text-xs text-gray-400 mb-1 block"
											htmlFor="theme-font-scale"
										>
											Font Scale
										</label>
										<input
											type="text"
											id="theme-font-scale"
											value={themeData.font?.scale || "1"}
											onChange={(e) =>
												setThemeData((prev) => ({
													...prev,
													font: { ...prev.font, scale: e.target.value },
												}))
											}
											placeholder="1"
											className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg"
										/>
									</div>
								</div>
							</div>

							{/* Custom CSS */}
							<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-2"
									htmlFor="theme-css"
								>
									Custom CSS
								</label>
								<textarea
									id="theme-css"
									value={themeData.css || ""}
									onChange={(e) =>
										setThemeData((prev) => ({ ...prev, css: e.target.value }))
									}
									placeholder="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"
									rows={6}
									className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
								/>
								<p className="text-gray-500 text-xs mt-1">
									Custom CSS to add to the auth page. Useful for importing
									fonts.
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Preview */}
				<div
					className={`${mobilePanel === "settings" ? "hidden" : "block"} lg:col-span-1 lg:block`}
				>
					<ThemePreviewPanel
						previewMode={previewMode}
						setPreviewMode={setPreviewMode}
						themeData={themeData}
					/>
				</div>
			</div>

			<nav className="fixed inset-x-0 bottom-0 z-40 flex h-12 shrink-0 border-t border-gray-700 bg-gray-900 md:hidden">
				<button
					type="button"
					onClick={() => setMobilePanel("settings")}
					className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
						mobilePanel === "settings"
							? "text-blue-400"
							: "text-gray-500 hover:text-gray-300"
					}`}
				>
					<Icon icon="lucide:sliders-horizontal" className="h-4 w-4" />
					Settings
				</button>
				<button
					type="button"
					onClick={() => setMobilePanel("preview")}
					className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
						mobilePanel === "preview"
							? "text-blue-400"
							: "text-gray-500 hover:text-gray-300"
					}`}
				>
					<Icon icon="lucide:eye" className="h-4 w-4" />
					Preview
				</button>
			</nav>
		</div>
	);
}

function ThemePreviewPanel({
	previewMode,
	setPreviewMode,
	themeData,
}: {
	previewMode: "light" | "dark";
	setPreviewMode: (mode: "light" | "dark") => void;
	themeData: Partial<Theme>;
}) {
	const previewBackground =
		typeof themeData.background === "object"
			? previewMode === "dark"
				? themeData.background.dark || "#111827"
				: themeData.background.light || "#f9fafb"
			: themeData.background ||
				(previewMode === "dark" ? "#111827" : "#f9fafb");

	const previewLogo =
		typeof themeData.logo === "object"
			? previewMode === "dark"
				? themeData.logo.dark || themeData.logo.light
				: themeData.logo.light || themeData.logo.dark
			: themeData.logo;

	const previewPrimary =
		typeof themeData.primary === "object"
			? previewMode === "dark"
				? themeData.primary.dark || themeData.primary.light
				: themeData.primary.light || themeData.primary.dark
			: themeData.primary || "#4F46E5";

	const previewRadius =
		themeData.radius === "none"
			? "0"
			: themeData.radius === "sm"
				? "0.25rem"
				: themeData.radius === "lg"
					? "0.75rem"
					: themeData.radius === "full"
						? "9999px"
						: "0.375rem";

	return (
		<div className="rounded-lg border border-gray-700 bg-gray-800 p-4 lg:sticky lg:top-4">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-base font-medium text-gray-300">Preview</h3>
					<p className="mt-1 text-xs text-gray-500 md:hidden">
						Switch between light and dark to inspect the theme output.
					</p>
				</div>
				<div className="flex items-center gap-1 rounded-lg bg-gray-900 p-1">
					<button
						type="button"
						onClick={() => setPreviewMode("light")}
						className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
							previewMode === "light"
								? "bg-gray-700 text-white"
								: "text-gray-400 hover:text-gray-300"
						}`}
					>
						<Icon icon="lucide:sun" className="mr-1 inline h-3.5 w-3.5" />
						Light
					</button>
					<button
						type="button"
						onClick={() => setPreviewMode("dark")}
						className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
							previewMode === "dark"
								? "bg-gray-700 text-white"
								: "text-gray-400 hover:text-gray-300"
						}`}
					>
						<Icon icon="lucide:moon" className="mr-1 inline h-3.5 w-3.5" />
						Dark
					</button>
				</div>
			</div>
			<div
				className="flex min-h-75 flex-col items-center justify-center rounded-lg p-5 transition-colors sm:p-6"
				style={{
					backgroundColor: previewBackground,
				}}
			>
				{themeData.logo && (
					<img
						src={previewLogo}
						alt="Logo"
						className="mb-4 h-16 w-16 object-contain"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
						}}
					/>
				)}

				<h2
					className="mb-4 text-center text-xl font-semibold transition-colors wrap-break-word"
					style={{
						fontFamily: themeData.font?.family || "system-ui",
						color: previewMode === "dark" ? "#f9fafb" : "#111827",
					}}
				>
					{themeData.title || "Your App"}
				</h2>

				<div className="w-full max-w-50 space-y-3">
					<input
						type="text"
						placeholder="Email"
						disabled
						className="w-full px-3 py-2 text-sm transition-colors"
						style={{
							backgroundColor: previewMode === "dark" ? "#1f2937" : "#ffffff",
							borderColor: previewMode === "dark" ? "#374151" : "#d1d5db",
							borderWidth: "1px",
							borderStyle: "solid",
							color: previewMode === "dark" ? "#9ca3af" : "#6b7280",
							borderRadius: previewRadius,
						}}
					/>
					<button
						type="button"
						disabled
						className="w-full px-3 py-2 text-sm font-medium text-white transition-colors"
						style={{
							backgroundColor: previewPrimary,
							borderRadius: previewRadius,
							color: previewMode === "dark" ? "#000000" : "#ffffff",
						}}
					>
						Continue
					</button>
				</div>
			</div>
		</div>
	);
}
