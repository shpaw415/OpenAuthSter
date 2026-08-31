"no action";

import type { createClient } from "@auth";
import { inviteTable } from "openauth-webui-shared-types";
import { and, drizzle, eq } from "openauth-webui-shared-types/drizzle";

export type InviteType =
	| "project"
	| "ui_template"
	| "email_template"
	| "copy_template";

export type InviteStatus = "pending" | "accepted" | "declined";

export const invites = (_db: D1Database) => {
	const db = drizzle(_db);

	async function create({
		type,
		owner_group_id,
		label,
		from,
		invite_user_id,
	}: {
		/**
		 * the type of the invite, which can be "project", "email_template", "copy_template", or "ui_style". This field is used to categorize the invite and determine how it should be processed when accepted. For example, a "project" invite would grant access to a specific project, while an "email_template" invite would grant access to a specific email template. This categorization allows for more efficient handling of invites and ensures that the correct resources and permissions are granted to the user upon acceptance.
		 */
		type: InviteType;
		/**
		 * The ID of the group that will be assigned to the user upon accepting the invite. This field is used to manage user permissions and access levels within the system. By associating an invite with a specific group ID, administrators can control which resources and functionalities the invited user will have access to once they accept the invite and join the system.
		 */
		owner_group_id: string;
		/**
		 * User-friendly label for the invite, such as "Invite to Project X" or "Invite to Copy Template Y". This field is used to provide a clear and descriptive name for the invite, making it easier for recipients to understand the purpose of the invite when they receive it. The label can be displayed in the UI alongside other invite details to enhance the user experience and provide context about what the invite is for.
		 */
		label: string;
		from: {
			/**
			 * The ID of the user who sent the invite. This field is used to identify the sender of the invite, allowing for proper attribution and management of invites. When a user receives an invite, this field can be used to display information about who sent the invite and to track the origin of the invite within the system.
			 */
			id: string;
			/**
			 * The name of the user who sent the invite. This field is used to provide a more user-friendly representation of the sender of the invite, allowing recipients to easily recognize who sent the invite without needing to reference the user ID. It can be displayed in the UI alongside the invite details to enhance the user experience and provide context about the invite's origin.
			 */
			name: string;
		};
		/**
		 * The ID of the user who is being invited. This field is used to associate the invite with a specific user in the system, allowing for proper tracking and management of invites. When a user attempts to accept an invite, this field can be used to verify that the invite is intended for them and to grant access to the appropriate resources or permissions.
		 */
		invite_user_id: string;
	}) {
		const id = crypto.randomUUID();
		const res = await db
			.insert(inviteTable)
			.values({
				type: type as InviteType,
				owner_group_id: owner_group_id,
				label: label,
				from_user_name: from.name,
				from_user_id: from.id,
				user_id: invite_user_id,
				code: id,
				expires_at: new Date(
					Date.now() + 7 * 24 * 60 * 60 * 1000,
				).toISOString(), // Expires in 7 days
				created_at: new Date().toISOString(),
			})
			.returning()
			.get();
		if (!res) {
			return { success: false, error: "Failed to create invite" };
		} else {
			return { success: true, data: res };
		}
	}
	function deleteById(id: number) {
		return db
			.delete(inviteTable)
			.where(eq(inviteTable.id, id))
			.run()
			.then((res) => res.success);
	}
	function updateStatus(id: number, status: InviteStatus) {
		return db
			.update(inviteTable)
			.set({ status })
			.where(eq(inviteTable.id, id))
			.returning({ status: inviteTable.status })
			.get()
			.then((res) => res.status === status);
	}

	return {
		create,
		deleteById,
		confirmInvite: async (
			code: string,
			user_id: string,
			type: InviteType,
			authClient: ReturnType<typeof createClient>,
		) => {
			const res = await db
				.select()
				.from(inviteTable)
				.where(
					and(
						eq(inviteTable.code, code),
						eq(inviteTable.user_id, user_id),
						eq(inviteTable.type, type),
					),
				)
				.get();
			if (!res) return { success: false, error: "Invite not found" };

			if (new Date(res.expires_at) < new Date()) {
				await deleteById(res.id);
				return { success: false, error: "Invite has expired" };
			}

			const currentUserSession = await authClient.getUserSession("private");

			if (currentUserSession instanceof Error) {
				console.error("Failed to get user session:", currentUserSession);
				return { success: false, error: currentUserSession.message };
			}

			await authClient.updateUserSession("private", {
				group_ids: new Set([
					...(currentUserSession.private?.group_ids || []),
					res.owner_group_id,
				])
					.values()
					.toArray(),
			});

			return { success: await updateStatus(res.id, "accepted") };
		},
		declineInvite: async (code: string, user_id: string) => {
			const res = await db
				.select()
				.from(inviteTable)
				.where(
					and(eq(inviteTable.code, code), eq(inviteTable.user_id, user_id)),
				)
				.get();
			if (!res) return { success: false, error: "Invite not found" };

			return { success: await deleteById(res.id) };
		},
		revoke: async (
			user_id: string,
			owner_group_id: string,
			client: ReturnType<typeof createClient>,
		) => {
			const userInfo = await client.getUserById(user_id);
			if (userInfo instanceof Error) {
				console.error("Failed to get user:", userInfo);
				return { success: false, error: userInfo.message };
			}
			const user = userInfo.data.users.at(0);
			const currentUser = await client.getMetaData();

			if (!user) {
				return { success: false, error: "User not found" };
			} else if (!currentUser?.id) {
				return { success: false, error: "Current user not found" };
			}

			const res = await db
				.select({ owner_id: inviteTable.owner_group_id, id: inviteTable.id })
				.from(inviteTable)
				.where(
					and(
						eq(inviteTable.user_id, user_id),
						eq(inviteTable.owner_group_id, owner_group_id),
						eq(inviteTable.from_user_id, currentUser.id),
					),
				)
				.get();
			if (!res) return { success: false, error: "Invite not found" };

			if (!user.session_private?.group_ids?.includes(res.owner_id)) {
				return { success: false, error: "Unauthorized" };
			}
			await client.updateUserById(user_id, {
				session_private: {
					group_ids: user.session_private.group_ids.filter(
						(id) => id !== res.owner_id,
					),
				},
			});

			return { success: await deleteById(res.id) };
		},
		exists: ({
			type,
			user_id,
			from_id,
			owner_group_id,
		}: {
			type: InviteType;
			user_id: string;
			from_id: string;
			owner_group_id: string;
		}) => {
			return db
				.select()
				.from(inviteTable)
				.where(
					and(
						eq(inviteTable.owner_group_id, owner_group_id),
						eq(inviteTable.user_id, user_id),
						eq(inviteTable.type, type),
						eq(inviteTable.from_user_id, from_id),
					),
				)
				.get();
		},
		alreadyCollaborator(entry: typeof inviteTable.$inferSelect) {
			return entry.status === "accepted";
		},
	};
};
