import { ErrorBoundary } from "@components/ErrorBoundary";
import { useAuth } from "@hooks/useAuth";
import { useNotifications } from "@hooks/useNotifications";
import { Icon } from "@iconify/react";
import OpenAuthsterLogo from "@static/logo.webp";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	getCurrentIssuerVersion,
	getCurrentWebUiVersion,
} from "../../version-check";

const semver = require("semver");

export default function AdminLayout({ children }: { children: ReactNode }) {
	const auth = useAuth();
	const { pendingCount } = useNotifications();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const lastHrefRef = useRef<string>("");

	const [VersionWarningMessage, setVersionWarningMessage] = useState<
		string | null
	>(null);

	const clearWraningMessageTimeoutRef = useCallback(() => {
		if (VersionWarningMessage) {
			const timeout = setTimeout(() => {
				setVersionWarningMessage(null);
			}, 15000); // Clear warning after 15 seconds

			return () => clearTimeout(timeout);
		}
	}, [VersionWarningMessage]);

	useEffect(() => {
		if (process.env.NODE_ENV === "development") return;
		const func = async () => {
			const currentwebUIVersion = getCurrentWebUiVersion();
			const currentIssuerVersion = await getCurrentIssuerVersion(
				process.env.PUBLIC_ISSUER,
			);

			// Extract major.minor version (e.g., "0.3" from "0.3.1")
			const webUIParts = currentwebUIVersion.split(".");
			const issuerParts = currentIssuerVersion.split(".");
			const webUIMajorMinor = `${webUIParts[0]}.${webUIParts[1]}.0`;
			const issuerMajorMinor = `${issuerParts[0]}.${issuerParts[1]}.0`;

			// Check if major.minor versions match (patch version differences are compatible)
			if (semver.gt(issuerMajorMinor, webUIMajorMinor)) {
				setVersionWarningMessage(
					`Warning: Your OpenAuthSter Web UI version (${currentwebUIVersion}) is not compatible with the current issuer version (${currentIssuerVersion}). Please update your Web UI to ensure compatibility and access to the latest features and security updates.`,
				);
			} else if (semver.gt(webUIMajorMinor, issuerMajorMinor)) {
				setVersionWarningMessage(
					`Warning: Your OpenAuthSter issuer version (${currentIssuerVersion}) is not compatible with the current Web UI version (${currentwebUIVersion}). Please update your issuer to ensure compatibility and access to the latest features and security updates.`,
				);
			}
		};
		func().then(() => clearWraningMessageTimeoutRef());
	}, [clearWraningMessageTimeoutRef]);

	const NavLinks = useMemo(
		() => [
			{ href: "/dashboard/", icon: "lucide:home", name: "Dashboard" },
			{
				href: "/dashboard/templates",
				icon: "lucide:layout-template",
				name: "Templates",
			},
			{ href: "/dashboard/theme", icon: "lucide:palette", name: "UI theme" },
			{ name: "Copy Text", href: "/dashboard/copy", icon: "lucide:file-text" },
			{ name: "Users", href: "/dashboard/users", icon: "lucide:users" },
			{ name: "Logs", href: "/dashboard/activity", icon: "lucide:activity" },
			{
				name: "Configurations",
				href: "/dashboard/configurations",
				icon: "lucide:settings",
			},
		],
		[],
	);
	useEffect(() => {
		auth.addInitializationListener("AdminLayout", (client) => {
			if (!client.isAuthenticated && client.isLoaded) {
				setTimeout(() => {
					if (process.env.NODE_ENV !== "development") {
						client.login();
					}
					console.log(client);
				}, 1000);
			}
		});
		if (auth.isAuthenticated && !auth.userMeta.id) {
			auth.getUserSession("public").then((session) => {
				if (session instanceof Error) return;
				auth.triggerUpdate();
			});
		}
	}, [auth]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		lastHrefRef.current = window.location.href;

		const closeMenuOnLocationChange = () => {
			const nextHref = window.location.href;

			if (lastHrefRef.current !== nextHref) {
				lastHrefRef.current = nextHref;
				setMobileMenuOpen(false);
			}
		};

		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function (...args) {
			originalPushState.apply(window.history, args);
			closeMenuOnLocationChange();
		};

		window.history.replaceState = function (...args) {
			originalReplaceState.apply(window.history, args);
			closeMenuOnLocationChange();
		};

		window.addEventListener("popstate", closeMenuOnLocationChange);
		window.addEventListener("hashchange", closeMenuOnLocationChange);

		return () => {
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
			window.removeEventListener("popstate", closeMenuOnLocationChange);
			window.removeEventListener("hashchange", closeMenuOnLocationChange);
		};
	}, []);

	// Show loading while checking auth
	if (!auth?.isLoaded && typeof window !== "undefined") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Header */}
			<header className="bg-gray-800 border-b border-gray-700">
				{VersionWarningMessage && (
					<div className="fixed w-full top-0 left-0 z-50 flex items-center justify-center bg-yellow-600 text-yellow-100 ">
						<div className="px-4 py-2 text-sm text-center">
							{VersionWarningMessage}
						</div>
						<button
							type="button"
							className="absolute top-0 right-0 p-2 cursor-pointer hover:bg-yellow-700/50 rounded"
							onClick={() => setVersionWarningMessage(null)}
							aria-label="Dismiss"
						>
							<Icon icon="lucide:x" className="w-5 h-5" />
						</button>
					</div>
				)}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14 sm:h-16">
						{/* Logo */}
						<div className="flex items-center">
							<a href="/" className="flex items-center space-x-2 sm:space-x-3">
								<span className="text-xl sm:text-2xl">
									<img
										src={OpenAuthsterLogo.src(320)}
										alt="OpenAuthSter Logo"
										className="h-8 w-auto"
									/>
								</span>
								<span className="text-lg sm:text-xl font-bold text-white">
									OpenAuthster Admin
								</span>
							</a>
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden lg:flex items-center space-x-6">
							{NavLinks.map((link) => (
								<NavLinkDesktop
									key={link.href}
									href={link.href}
									icon={link.icon}
									name={link.name}
								/>
							))}
						</nav>

						{/* Desktop Actions */}
						<div className="hidden lg:flex items-center space-x-4">
							{auth?.isAuthenticated ? (
								<>
									<a
										href="/dashboard/notifications"
										className="group relative h-10 w-10 flex items-center justify-center rounded-lg text-gray-300 transition-all duration-500 ease-in-out hover:scale-110"
									>
										<Icon
											icon="lucide:bell"
											className="w-5 h-5 text-gray-300 hover:text-white transition-colors"
										/>
										{pendingCount > 0 && (
											<span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none ring-2 ring-gray-900">
												{pendingCount > 9 ? "9+" : pendingCount}
											</span>
										)}
										<span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out border border-gray-700">
											Notifications
										</span>
									</a>
									<button
										type="button"
										onClick={() =>
											auth?.logout().then(() => console.log("Logged out"))
										}
										className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
									>
										Logout
									</button>
								</>
							) : (
								<button
									type="button"
									onClick={() => auth.login()}
									className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								>
									Login
								</button>
							)}
						</div>

						{/* Mobile Menu Button */}
						<button
							type="button"
							className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							<span className="sr-only">Open main menu</span>
							{mobileMenuOpen ? (
								<Icon icon="lucide:x" className="h-6 w-6" />
							) : (
								<Icon icon="lucide:menu" className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				<div
					id="mobile-menu"
					className={`lg:hidden transition-all duration-200 ease-in-out overflow-hidden ${
						mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
					}`}
				>
					<div className="px-4 pt-2 pb-4 space-y-1 bg-gray-800 border-t border-gray-700">
						{NavLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="flex items-center px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Icon
									icon={link.icon}
									className="inline-block w-5 h-5 mr-1 text-white"
								/>
								<span className="ml-2">{link.name}</span>
							</a>
						))}
						<div className="pt-3 mt-3 border-t border-gray-700">
							{auth?.isAuthenticated && (
								<p className="px-3 py-2 text-sm text-gray-400">Logged in</p>
							)}
							<button
								type="button"
								onClick={() => {
									setMobileMenuOpen(false);
									auth?.logout();
								}}
								className="w-full text-left px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main>
				<ErrorBoundary>{children}</ErrorBoundary>
			</main>
		</div>
	);
}

function NavLinkDesktop({
	href,
	icon,
	name,
}: {
	href: string;
	icon: string;
	name: string;
}) {
	const [isRippling, setIsRippling] = useState(false);
	const aRef = useRef<HTMLAnchorElement>(null);

	const handleClick = () => {
		setIsRippling(true);
		setTimeout(() => setIsRippling(false), 600);
	};

	return (
		<a
			ref={aRef}
			href={href}
			title={name}
			onClick={handleClick}
			className="group relative h-10 w-10 flex items-center justify-center rounded-lg text-gray-300 transition-all duration-500 ease-in-out hover:scale-110"
		>
			<Icon
				icon={icon}
				className="w-5 h-5 text-slate-200 group-hover:text-white"
			/>
			<span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out border border-gray-700">
				{name}
			</span>
			{isRippling && <Ripple />}
		</a>
	);
}

function Ripple() {
	return (
		<span className="absolute inset-0 translate-[50%] rounded-full bg-gray-700 animate-ping max-w-5 max-h-5"></span>
	);
}
