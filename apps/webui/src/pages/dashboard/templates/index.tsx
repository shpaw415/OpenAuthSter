import { useEmailTemplates } from "@hooks/useEmailTemplates";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function EmailTemplatesList() {
	const { templates, isLoading, error, deleteTemplate } = useEmailTemplates();
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
		if (!confirm(`Are you sure you want to delete the template "${name}"?`))
			return;

		setDeletingName(name);
		try {
			await deleteTemplate(name);
			showNotification("success", "Template deleted successfully");
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Failed to delete template",
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
					className={`fixed left-4 right-4 top-4 z-50 rounded-lg px-4 py-3 shadow-lg sm:left-auto sm:right-4 sm:px-6 sm:py-4 ${
						notification.type === "success"
							? "bg-green-500 text-white"
							: "bg-red-500 text-white"
					}`}
				>
					{notification.message}
				</div>
			)}

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-white">Email Templates</h1>
					<p className="text-gray-400 mt-1 text-sm sm:text-base">
						Manage your email templates for authentication flows
					</p>
				</div>
				<a
					href="/dashboard/templates/manage"
					className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
				>
					<span className="text-lg">+</span>
					Create Template
				</a>
			</div>

			{/* Templates List */}
			{templates.length === 0 ? (
				<div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
					<Icon
						icon="lucide:mail"
						className="w-12 h-12 mx-auto mb-4 text-gray-500"
					/>
					<h3 className="text-xl font-medium text-white mb-2">
						No email templates yet
					</h3>
					<p className="text-gray-400 mb-4">
						Create your first email template to get started
					</p>
					<a
						href="/dashboard/templates/manage"
						className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
					>
						Create Template
					</a>
				</div>
			) : (
				<>
					<div className="space-y-4 md:hidden">
						{templates.map((template) => (
							<div
								key={template.name}
								className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-sm"
							>
								<div className="flex items-start gap-3">
									<div className="mt-0.5 rounded-lg bg-gray-900 p-2">
										<Icon
											icon="lucide:file-text"
											className="h-5 w-5 text-gray-400"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<div className="text-sm font-medium text-white wrap-break-word">
											{template.name}
										</div>
										<p className="mt-1 text-sm leading-6 text-gray-300 wrap-break-word">
											{template.subject}
										</p>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
									<div className="rounded-lg bg-gray-900/70 px-3 py-2">
										<div className="text-xs uppercase tracking-wide text-gray-500">
											Created
										</div>
										<div className="mt-1 text-gray-200">
											{formatDate(template.created_at)}
										</div>
									</div>
									<div className="rounded-lg bg-gray-900/70 px-3 py-2">
										<div className="text-xs uppercase tracking-wide text-gray-500">
											Updated
										</div>
										<div className="mt-1 text-gray-200">
											{formatDate(template.updated_at)}
										</div>
									</div>
								</div>

								<div className="mt-4 flex flex-col gap-2 sm:flex-row">
									<a
										href={`/dashboard/templates/manage?edit=${encodeURIComponent(
											template.name,
										)}`}
										className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
									>
										Edit
									</a>
									<button
										type="button"
										onClick={() => handleDelete(template.name)}
										disabled={deletingName === template.name}
										className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:opacity-50"
									>
										{deletingName === template.name ? "Deleting..." : "Delete"}
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="hidden overflow-hidden rounded-lg border border-gray-700 bg-gray-800 md:block">
						<table className="min-w-full divide-y divide-gray-700">
							<thead className="bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
										Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
										Subject
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
										Created
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
										Updated
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-700">
								{templates.map((template) => (
									<tr
										key={template.name}
										className="transition-colors hover:bg-gray-700/50"
									>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="flex items-center">
												<Icon
													icon="lucide:file-text"
													className="mr-3 h-5 w-5 text-gray-400"
												/>
												<div className="text-sm font-medium text-white">
													{template.name}
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="max-w-xs truncate text-sm text-gray-300">
												{template.subject}
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
											{formatDate(template.created_at)}
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
											{formatDate(template.updated_at)}
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
											<a
												href={`/dashboard/templates/manage?edit=${encodeURIComponent(
													template.name,
												)}`}
												className="mr-4 text-blue-400 hover:text-blue-300"
											>
												Edit
											</a>
											<button
												type="button"
												onClick={() => handleDelete(template.name)}
												disabled={deletingName === template.name}
												className="text-red-400 hover:text-red-300 disabled:opacity-50"
											>
												{deletingName === template.name
													? "Deleting..."
													: "Delete"}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
