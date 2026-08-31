import { useAuth } from "@hooks/useAuth";
import { useParams } from "@hooks/useParams";
import { useEffect } from "react";

export default function AcceptInvitePage() {
	const auth = useAuth();
	const params = useParams<{ code: string; client_id: string }>();
	useEffect(() => {
		auth.addInitializationListener("accept-invite", async () => {
			if (!auth.isAuthenticated) {
				auth.login();
			} else {
			}
		});
	}, [auth]);

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="rounded border bg-white p-8 shadow">
				<h1 className="mb-4 text-2xl font-bold">Accepting Invite...</h1>
				<p>Please wait while we process your invite.</p>
			</div>
		</div>
	);
}
