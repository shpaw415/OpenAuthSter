export const AUTH_STORAGE_KEYS = {
	token: "oa_token",
	refresh: "oa_refresh_token",
	challenge: "oa_challenge",
	expiresAt: "oa_expires_at",
} as const;

export type AuthStorageKey =
	(typeof AUTH_STORAGE_KEYS)[keyof typeof AUTH_STORAGE_KEYS];

export interface AuthStorage {
	get(key: AuthStorageKey): string | null;
	set(key: AuthStorageKey, value: string): void;
	remove(key: AuthStorageKey): void;
}

export function memoryAuthStorage(
	initial: Partial<Record<AuthStorageKey, string>> = {},
): AuthStorage {
	const data = { ...initial };
	return {
		get(key) {
			return data[key] ?? null;
		},
		set(key, value) {
			data[key] = value;
		},
		remove(key) {
			delete data[key];
		},
	};
}

function resolveBrowserStorage(storage?: Storage | null): Storage | null {
	if (storage) return storage;
	if (typeof localStorage !== "undefined") return localStorage;
	return null;
}

export function browserAuthStorage(storage?: Storage | null): AuthStorage {
	return {
		get(key) {
			return resolveBrowserStorage(storage)?.getItem(key) ?? null;
		},
		set(key, value) {
			resolveBrowserStorage(storage)?.setItem(key, value);
		},
		remove(key) {
			resolveBrowserStorage(storage)?.removeItem(key);
		},
	};
}
