import {
	DELETE as cancelEmailTemplateInvite,
	POST as createEmailTemplateInvite,
} from "@api/invites/template/email/manage";
import {
	CollaboratorManagementSection,
	type InviteItem,
} from "@components/CollaboratorManagement";
import { useAuth } from "@hooks/useAuth";
import { useEmailTemplate } from "@hooks/useEmailTemplates";
import { useParams } from "@hooks/useParams";
import { Icon } from "@iconify/react";

export default function EmailTemplateCollaborators() {
	const { template_name: templateName } = useParams<{
		template_name?: string;
	}>();

	const { template } = useEmailTemplate(templateName);
	const auth = useAuth();

	const backHref = templateName
		? `/dashboard/templates/manage?edit=${templateName}`
		: "/dashboard/templates";

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
						Email Template Collaborators
					</h2>
					<p className="text-gray-400 mt-1">
						{templateName ? `${templateName} · ` : ""}
					</p>
				</div>
			</div>

			{template && (
				<CollaboratorManagementSection
					ownerGroupId={template.owner_group_id}
					ownerId={template.owner_id}
					isOwner={template.owner_id === auth.userMeta?.id}
					inviteType="email_template"
					inviteDescription="Invite another user to access email templates for this project by their user ID."
					onInvite={(userId, fromName) =>
						createEmailTemplateInvite({
							user_id: userId,
							from_name: fromName,
							template_name: template.name,
						})
					}
					onCancelInvite={(invite: InviteItem) =>
						cancelEmailTemplateInvite({
							user_id: invite.user_id,
							owner_group_id: invite.owner_group_id,
						})
					}
				/>
			)}
		</div>
	);
}
