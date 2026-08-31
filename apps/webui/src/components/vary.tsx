import { useAuth } from "@hooks/useAuth";
import { Icon } from "@iconify/react";
import { type SubmitEventHandler, useState } from "react";

export function InviteCollaboratorForm({
	onInvite,
	onSuccess,
	description,
}: {
	onInvite: (
		userId: string,
		fromName: string,
	) => Promise<{ success: boolean; error?: string }>;
	onSuccess: () => void;
	description?: string;
}) {
	const auth = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		const userId = new FormData(e.currentTarget)
			.get("userId")
			?.toString()
			.trim();
		if (!userId) return;
		setIsLoading(true);
		setError(null);
		try {
			const session = await auth.getUserSession("public");
			const fromName =
				session instanceof Error
					? ""
					: (session.public?.name ??
						session.public?.email ??
						session.user_identifier);
			const res = await onInvite(userId, fromName);
			if (res.success) {
				onSuccess();
				(e.target as HTMLFormElement).reset();
			} else {
				setError(res.error ?? "Unknown error");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send invite");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-white flex items-center gap-2">
					<Icon icon="lucide:user-plus" className="w-5 h-5 text-blue-400" />
					Invite Collaborator
				</h2>
				{description && (
					<p className="text-gray-400 text-sm mt-1">{description}</p>
				)}
			</div>
			<form onSubmit={handleSubmit} className="flex gap-3">
				<input
					type="text"
					required
					name="userId"
					placeholder="User ID"
					disabled={isLoading}
					className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={isLoading}
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
				>
					{isLoading ? (
						<>
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							Sending...
						</>
					) : (
						<>
							<Icon icon="lucide:user-plus" className="w-4 h-4" />
							Send Invite
						</>
					)}
				</button>
			</form>
			{error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
		</div>
	);
}
