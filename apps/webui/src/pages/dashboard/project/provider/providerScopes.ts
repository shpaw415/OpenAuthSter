import type { ProviderType } from "openauth-webui-shared-types";

export type ScopeOption = {
	value: string;
	label?: string;
	description: string;
	mandatory?: boolean;
	recommended?: boolean;
};

const oidcScopes: ScopeOption[] = [
	{
		value: "openid",
		description: "Issue an ID token and identify the authenticated user.",
		mandatory: true,
		recommended: true,
	},
	{
		value: "profile",
		description: "Return standard profile claims such as name and picture.",
		recommended: true,
	},
	{
		value: "email",
		description: "Return the user's email-related claims.",
		recommended: true,
	},
	{
		value: "address",
		description: "Return the user's address claim when supported.",
	},
	{
		value: "phone",
		description: "Return the user's phone-related claims when supported.",
	},
	{
		value: "offline_access",
		description:
			"Allow refresh-token based access when the provider supports it.",
	},
];

const providerScopeCatalog: Partial<Record<ProviderType, ScopeOption[]>> = {
	google: [
		{
			value: "openid",
			description: "Associate the sign-in with the user's Google identity.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "email",
			description: "Read the primary Google account email address.",
			recommended: true,
		},
		{
			value: "profile",
			description:
				"Read basic Google profile information such as name and avatar.",
			recommended: true,
		},
	],
	github: [
		{
			value: "read:user",
			description: "Read the user's public profile information.",
			recommended: true,
		},
		{
			value: "user:email",
			description: "Read the user's email addresses.",
			recommended: true,
		},
		{
			value: "user",
			description: "Read and update the user's profile information.",
		},
		{
			value: "user:follow",
			description: "Follow or unfollow other users.",
		},
		{
			value: "notifications",
			description: "Read and manage repository notification threads.",
		},
		{
			value: "gist",
			description: "Create and manage gists.",
		},
		{
			value: "public_repo",
			description: "Read and write public repositories.",
		},
		{
			value: "repo",
			description: "Full access to public and private repositories.",
		},
		{
			value: "repo:status",
			description: "Read and write commit statuses.",
		},
		{
			value: "repo_deployment",
			description: "Manage deployment statuses without source access.",
		},
		{
			value: "repo:invite",
			description: "Accept or decline repository invitations.",
		},
		{
			value: "admin:repo_hook",
			description: "Fully manage repository webhooks.",
		},
		{
			value: "write:repo_hook",
			description: "Create and update repository webhooks.",
		},
		{
			value: "read:repo_hook",
			description: "Read repository webhook configuration.",
		},
		{
			value: "read:org",
			description: "Read organization membership and team data.",
		},
		{
			value: "write:org",
			description: "Manage organization membership and projects.",
		},
		{
			value: "admin:org",
			description: "Fully manage organizations and their teams.",
		},
		{
			value: "read:project",
			description: "Read user and organization projects.",
		},
		{
			value: "project",
			description: "Read and write user and organization projects.",
		},
		{
			value: "workflow",
			description: "Create and update GitHub Actions workflow files.",
		},
		{
			value: "read:packages",
			description: "Download packages from GitHub Packages.",
		},
		{
			value: "write:packages",
			description: "Publish packages to GitHub Packages.",
		},
		{
			value: "delete:packages",
			description: "Delete packages from GitHub Packages.",
		},
		{
			value: "codespace",
			description: "Create and manage Codespaces.",
		},
		{
			value: "read:audit_log",
			description: "Read organization audit log entries.",
		},
	],
	discord: [
		{
			value: "identify",
			description: "Read the user's basic Discord identity.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's Discord email address.",
			recommended: true,
		},
		{
			value: "connections",
			description: "Read the user's linked social accounts.",
		},
		{
			value: "guilds",
			description: "Read the servers the user belongs to.",
		},
		{
			value: "guilds.join",
			description: "Join the user to a server on their behalf.",
		},
		{
			value: "gdm.join",
			description: "Join the user to a group DM.",
		},
		{
			value: "messages.read",
			description: "Read messages in channels the app can access.",
		},
		{
			value: "bot",
			description: "Install the application as a bot user.",
		},
		{
			value: "applications.commands",
			description: "Install slash commands for the application.",
		},
		{
			value: "webhook.incoming",
			description: "Create incoming webhooks during authorization.",
		},
		{
			value: "role_connections.write",
			description: "Update the user's role connection metadata.",
		},
	],
	facebook: [
		{
			value: "public_profile",
			description: "Read the user's default public profile fields.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's primary email address.",
			recommended: true,
		},
		{
			value: "user_friends",
			description: "Read the user's friends who also use the app.",
		},
		{
			value: "user_birthday",
			description: "Read the user's birthday.",
		},
		{
			value: "user_gender",
			description: "Read the user's gender value.",
		},
		{
			value: "user_hometown",
			description: "Read the user's hometown.",
		},
		{
			value: "user_link",
			description: "Read the link to the user's Facebook profile.",
		},
		{
			value: "user_location",
			description: "Read the user's current city.",
		},
		{
			value: "user_likes",
			description: "Read the pages and interests liked by the user.",
		},
		{
			value: "user_photos",
			description: "Read the user's photos.",
		},
		{
			value: "user_videos",
			description: "Read the user's videos.",
		},
	],
	spotify: [
		{
			value: "user-read-email",
			description: "Read the user's email address.",
			recommended: true,
		},
		{
			value: "user-read-private",
			description: "Read private account details such as plan and country.",
			recommended: true,
		},
		{
			value: "user-personalized",
			description: "Read personalized Spotify content for the user.",
		},
		{
			value: "user-top-read",
			description: "Read the user's top artists and tracks.",
		},
		{
			value: "user-read-recently-played",
			description: "Read the user's recently played history.",
		},
		{
			value: "user-library-read",
			description: "Read the user's saved library items.",
		},
		{
			value: "user-library-modify",
			description: "Add and remove items from the user's library.",
		},
		{
			value: "playlist-read-private",
			description: "Read the user's private playlists.",
		},
		{
			value: "playlist-read-collaborative",
			description: "Read collaborative playlists.",
		},
		{
			value: "playlist-modify-private",
			description: "Create and update private playlists.",
		},
		{
			value: "playlist-modify-public",
			description: "Create and update public playlists.",
		},
		{
			value: "user-follow-read",
			description: "Read the artists and users the account follows.",
		},
		{
			value: "user-follow-modify",
			description: "Follow and unfollow artists or users.",
		},
		{
			value: "user-read-playback-state",
			description: "Read the user's current playback state.",
		},
		{
			value: "user-read-currently-playing",
			description: "Read the item the user is currently playing.",
		},
		{
			value: "user-modify-playback-state",
			description: "Control playback on the user's devices.",
		},
		{
			value: "user-read-playback-position",
			description: "Read playback position for supported content.",
		},
		{
			value: "streaming",
			description: "Control playback through the Web Playback SDK.",
		},
		{
			value: "app-remote-control",
			description: "Control playback through Spotify mobile SDKs.",
		},
		{
			value: "ugc-image-upload",
			description: "Upload user-provided images to Spotify.",
		},
	],
	twitch: [
		{
			value: "user:read:email",
			description: "Read the user's email address.",
			recommended: true,
		},
		{
			value: "user:edit",
			description: "Update the authenticated user's profile.",
		},
		{
			value: "user:edit:broadcast",
			description: "Manage the user's broadcast configuration.",
		},
		{
			value: "user:read:broadcast",
			description: "Read the user's broadcast configuration.",
		},
		{
			value: "user:read:follows",
			description: "Read the channels the user follows.",
		},
		{
			value: "user:read:subscriptions",
			description: "Check the user's channel subscriptions.",
		},
		{
			value: "clips:edit",
			description: "Create clips on behalf of the user.",
		},
		{
			value: "channel:read:subscriptions",
			description: "Read subscriptions for the user's channel.",
		},
		{
			value: "channel:read:vips",
			description: "Read VIPs in the user's channel.",
		},
		{
			value: "channel:manage:vips",
			description: "Add or remove VIPs in the user's channel.",
		},
		{
			value: "moderation:read",
			description: "Read moderation data for the user's channel.",
		},
		{
			value: "channel:moderate",
			description: "Perform moderation actions in the user's channel.",
		},
		{
			value: "chat:read",
			description: "Read chat messages over Twitch IRC.",
		},
		{
			value: "chat:edit",
			description: "Send chat messages over Twitch IRC.",
		},
		{
			value: "user:read:chat",
			description: "Receive chat events for the authorized user.",
		},
		{
			value: "user:write:chat",
			description: "Send chat messages as the authorized user.",
		},
	],
	x: [
		{
			value: "users.read",
			description: "Read user accounts the app is allowed to view.",
			recommended: true,
		},
		{
			value: "tweet.read",
			description: "Read tweets the app is allowed to view.",
			recommended: true,
		},
		{
			value: "users.email",
			description: "Read the authenticated user's email address.",
		},
		{
			value: "tweet.write",
			description: "Create and delete tweets on the user's behalf.",
		},
		{
			value: "tweet.moderate.write",
			description: "Hide and unhide replies to the user's tweets.",
		},
		{
			value: "follows.read",
			description: "Read followers and following relationships.",
		},
		{
			value: "follows.write",
			description: "Follow and unfollow users.",
		},
		{
			value: "like.read",
			description: "Read likes made by the authorized user.",
		},
		{
			value: "like.write",
			description: "Like and unlike tweets.",
		},
		{
			value: "list.read",
			description: "Read lists and their membership.",
		},
		{
			value: "list.write",
			description: "Create and manage lists.",
		},
		{
			value: "bookmark.read",
			description: "Read the user's bookmarks.",
		},
		{
			value: "bookmark.write",
			description: "Add and remove bookmarks.",
		},
		{
			value: "block.read",
			description: "Read blocked accounts.",
		},
		{
			value: "block.write",
			description: "Block and unblock accounts.",
		},
		{
			value: "mute.read",
			description: "Read muted accounts.",
		},
		{
			value: "mute.write",
			description: "Mute and unmute accounts.",
		},
		{
			value: "space.read",
			description: "Read X Spaces the user can access.",
		},
		{
			value: "dm.read",
			description: "Read direct messages available to the user.",
		},
		{
			value: "dm.write",
			description: "Send and manage direct messages.",
		},
		{
			value: "media.write",
			description: "Upload media on behalf of the user.",
		},
		{
			value: "offline.access",
			description: "Issue refresh tokens for long-lived access.",
		},
	],
	yahoo: [
		{
			value: "openid",
			description: "Issue an ID token for Yahoo sign-in.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "profile",
			description: "Read Yahoo profile claims.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's Yahoo email address.",
			recommended: true,
		},
	],
	jumpcloud: [...oidcScopes],
	oidc: [...oidcScopes],
	oauth: [
		{
			value: "profile",
			description: "Read profile information when the provider exposes it.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read email information when the provider exposes it.",
			recommended: true,
		},
		{
			value: "openid",
			description: "Enable OIDC-compatible identity responses when supported.",
		},
		{
			value: "address",
			description: "Read address information when supported.",
		},
		{
			value: "phone",
			description: "Read phone information when supported.",
		},
		{
			value: "offline_access",
			description: "Request refresh-token capable access when supported.",
		},
	],
	keycloak: [
		...oidcScopes,
		{
			value: "roles",
			description:
				"Include role claims when the realm is configured to expose them.",
		},
	],
	slack: [
		{
			value: "openid",
			description: "Required base scope for Sign in with Slack.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "profile",
			description: "Read Slack profile fields such as display name and images.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's Slack email address.",
			recommended: true,
		},
	],
	cognito: [
		{
			value: "openid",
			description: "Issue an ID token from the Cognito user pool.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "profile",
			description: "Read standard profile claims from the user pool.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's email claims.",
			recommended: true,
		},
		{
			value: "phone",
			description: "Read the user's phone number claims.",
		},
		{
			value: "aws.cognito.signin.user.admin",
			description: "Allow access to Cognito user pool self-service APIs.",
		},
	],
	microsoft: [
		{
			value: "openid",
			description: "Required base scope for Microsoft OpenID Connect.",
			mandatory: true,
			recommended: true,
		},
		{
			value: "profile",
			description: "Read profile claims such as name and username.",
			recommended: true,
		},
		{
			value: "email",
			description: "Read the user's primary email when available.",
			recommended: true,
		},
		{
			value: "User.Read",
			description: "Read the signed-in user's Microsoft Graph profile.",
			recommended: true,
		},
		{
			value: "offline_access",
			description: "Issue refresh tokens for long-lived access.",
		},
	],
	appleoauth: [
		{
			value: "email",
			description: "Read the user's Apple relay or primary email address.",
			recommended: true,
		},
		{
			value: "name",
			description: "Read the user's given and family name on first consent.",
		},
	],
	appleoidc: [
		{
			value: "email",
			description: "Read the user's Apple relay or primary email address.",
			recommended: true,
		},
		{
			value: "name",
			description: "Read the user's given and family name on first consent.",
		},
	],
};

export function getProviderScopeOptions(
	providerType: ProviderType,
): ScopeOption[] {
	return providerScopeCatalog[providerType] ?? [];
}

export function getDefaultProviderScopes(providerType: ProviderType): string[] {
	return getProviderScopeOptions(providerType)
		.filter((scope) => scope.mandatory || scope.recommended)
		.map((scope) => scope.value);
}

export function getMandatoryProviderScopes(
	providerType: ProviderType,
): string[] {
	return getProviderScopeOptions(providerType)
		.filter((scope) => scope.mandatory)
		.map((scope) => scope.value);
}

export function normalizeProviderScopes(
	providerType: ProviderType,
	scopes: string[],
): string[] {
	return uniqueScopeValues([
		...scopes,
		...getMandatoryProviderScopes(providerType),
	]);
}

export function uniqueScopeValues(scopes: string[]): string[] {
	const seen = new Set<string>();

	return scopes
		.map((scope) => scope.trim())
		.filter((scope) => {
			if (!scope || seen.has(scope)) return false;
			seen.add(scope);
			return true;
		});
}
