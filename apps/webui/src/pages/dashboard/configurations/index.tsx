import { AppSnackbar } from "@components/AppSnackbar";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import {
	getCurrentIssuerVersion,
	getCurrentWebUiVersion,
	getLatestVersion,
} from "../../../version-check";

export default function ConfigurationsPage() {
	const [newVersionAvailable, setNewVersionAvailable] = useState(false);
	const [openauthsterVersions, setOpenAuthSterVersions] = useState<{
		latestWebUIV: string | null;
		currentWebUI: string | null;
		latestIssuer: string | null;
		currentIssuer: string | null;
	}>({
		latestWebUIV: null,
		currentWebUI: null,
		latestIssuer: null,
		currentIssuer: null,
	});
	const [notification, setNotification] = useState<{ message: string } | null>(
		null,
	);

	const [error, setError] = useState<string | null>(null);

	const checkVersions = useCallback(async () => {
		try {
			setOpenAuthSterVersions({
				currentWebUI: getCurrentWebUiVersion(),
				latestWebUIV: await getLatestVersion("OpenAuthSter-webUI"),
				currentIssuer: await getCurrentIssuerVersion(process.env.PUBLIC_ISSUER),
				latestIssuer: await getLatestVersion("OpenAuthSter-issuer"),
			});
		} catch (error) {
			console.error("Error fetching versions:", error);
			setError("Failed to fetch version information. Please try again later.");
		}
	}, []);

	useEffect(() => {
		checkVersions();
	}, []);

	const handleCheckVersionsClick = useCallback(() => {
		if (
			openauthsterVersions.currentWebUI !== openauthsterVersions.latestWebUIV ||
			openauthsterVersions.currentIssuer !== openauthsterVersions.latestIssuer
		) {
			setNewVersionAvailable(true);
		} else {
			setNotification({
				message:
					"You are already using the latest versions of both Web UI and Issuer.",
			});
		}
	}, [openauthsterVersions]);

	return (
		<div className="min-h-screen bg-gray-900">
			<AppSnackbar
				notification={notification}
				onClose={() => setNotification(null)}
			/>
			{newVersionAvailable && (
				<NewVersionModale
					onClose={() => setNewVersionAvailable(false)}
					webUIVersion={openauthsterVersions.currentWebUI}
					issuerVersion={openauthsterVersions.currentIssuer}
					latestUIVersion={openauthsterVersions.latestWebUIV}
					latestIssuerVersion={openauthsterVersions.latestIssuer}
					onRefresh={checkVersions}
				/>
			)}

			<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white">Configurations</h1>
					<p className="mt-2 text-gray-400">
						Manage and monitor your OpenAuthSter settings
					</p>
				</div>

				<div className="space-y-6">
					{/* Error Message */}
					{error && (
						<div className="rounded-lg border border-red-700 bg-red-900/20 p-4">
							<div className="flex items-start gap-3">
								<Icon
									icon="lucide:alert-triangle"
									className="w-6 h-6 text-amber-400 shrink-0"
								/>
								<div className="flex-1">
									<p className="font-medium text-red-300">{error}</p>
									<button
										onClick={() => setError(null)}
										className="mt-2 text-sm text-red-200 underline transition hover:text-red-100"
									>
										Dismiss
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Version Control Section */}
					<div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold text-white">
									Version Management
								</h2>
								<p className="mt-1 text-sm text-gray-400">
									Check for available updates and monitor version compatibility
								</p>
							</div>
							<button
								onClick={handleCheckVersionsClick}
								className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
							>
								Check Versions
							</button>
						</div>

						<div className="mt-6 space-y-4">
							<div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-400">
											Current Web UI Version
										</p>
										<p className="mt-1 text-lg font-semibold text-white">
											{openauthsterVersions.currentWebUI || "Loading..."}
										</p>
									</div>
									<div className="rounded-full bg-gray-700 p-3">
										<Icon
											icon="lucide:monitor"
											className="w-5 h-5 text-gray-400"
										/>
									</div>
								</div>
							</div>

							<div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-400">
											Current Issuer Version
										</p>
										<p className="mt-1 text-lg font-semibold text-white">
											{openauthsterVersions.currentIssuer || "Loading..."}
										</p>
									</div>
									<div className="rounded-full bg-gray-700 p-3">
										<Icon
											icon="lucide:lock"
											className="w-5 h-5 text-gray-400"
										/>
									</div>
								</div>
							</div>

							{newVersionAvailable && (
								<div className="rounded-lg border border-green-700 bg-green-900/20 p-4">
									<div className="flex items-center gap-3">
										<Icon
											icon="lucide:check-circle"
											className="w-6 h-6 text-green-400 shrink-0"
										/>
										<div>
											<p className="font-medium text-green-300">
												New versions available
											</p>
											<p className="text-sm text-green-200">
												Click "Check Versions" to see the details and update
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function NewVersionModale({
	webUIVersion,
	issuerVersion,
	latestUIVersion,
	latestIssuerVersion,
	onClose,
	onRefresh,
}: {
	webUIVersion: string | null;
	latestUIVersion: string | null;
	issuerVersion: string | null;
	latestIssuerVersion: string | null;
	onClose?: () => void;
	onRefresh?: () => void;
}) {
	const displayWebUiVersion = webUIVersion ?? "unknown";
	const displayIssuerVersion = issuerVersion ?? "unknown";
	const displayLatestUIVersion = latestUIVersion ?? "unknown";
	const displayLatestIssuerVersion = latestIssuerVersion ?? "unknown";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl">
				<div className="relative bg-linear-to-r from-blue-600 to-sky-500 px-6 py-5">
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
						>
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					)}
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
							<span className="text-lg">⬆</span>
						</div>
						<div>
							<h2 className="text-xl font-semibold text-white">
								New Version Available
							</h2>
							<p className="text-sm text-blue-100">
								Update to keep your issuer and Web UI in sync.
							</p>
						</div>
					</div>
				</div>

				<div className="px-6 py-6">
					<div className="mb-5 overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-700 bg-gray-800">
									<th className="px-4 py-3 text-left font-semibold text-gray-300"></th>
									<th className="px-4 py-3 text-center font-semibold text-gray-300">
										Current Version
									</th>
									<th className="px-4 py-3 text-center font-semibold text-gray-300">
										New Version
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b border-gray-700 bg-gray-800">
									<td className="px-4 py-3 font-medium text-gray-300">
										Web UI
									</td>
									<td className="px-4 py-3 text-center">
										<span className="inline-block rounded-full bg-gray-700 px-3 py-1 font-medium text-gray-200">
											{displayWebUiVersion}
										</span>
									</td>
									<td className="px-4 py-3 text-center">
										<span className="inline-block rounded-full bg-green-900 px-3 py-1 font-medium text-green-300">
											{displayLatestUIVersion}
										</span>
									</td>
								</tr>
								<tr className="bg-gray-800">
									<td className="px-4 py-3 font-medium text-gray-300">
										Issuer
									</td>
									<td className="px-4 py-3 text-center">
										<span className="inline-block rounded-full bg-gray-700 px-3 py-1 font-medium text-gray-200">
											{displayIssuerVersion}
										</span>
									</td>
									<td className="px-4 py-3 text-center">
										<span className="inline-block rounded-full bg-green-900 px-3 py-1 font-medium text-green-300">
											{displayLatestIssuerVersion}
										</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<p className="text-sm text-gray-400">
						A new version of OpenAuthSter is available. Refresh to load the
						latest assets, or review the release notes before updating.
					</p>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
						<button
							onClick={onRefresh}
							className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
						>
							Refresh Now
						</button>
						<a
							href="https://github.com/shpaw415/OpenAuthSter"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-600"
						>
							View on GitHub
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
