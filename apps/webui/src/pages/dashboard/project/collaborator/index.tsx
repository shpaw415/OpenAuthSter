import {
	DELETE as cancelInvite,
	POST as createInvite,
} from "@api/invites/project/manage";
import {
	CollaboratorManagementSection,
	type InviteItem,
} from "@components/CollaboratorManagement";
import { useParams } from "@hooks/useParams";
import { useProject } from "@hooks/useProjects";
import { Icon } from "@iconify/react";

export default function ProjectCollaborators() {
	const { project_id: clientID } = useParams<{ project_id: string }>();
	const projectHook = useProject(clientID);

	if (projectHook.isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
						<p className="text-gray-400">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (projectHook.error || !projectHook.project) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex flex-col items-center justify-center py-20">
					<div className="relative mb-6">
						<div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
						<div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-900/40 border border-red-700/50">
							<Icon
								icon="lucide:alert-circle"
								className="w-10 h-10 text-red-400"
							/>
						</div>
					</div>
					<h2 className="text-xl font-semibold text-white mb-2">
						Something went wrong
					</h2>
					<p className="text-red-300 text-sm text-center max-w-md mb-8">
						{projectHook.error}
					</p>
					<a
						href={`/dashboard/project?project_id=${clientID}`}
						className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
					>
						<Icon icon="lucide:arrow-left" className="w-4 h-4" />
						<span>Back to Project</span>
					</a>
				</div>
			</div>
		);
	}

	const { project, isProjectOwner } = projectHook;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8">
			{/* Header */}
			<div className="flex items-center space-x-4">
				<a
					href={`/dashboard/project?project_id=${clientID}`}
					className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
				>
					<Icon icon="lucide:arrow-left" className="w-5 h-5" />
					<span>Back</span>
				</a>
				<div>
					<h2 className="text-2xl font-bold text-white">Collaborators</h2>
					<p className="text-gray-400 mt-1">{project.name}</p>
				</div>
			</div>

			<CollaboratorManagementSection
				ownerGroupId={project.owner_group_id}
				ownerId={project.owner_id}
				isOwner={isProjectOwner}
				inviteType="project"
				inviteDescription="Invite another user to co-manage this project by their user ID."
				onInvite={
					isProjectOwner
						? (userId, fromName) =>
								createInvite({
									user_id: userId,
									client_id: project.clientID,
									from_name: fromName,
								})
						: undefined
				}
				onCancelInvite={(invite: InviteItem) =>
					cancelInvite({
						user_id: invite.user_id,
						owner_group_id: invite.owner_group_id,
					})
				}
			/>
		</div>
	);
}
