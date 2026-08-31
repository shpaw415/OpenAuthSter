import {
	DELETE as cancelUIThemeInvite,
	POST as createUIThemeInvite,
} from "@api/invites/template/ui/manage";
import {
	CollaboratorManagementSection,
	type InviteItem,
} from "@components/CollaboratorManagement";
import { useAuth } from "@hooks/useAuth";
import { useParams } from "@hooks/useParams";
import { useUITheme } from "@hooks/useUIThemes";
import { Icon } from "@iconify/react";

export default function UIThemeCollaborators() {
	const { theme_id } = useParams<{ theme_id?: string }>();
	const themeId = theme_id ? Number(theme_id) : null;

	const { theme, isLoading } = useUITheme(themeId);
	const auth = useAuth();

	const backHref = themeId
		? `/dashboard/theme/manage?edit=${themeId}`
		: "/dashboard/theme";

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<a
					href={backHref}
					className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
				>
					<Icon icon="lucide:arrow-left" className="w-5 h-5" />
					<span>Back</span>
				</a>
				<div>
					<h2 className="text-2xl font-bold text-white">
						UI Theme Collaborators
					</h2>
					<p className="text-gray-400 mt-1">
						{theme ? `${theme.name} · ` : ""}
					</p>
				</div>
			</div>

			{theme && !isLoading && (
				<CollaboratorManagementSection
					ownerGroupId={theme.owner_group_id}
					ownerId={theme.owner_id}
					isOwner={theme.owner_id === auth.userMeta?.id}
					inviteType="ui_template"
					inviteDescription="Invite another user to access this UI theme by their user ID."
					onInvite={(userId, fromName) =>
						createUIThemeInvite({
							user_id: userId,
							from_name: fromName,
							theme_id: themeId as number,
						})
					}
					onCancelInvite={(invite: InviteItem) =>
						cancelUIThemeInvite({
							user_id: invite.user_id,
							owner_group_id: invite.owner_group_id,
						})
					}
				/>
			)}
		</div>
	);
}
