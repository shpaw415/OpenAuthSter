import { GET as getInvites } from "@api/invites";
import { DELETE as revokeCollaborator } from "@api/invites/revoke";
import { GET as getUserInfo } from "@api/users/info";
import { AppSnackbar } from "@components/AppSnackbar";
import { InviteCollaboratorForm } from "@components/vary";
import { Icon } from "@iconify/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

export type InviteStatus = "pending" | "accepted" | "declined";

export type InviteItem = {
	id: number;
	label: string;
	from_user_id: string;
	from_user_name: string;
	user_id: string;
	code: string;
	type: string;
	owner_group_id: string;
	expires_at: string;
	created_at: string;
	status: InviteStatus;
};

type UserInfo = Exclude<
	Awaited<ReturnType<typeof getUserInfo>>["data"],
	undefined
>[number];

interface Props {
	ownerGroupId: string;
	ownerId: string;
	isOwner: boolean;
	inviteType: string;
	inviteDescription?: string;
	onInvite?: (
		userId: string,
		fromName: string,
	) => Promise<{ success: boolean; error?: string }>;
	onCancelInvite: (
		invite: InviteItem,
	) => Promise<{ success?: boolean; error?: string } | undefined>;
}

export function CollaboratorManagementSection({
	ownerGroupId,
	ownerId,
	isOwner,
	inviteType,
	inviteDescription,
	onInvite,
	onCancelInvite,
}: Props) {
	const [invites, setInvites] = useState<InviteItem[]>([]);
	const [isLoadingInvites, setIsLoadingInvites] = useState(false);
	const [notification, setNotification] = useState<{
		message: string;
	} | null>(null);
	const [revoking, setRevoking] = useState<string | null>(null);
	const [ownerInfo, setOwnerInfo] = useState<UserInfo | null>(null);
	const [usersList, setUsersList] = useState<UserInfo[]>([]);

	const fetchInvites = useCallback(async () => {
		if (!ownerGroupId) return;
		setIsLoadingInvites(true);
		try {
			const res = await getInvites({
				type: "all",
				owner_group_id: ownerGroupId,
			});
			if (res?.success) {
				const filtered = (res.data as InviteItem[]).filter(
					(inv) => inv.type === inviteType,
				);
				await getUserInfo({ user_ids: filtered.map((inv) => inv.user_id) })
					.then((userRes) => {
						if (userRes?.success && userRes.data) setUsersList(userRes.data);
					})
					.finally(() => setInvites(filtered));
			}
		} finally {
			setIsLoadingInvites(false);
		}
	}, [ownerGroupId, inviteType]);

	useEffect(() => {
		fetchInvites();
	}, [fetchInvites]);

	useEffect(() => {
		if (!ownerId) return;
		getUserInfo({ user_ids: [ownerId] }).then((res) => {
			if (res?.success && res.data?.[0]) setOwnerInfo(res.data[0]);
		});
	}, [ownerId]);

	const handleRemove = async (invite: InviteItem) => {
		const userInfo = usersList.find((u) => u.id === invite.user_id);
		const label =
			invite.status === "accepted" ? "revoke access for" : "cancel invite for";
		if (
			!confirm(
				`Are you sure you want to ${label} user ${
					userInfo?.session_public?.name ??
					userInfo?.session_public?.email ??
					userInfo?.identifier
				}?`,
			)
		)
			return;

		setRevoking(invite.user_id);
		try {
			const res =
				invite.status === "accepted"
					? await revokeCollaborator({
							owner_group_id: invite.owner_group_id,
							user_id: invite.user_id,
						})
					: await onCancelInvite(invite);

			if (res?.success) {
				setNotification({
					message:
						invite.status === "accepted"
							? "Access revoked successfully"
							: "Invite cancelled",
				});
				setInvites((prev) => prev.filter((inv) => inv.id !== invite.id));
			} else {
				setNotification({
					message: (res as { error?: string })?.error ?? "Operation failed",
				});
			}
		} catch (err) {
			setNotification({
				message: err instanceof Error ? err.message : "Operation failed",
			});
		} finally {
			setRevoking(null);
		}
	};

	const acceptedInvites = invites.filter((inv) => inv.status === "accepted");
	const pendingInvites = invites.filter((inv) => inv.status === "pending");

	return (
		<>
			<AppSnackbar
				notification={notification}
				onClose={() => setNotification(null)}
			/>

			{isOwner && onInvite && (
				<InviteCollaboratorForm
					onInvite={onInvite}
					onSuccess={() => {
						setNotification({ message: "Collaborator invited successfully!" });
						fetchInvites();
					}}
					description={inviteDescription}
				/>
			)}

			{/* Owner */}
			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
				<h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
					<Icon icon="lucide:crown" className="w-5 h-5 text-yellow-400" />
					Owner
				</h3>
				<div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 border border-gray-700">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-9 h-9 rounded-full border bg-yellow-900/40 border-yellow-700/50">
							<Icon icon="lucide:crown" className="w-4 h-4 text-yellow-400" />
						</div>
						<div>
							<p className="text-white text-sm font-medium">
								{ownerInfo?.session_public?.name ??
									ownerInfo?.session_public?.email ??
									ownerInfo?.identifier ??
									ownerId}
							</p>
							<p className="text-gray-500 text-xs">Owner</p>
						</div>
					</div>
					{isOwner && (
						<span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400">
							You
						</span>
					)}
				</div>
			</div>

			{/* Active Collaborators */}
			<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
				<h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
					<Icon icon="lucide:users" className="w-5 h-5 text-blue-400" />
					Active Collaborators
					{acceptedInvites.length > 0 && (
						<span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400">
							{acceptedInvites.length}
						</span>
					)}
				</h3>

				{isLoadingInvites ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
					</div>
				) : acceptedInvites.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<Icon
							icon="lucide:users"
							className="w-10 h-10 text-gray-600 mb-3"
						/>
						<p className="text-gray-400">No active collaborators yet.</p>
						<p className="text-gray-500 text-sm mt-1">
							Invite someone above to get started.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{acceptedInvites.map((inv) => (
							<CollaboratorRow
								key={inv.id}
								usersList={usersList}
								isOwner={isOwner}
								invite={inv}
								isRevoking={revoking === inv.user_id}
								onRemove={handleRemove}
								actionLabel="Revoke"
								actionIcon="lucide:user-x"
							/>
						))}
					</div>
				)}
			</div>

			{/* Pending Invites */}
			{(isLoadingInvites || pendingInvites.length > 0) && (
				<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
					<h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
						<Icon icon="lucide:clock" className="w-5 h-5 text-amber-400" />
						Pending Invites
						{pendingInvites.length > 0 && (
							<span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400">
								{pendingInvites.length}
							</span>
						)}
					</h3>

					{isLoadingInvites ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
						</div>
					) : (
						<div className="space-y-3">
							{pendingInvites.map((inv) => (
								<CollaboratorRow
									key={inv.id}
									invite={inv}
									usersList={usersList}
									isOwner={isOwner}
									isRevoking={revoking === inv.user_id}
									onRemove={handleRemove}
									actionLabel="Cancel"
									actionIcon="lucide:x"
									statusBadge={
										<span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400">
											Pending
										</span>
									}
									avatarClass="bg-amber-900/40 border-amber-700/50"
									avatarIconClass="text-amber-400"
									avatarIcon="lucide:user-plus"
									subtext={`Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</>
	);
}

function CollaboratorRow({
	invite,
	isRevoking,
	usersList,
	onRemove,
	actionLabel,
	actionIcon,
	statusBadge,
	avatarClass = "bg-blue-900/40 border-blue-700/50",
	avatarIconClass = "text-blue-400",
	avatarIcon = "lucide:user",
	subtext,
	isOwner,
}: {
	invite: InviteItem;
	usersList: UserInfo[];
	isRevoking: boolean;
	isOwner: boolean;
	onRemove: (invite: InviteItem) => void;
	actionLabel: string;
	actionIcon: string;
	statusBadge?: ReactNode;
	avatarClass?: string;
	avatarIconClass?: string;
	avatarIcon?: string;
	subtext?: string;
}) {
	const userInfo = useMemo(
		() => usersList.find((user) => user.id === invite.user_id),
		[usersList, invite.user_id],
	);

	return (
		<div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 border border-gray-700">
			<div className="flex items-center gap-3">
				<div
					className={`flex items-center justify-center w-9 h-9 rounded-full border ${avatarClass}`}
				>
					<Icon icon={avatarIcon} className={`w-4 h-4 ${avatarIconClass}`} />
				</div>
				<div>
					<p className="text-white text-sm font-medium">
						{userInfo?.session_public?.name ??
							userInfo?.session_public?.email ??
							userInfo?.identifier}
					</p>
					<p className="text-gray-500 text-xs">
						{subtext ??
							`Joined ${new Date(invite.created_at).toLocaleDateString()}`}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{statusBadge}
				{isOwner && (
					<button
						type="button"
						disabled={isRevoking}
						onClick={() => onRemove(invite)}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 border border-red-700/50 rounded-lg transition-colors disabled:opacity-50"
					>
						{isRevoking ? (
							<div className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
						) : (
							<Icon icon={actionIcon} className="w-3.5 h-3.5" />
						)}
						{actionLabel}
					</button>
				)}
			</div>
		</div>
	);
}
