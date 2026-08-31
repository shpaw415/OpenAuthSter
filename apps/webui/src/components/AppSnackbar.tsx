import { Snackbar } from "@material/react-snackbar";

export type NotificationState = {
	message: string;
	type?: "success" | "error";
} | null;

export function AppSnackbar({
	notification,
	onClose,
}: {
	notification: NotificationState;
	onClose: () => void;
}) {
	if (!notification) return null;
	return (
		<Snackbar
			message={notification.message}
			actionText="OK"
			timeoutMs={4000}
			onClose={onClose}
		/>
	);
}
