import { Icon } from "@iconify/react";
import type { ProviderType } from "openauth-webui-shared-types";

const PROVIDER_ICON_MAP: Record<ProviderType, string> = {
	// Form-based & generic - Lucide
	code: "lucide:mail",
	oidc: "lucide:shield",
	password: "lucide:lock",
	oauth: "lucide:link",
	qr: "lucide:qr-code",
	passkey: "lucide:fingerprint",

	// Company brands - Simple Icons (Iconify)
	appleoauth: "simple-icons:apple",
	appleoidc: "simple-icons:apple",
	apple: "simple-icons:apple",
	x: "simple-icons:x",
	slack: "simple-icons:slack",
	cognito: "simple-icons:amazoncognito",
	discord: "simple-icons:discord",
	facebook: "simple-icons:facebook",
	github: "simple-icons:github",
	google: "simple-icons:google",
	jumpcloud: "lucide:building-2", // No Simple Icons for JumpCloud
	keycloak: "simple-icons:keycloak",
	microsoft: "simple-icons:microsoft",
	spotify: "simple-icons:spotify",
	twitch: "simple-icons:twitch",
	yahoo: "simple-icons:yahoo",
};

/** Brand colors for company logos (Simple Icons hex values) */
const PROVIDER_BRAND_COLOR: Partial<Record<ProviderType, string>> = {
	appleoauth: "#000000",
	appleoidc: "#000000",
	apple: "#000000",
	x: "#000000",
	slack: "#4A154B",
	cognito: "#FF9900",
	discord: "#5865F2",
	facebook: "#1877F2",
	github: "#181717",
	google: "#4285F4",
	keycloak: "#23A4C8",
	microsoft: "#00A4EF",
	spotify: "#1DB954",
	twitch: "#9146FF",
	yahoo: "#6001D2",
};

export function getProviderIcon(type: ProviderType): string {
	return PROVIDER_ICON_MAP[type] ?? "lucide:key";
}

export function getProviderBrandColor(type: ProviderType): string | undefined {
	return PROVIDER_BRAND_COLOR[type];
}

export function ProviderIcon({
	type,
	className = "w-6 h-6",
}: {
	type: ProviderType;
	className?: string;
}) {
	const iconName = getProviderIcon(type);
	const brandColor = getProviderBrandColor(type);
	return (
		<Icon
			icon={iconName}
			className={className}
			style={brandColor ? { color: brandColor } : undefined}
		/>
	);
}
