import {
	DELETE as cancelCopyTemplateInvite,
	POST as createCopyTemplateInvite,
} from "@api/invites/template/copy/manage";
import {
	CollaboratorManagementSection,
	type InviteItem,
} from "@components/CollaboratorManagement";
import { useAuth } from "@hooks/useAuth";
import { useCopyTemplate } from "@hooks/useCopyTemplates";
import { useParams } from "@hooks/useParams";
import { Icon } from "@iconify/react";

export default function CopyTemplateCollaborators() {
	const { template_name: templateName } = useParams<{
		template_name?: string;
	}>();

	const { template, isLoading } = useCopyTemplate(templateName);
	const auth = useAuth();

	const backHref = templateName
		? `/dashboard/copy/manage?edit=${templateName}`
		: "/dashboard/copy";

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
						Copy Template Collaborators
					</h2>
					<p className="text-gray-400 mt-1">
						{template ? `${template.name} · ` : ""}
					</p>
				</div>
			</div>

			{template && !isLoading && (
				<CollaboratorManagementSection
					ownerGroupId={template.owner_group_id}
					ownerId={template.owner_id}
					isOwner={template.owner_id === auth.userMeta?.id}
					inviteType="copy_template"
					inviteDescription="Invite another user to access this copy template by their user ID."
					onInvite={(userId, fromName) =>
						createCopyTemplateInvite({
							user_id: userId,
							from_name: fromName,
							template_id: template.id,
						})
					}
					onCancelInvite={(invite: InviteItem) =>
						cancelCopyTemplateInvite({
							user_id: invite.user_id,
							owner_group_id: invite.owner_group_id,
						})
					}
				/>
			)}
		</div>
	);
}
