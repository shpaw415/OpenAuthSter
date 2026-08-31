import { type UITheme, useUIThemes } from "@hooks/useUIThemes";
import { Icon } from "@iconify/react";
import type { Theme } from "@kagii/openauth/ui/theme";
import { useState } from "react";

export default function UIThemeList() {
	const { themes, isLoading, error, deleteTheme } = useUIThemes();
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const showNotification = (type: "success" | "error", message: string) => {
		setNotification({ type, message });
		setTimeout(() => setNotification(null), 3000);
	};

	const handleDelete = async (id: number) => {
		if (!confirm(`Are you sure you want to delete the theme "${id}"?`)) return;

		setDeletingId(id);
		try {
			await deleteTheme(id);
			showNotification("success", "Theme deleted successfully");
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Failed to delete theme",
			);
		} finally {
			setDeletingId(null);
		}
	};

	const getPrimaryColor = (theme: Partial<Theme>): string => {
		if (typeof theme.primary === "string") {
			return theme.primary;
		}
		return theme.primary?.light || theme.primary?.dark || "#4F46E5";
	};

	const getRadiusLabel = (radius?: Theme["radius"]): string => {
		switch (radius) {
			case "none":
				return "Square";
			case "sm":
				return "Small";
			case "md":
				return "Medium";
			case "lg":
				return "Large";
			case "full":
				return "Rounded";
			default:
				return "Default";
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
					<p className="text-red-300">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
			{/* Notification */}
			{notification && (
				<div
					className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg ${
						notification.type === "success"
							? "bg-green-600 text-white"
							: "bg-red-600 text-white"
					}`}
				>
					{notification.message}
				</div>
			)}

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-white">
						UI Themes
					</h1>
					<p className="text-gray-400 text-sm sm:text-base mt-1">
						Manage authentication page themes for your projects
					</p>
				</div>
				<a
					href="/dashboard/theme/manage"
					className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
				>
					<span className="text-lg">+</span>
					<span>Create Theme</span>
				</a>
			</div>

			{/* Themes Grid */}
			{themes.length === 0 ? (
				<div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
					<Icon
						icon="lucide:palette"
						className="w-12 h-12 mx-auto mb-4 text-gray-500"
					/>
					<h3 className="text-xl font-medium text-white mb-2">No themes yet</h3>
					<p className="text-gray-400 mb-4">
						Create your first UI theme to customize your auth pages
					</p>
					<a
						href="/dashboard/theme/manage"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Create Theme
					</a>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{themes.map((theme) => (
						<ThemeCard
							key={theme.id}
							theme={theme}
							getPrimaryColor={getPrimaryColor}
							getRadiusLabel={getRadiusLabel}
							onDelete={handleDelete}
							isDeleting={deletingId === theme.id}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function ThemeCard({
	theme,
	getPrimaryColor,
	getRadiusLabel,
	onDelete,
	isDeleting,
}: {
	theme: UITheme;
	getPrimaryColor: (theme: Partial<Theme>) => string;
	getRadiusLabel: (radius?: Theme["radius"]) => string;
	onDelete: (id: number) => void;
	isDeleting: boolean;
}) {
	const primaryColor = getPrimaryColor(theme.themeData);
	const themeData = theme.themeData;

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
			{/* Theme Preview */}
			<div className="p-4 bg-gray-900 border-b border-gray-700">
				<div className="flex items-center gap-3 mb-3">
					{/* Logo Preview */}
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
						style={{ backgroundColor: primaryColor }}
					>
						{themeData.logo ? (
							<img
								src={
									typeof themeData.logo === "string"
										? themeData.logo
										: themeData.logo.light || themeData.logo.dark
								}
								alt="Logo"
								className="w-8 h-8 object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).style.display = "none";
								}}
							/>
						) : (
							themeData.title?.charAt(0)?.toUpperCase() || "T"
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-white font-medium truncate">
							{themeData.title || "Untitled"}
						</p>
						<p className="text-gray-500 text-xs truncate">{theme.id}</p>
					</div>
				</div>

				{/* Color & Style Preview */}
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded border border-gray-600"
						style={{ backgroundColor: primaryColor }}
						title="Primary Color"
					/>
					<span className="text-gray-400 text-xs">{primaryColor}</span>
					<span className="text-gray-600 text-xs">•</span>
					<span className="text-gray-400 text-xs">
						{getRadiusLabel(themeData.radius)}
					</span>
				</div>
			</div>

			{/* Theme Info */}
			<div className="p-4">
				<div className="space-y-2 mb-4">
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-400">Font</span>
						<span className="text-gray-300 truncate max-w-37.5">
							{themeData.font?.family || "System Default"}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-400">Favicon</span>
						<span className="text-gray-300">
							{themeData.favicon ? (
								<img
									src={themeData.favicon}
									alt="Favicon"
									className="w-4 h-4"
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = "none";
									}}
								/>
							) : (
								"None"
							)}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-gray-400">Custom CSS</span>
						<span className="text-gray-300">
							{themeData.css ? "Yes" : "No"}
						</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<a
						href={`/dashboard/theme/manage?edit=${encodeURIComponent(theme.id)}`}
						className="flex-1 px-3 py-2 text-center text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
					>
						Edit
					</a>
					<button
						type="button"
						onClick={() => onDelete(theme.id)}
						disabled={isDeleting}
						className="px-3 py-2 text-sm bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isDeleting ? (
							<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-300"></div>
						) : (
							"Delete"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
