import { useCopyTemplates } from "@hooks/useCopyTemplates";
import { Icon } from "@iconify/react";
import type {
	CopyDataSelection,
	parseDBCopyTemplate,
} from "openauth-webui-shared-types";
import { type JSX, useState } from "react";

type CopyTemplate = ReturnType<typeof parseDBCopyTemplate>;

export default function CopyListPage() {
	const { templates, isLoading, error, deleteTemplate } = useCopyTemplates();
	const [deletingName, setDeletingName] = useState<string | null>(null);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const showNotification = (type: "success" | "error", message: string) => {
		setNotification({ type, message });
		setTimeout(() => setNotification(null), 3000);
	};

	const handleDelete = async (name: string) => {
		if (
			!confirm(`Are you sure you want to delete the copy template "${name}"?`)
		)
			return;

		setDeletingName(name);
		try {
			await deleteTemplate(name);
			showNotification("success", "Copy template deleted successfully");
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Failed to delete copy template",
			);
		} finally {
			setDeletingName(null);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getProviderBadge = (providerType: keyof CopyDataSelection) => {
		const config: Record<
			keyof CopyDataSelection,
			{ label: string; color: string; icon: string }
		> = {
			code: {
				label: "Pin Code",
				color: "bg-purple-500/20 text-purple-400",
				icon: "lucide:mail",
			},
			password: {
				label: "Password",
				color: "bg-blue-500/20 text-blue-400",
				icon: "lucide:lock",
			},
			passkey: {
				label: "Passkey",
				color: "bg-green-500/20 text-green-400",
				icon: "lucide:key",
			},
			qr: {
				label: "QR Code",
				color: "bg-yellow-500/20 text-yellow-400",
				icon: "lucide:qrcode",
			},
		};
		const { label, color, icon } = config[providerType];
		return (
			<span
				className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
			>
				<Icon icon={icon} className="w-3.5 h-3.5" /> {label}
			</span>
		);
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
					className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
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
						Copy Templates
					</h1>
					<p className="text-gray-400 text-sm sm:text-base mt-1">
						Customize UI text for authentication flows
					</p>
				</div>
				<a
					href="/dashboard/copy/manage"
					className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
				>
					<span className="text-lg">+</span>
					<span>Create Copy Template</span>
				</a>
			</div>

			{/* Templates Grid */}
			{templates.length === 0 ? (
				<div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
					<Icon
						icon="lucide:file-text"
						className="w-12 h-12 mx-auto mb-4 text-gray-500"
					/>
					<h3 className="text-xl font-medium text-white mb-2">
						No copy templates yet
					</h3>
					<p className="text-gray-400 mb-4">
						Create your first copy template to customize authentication UI text
					</p>
					<a
						href="/dashboard/copy/manage"
						className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Create Copy Template
					</a>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{templates.map((template) => (
						<CopyTemplateCard
							key={template.name}
							template={template}
							onDelete={handleDelete}
							isDeleting={deletingName === template.name}
							formatDate={formatDate}
							getProviderBadge={getProviderBadge}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CopyTemplateCard({
	template,
	onDelete,
	isDeleting,
	formatDate,
	getProviderBadge,
}: {
	template: CopyTemplate;
	onDelete: (name: string) => void;
	isDeleting: boolean;
	formatDate: (dateString: string) => string;
	getProviderBadge: (providerType: keyof CopyDataSelection) => JSX.Element;
}) {
	const copyCount = Object.keys(template.copyData).length;

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors">
			{/* Header */}
			<div className="p-4 border-b border-gray-700">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3 className="text-lg text-white font-medium truncate">
							{template.name}
						</h3>
						<div className="mt-1 flex items-center gap-1 flex-wrap">
							{Object.keys(template.copyData).map((key) => (
								<div className="mt-2" key={key}>
									{getProviderBadge(key as keyof CopyDataSelection)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Info */}
			<div className="p-4 space-y-3">
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-400">Customized fields</span>
					<span className="text-white font-medium">{copyCount}</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-400">Updated</span>
					<span className="text-gray-300 text-xs">
						{formatDate(template.updated_at)}
					</span>
				</div>

				{/* Preview of copy fields */}
				{copyCount > 0 && (
					<div className="pt-2 border-t border-gray-700">
						<p className="text-gray-500 text-xs mb-2">Sample fields:</p>
						<div className="flex flex-wrap gap-1">
							{Object.keys(template.copyData)
								.slice(0, 3)
								.map((key) => (
									<span
										key={key}
										className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
									>
										{key}
									</span>
								))}
							{copyCount > 3 && (
								<span className="px-2 py-0.5 text-gray-500 text-xs">
									+{copyCount - 3} more
								</span>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="p-4 pt-0 flex items-center gap-2">
				<a
					href={`/dashboard/copy/manage?edit=${encodeURIComponent(template.name)}`}
					className="flex-1 px-3 py-2 text-center text-sm bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
				>
					Edit
				</a>
				<button
					type="button"
					onClick={() => onDelete(template.name)}
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
	);
}
