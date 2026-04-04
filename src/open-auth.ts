import {
	type CacheStoreData,
	createOpenAuthsterClient,
	defaultSubjectSchema,
} from "openauth-webui-shared-types/client/user";

export const subject = defaultSubjectSchema;

export type PrivateSessionData = {
	/**
	 * Groups that the user as access to.
	 */
	group_ids?: string[];
};

export type PublicSessionData = {
	name: string;
	email: string;
};

export type RequestDataContext = {
	client: ReturnType<typeof createClient>;
};

export type Roles = "user";

export type AuthClientType = ReturnType<typeof createClient>;

const clientCache = new Map<string, CacheStoreData<Roles, never, never>>();

export const createClient = ({
	token,
	clientID,
	issuerURI,
	redirectURI,
	secret,
}: {
	token?: string;
	clientID?: string;
	issuerURI?: string;
	redirectURI?: string;
	secret?: string;
} = {}) =>
	createOpenAuthsterClient<PublicSessionData, PrivateSessionData, Roles>({
		clientID: clientID ?? process.env.PUBLIC_CLIENT_ID,
		issuerURI: issuerURI ?? process.env.PUBLIC_ISSUER,
		redirectURI: redirectURI ?? process.env.PUBLIC_REDIRECT_URI,
		subject,
		token,
		authFlowCallbacks: {
			onLoginRequired: (client) => {
				console.log("Login required");
				client.login();
			},
		},
		cache_provider: {
			get(key) {
				return Promise.resolve(clientCache.get(key) ?? null);
			},
			set(key, value) {
				clientCache.set(key, value as never);
				return Promise.resolve();
			},
			delete(key) {
				clientCache.delete(key);
				return Promise.resolve();
			},
		},
		secret,
	});
