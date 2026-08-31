import { type InviteRow, useNotifications } from "@hooks/useNotifications";
import { Icon } from "@iconify/react";
import { useState } from "react";

type InviteType = InviteRow["type"];

const inviteTypeConfig: Record<
	InviteType,
	{ label: string; icon: string; tone: string; canAccept: boolean }
> = {
	project: {
		label: "Project",
		icon: "lucide:folder",
		tone: "bg-blue-500/10 text-blue-300 border border-blue-500/30",
		canAccept: true,
	},
	email_template: {
		label: "Email Template",
		icon: "lucide:mail",
		tone: "bg-purple-500/10 text-purple-300 border border-purple-500/30",
		canAccept: true,
	},
	ui_template: {
		label: "UI Theme",
		icon: "lucide:palette",
		tone: "bg-teal-500/10 text-teal-300 border border-teal-500/30",
		canAccept: true,
	},
	copy_template: {
		label: "Copy Template",
		icon: "lucide:file-text",
		tone: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
		canAccept: true,
	},
};

const formatDate = (iso: string) => {
	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
};

const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

export default function NotificationsPage() {
	const { invites, pendingCount, isLoading, error, refetch, accept, decline } =
		useNotifications();
	const [actionState, setActionState] = useState<
		Record<number, "accepting" | "declining">
	>({});
	const [toast, setToast] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const showToast = (type: "success" | "error", message: string) => {
		setToast({ type, message });
		setTimeout(() => setToast(null), 4000);
	};

	const handleAccept = async (invite: InviteRow) => {
		setActionState((s) => ({ ...s, [invite.id]: "accepting" }));
		const res = await accept(invite);
		setActionState((s) => {
			const next = { ...s };
			delete next[invite.id];
			return next;
		});
		if (res.success) {
			showToast("success", `Accepted: ${invite.label}`);
		} else {
			showToast("error", res.error ?? "Failed to accept invite");
		}
	};

	const handleDecline = async (invite: InviteRow) => {
		setActionState((s) => ({ ...s, [invite.id]: "declining" }));
		const res = await decline(invite);
		setActionState((s) => {
			const next = { ...s };
			delete next[invite.id];
			return next;
		});
		if (res.success) {
			showToast("success", `Declined: ${invite.label}`);
		} else {
			showToast("error", res.error ?? "Failed to decline invite");
		}
	};

	const activeInvites = invites.filter((i) => !isExpired(i.expires_at));
	const expiredInvites = invites.filter((i) => isExpired(i.expires_at));

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs uppercase tracking-[0.2em] text-blue-300/80 mb-1">
						Inbox
					</p>
					<h1 className="text-2xl sm:text-3xl font-bold text-white">
						Notifications
					</h1>
					<p className="text-gray-400 text-sm mt-1">
						Manage invites and pending actions sent to you.
					</p>
				</div>
				<button
					type="button"
					onClick={() => refetch(true)}
					disabled={isLoading}
					className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:border-gray-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors self-start sm:self-auto"
				>
					{isLoading ? (
						<span className="h-4 w-4 border-2 border-blue-500/60 border-t-transparent rounded-full animate-spin" />
					) : (
						<span className="h-2 w-2 rounded-full bg-blue-400" />
					)}
					<span>Refresh</span>
				</button>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
				<StatCard label="Total" value={invites.length} tone="text-white" />
				<StatCard label="Pending" value={pendingCount} tone="text-blue-300" />
				<StatCard
					label="Expired"
					value={expiredInvites.length}
					tone="text-gray-500"
				/>
			</div>

			{/* Error state */}
			{error && (
				<div className="bg-red-900/30 border border-red-800 text-red-200 rounded-lg px-4 py-3 text-sm">
					{error}
				</div>
			)}

			{/* Loading skeleton */}
			{isLoading && <InviteSkeletons />}

			{/* Empty state */}
			{!isLoading && !error && invites.length === 0 && (
				<div className="bg-gray-900 border border-gray-800 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
					<Icon icon="lucide:bell-off" className="w-10 h-10 text-gray-600" />
					<p className="text-gray-400 text-sm">
						You have no pending notifications.
					</p>
				</div>
			)}

			{/* Active invites */}
			{!isLoading && activeInvites.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium">
						Pending
					</h2>
					{activeInvites.map((invite) => (
						<InviteCard
							key={invite.id}
							invite={invite}
							pending={actionState[invite.id]}
							onAccept={handleAccept}
							onDecline={handleDecline}
						/>
					))}
				</section>
			)}

			{/* Expired invites */}
			{!isLoading && expiredInvites.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium">
						Expired
					</h2>
					{expiredInvites.map((invite) => (
						<InviteCard
							key={invite.id}
							invite={invite}
							pending={actionState[invite.id]}
							onAccept={handleAccept}
							onDecline={handleDecline}
						/>
					))}
				</section>
			)}

			{/* Toast */}
			{toast && (
				<div
					className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 ${
						toast.type === "success"
							? "bg-green-900/90 border-green-700 text-green-200"
							: "bg-red-900/90 border-red-700 text-red-200"
					}`}
				>
					<Icon
						icon={
							toast.type === "success"
								? "lucide:check-circle"
								: "lucide:x-circle"
						}
						className="w-5 h-5 shrink-0"
					/>
					<span>{toast.message}</span>
				</div>
			)}
		</div>
	);
}

function InviteCard({
	invite,
	pending,
	onAccept,
	onDecline,
}: {
	invite: InviteRow;
	pending: "accepting" | "declining" | undefined;
	onAccept: (invite: InviteRow) => void;
	onDecline: (invite: InviteRow) => void;
}) {
	const config = inviteTypeConfig[invite.type as InviteType] ?? {
		label: invite.type,
		icon: "lucide:bell",
		tone: "bg-gray-500/10 text-gray-300 border border-gray-500/30",
		canAccept: false,
	};
	const expired = isExpired(invite.expires_at);
	const busy = pending !== undefined;

	return (
		<div
			className={`bg-gray-900 border rounded-xl p-4 sm:p-5 transition-colors ${
				expired ? "border-gray-800 opacity-60" : "border-gray-700"
			}`}
		>
			<div className="flex flex-col sm:flex-row sm:items-start gap-3">
				{/* Type badge */}
				<div className="shrink-0">
					<span
						className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.tone}`}
					>
						<Icon icon={config.icon} className="w-3.5 h-3.5" />
						{config.label}
					</span>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<p className="text-white font-medium text-sm leading-snug">
						{invite.label}
					</p>
					<p className="text-gray-400 text-xs mt-0.5">
						From{" "}
						<span className="text-gray-300 font-medium">
							{invite.from_user_name}
						</span>
					</p>
					<div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-500">
						<span>Sent {formatDate(invite.created_at)}</span>
						<span className={expired ? "text-red-400" : "text-gray-500"}>
							{expired ? "Expired" : "Expires"} {formatDate(invite.expires_at)}
						</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
					{!expired && config.canAccept && (
						<button
							type="button"
							onClick={() => onAccept(invite)}
							disabled={busy}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{pending === "accepting" ? (
								<span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
							) : (
								<Icon icon="lucide:check" className="w-3.5 h-3.5" />
							)}
							Accept
						</button>
					)}
					<button
						type="button"
						onClick={() => onDecline(invite)}
						disabled={busy}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium hover:border-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{pending === "declining" ? (
							<span className="h-3.5 w-3.5 border-2 border-gray-400/40 border-t-gray-400 rounded-full animate-spin" />
						) : (
							<Icon icon="lucide:x" className="w-3.5 h-3.5" />
						)}
						Decline
					</button>
				</div>
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: string;
}) {
	return (
		<div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
			<p className="text-xs text-gray-400 mb-1">{label}</p>
			<p className={`text-2xl font-semibold ${tone}`}>{value}</p>
		</div>
	);
}

function InviteSkeletons() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 3 }).map((_, i) => (
				<div
					key={crypto.randomUUID()}
					className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 animate-pulse"
				>
					<div className="flex flex-col sm:flex-row sm:items-start gap-3">
						<div className="h-6 w-24 rounded-full bg-gray-800" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 rounded bg-gray-800" />
							<div className="h-3 w-1/3 rounded bg-gray-800" />
						</div>
						<div className="flex gap-2">
							<div className="h-7 w-16 rounded-lg bg-gray-800" />
							<div className="h-7 w-16 rounded-lg bg-gray-800" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
