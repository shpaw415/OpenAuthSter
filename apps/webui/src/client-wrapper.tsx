// ClientWrapper is used client side only for state management
// you can create your own version of the routerHost

import { AuthProvider } from "@hooks/useAuth";
import { RouterHost } from "frame-master-plugin-apply-react/router";
import { type JSX, StrictMode } from "react";

export default function ClientWrapper({ children }: { children: JSX.Element }) {
	return (
		<StrictMode>
			<AuthProvider>
				<RouterHost>{children}</RouterHost>
			</AuthProvider>
		</StrictMode>
	);
}
