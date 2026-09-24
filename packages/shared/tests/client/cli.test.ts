import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	callbackCodeFromInput,
	CliAuthError,
	OpenAuthsterCliClient,
} from "../../client/cli.ts";
import { fileAuthStorage } from "../../client/file-storage.ts";
import { AUTH_STORAGE_KEYS, memoryAuthStorage } from "../../client/storage.ts";
import { OpenAuthsterClient } from "../../client/user.ts";

const realFetch = globalThis.fetch;

function tokenResponse(body: Record<string, unknown>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("auth storage adapter", () => {
	it("keeps browser token keys and can be injected into the client", () => {
		const storage = memoryAuthStorage({
			[AUTH_STORAGE_KEYS.token]: "stored-access",
			[AUTH_STORAGE_KEYS.refresh]: "stored-refresh",
		});
		const client = new OpenAuthsterClient({
			issuerURI: "http://issuer.example",
			clientID: "cli_app",
			redirectURI: "http://127.0.0.1/callback",
			storage,
		});
		expect(client.getToken()).toBe("stored-access");
		client.logout();
		expect(storage.get(AUTH_STORAGE_KEYS.token)).toBeNull();
		expect(storage.get(AUTH_STORAGE_KEYS.refresh)).toBeNull();
	});

	it("writes the CLI token file as owner-read/write only", () => {
		const dir = mkdtempSync(join(tmpdir(), "openauthster-cli-"));
		const filePath = join(dir, "tokens.json");
		try {
			const storage = fileAuthStorage(filePath);
			storage.set(AUTH_STORAGE_KEYS.token, "access");
			storage.set(AUTH_STORAGE_KEYS.refresh, "refresh");
			expect(storage.get(AUTH_STORAGE_KEYS.refresh)).toBe("refresh");
			expect(statSync(filePath).mode & 0o777).toBe(0o600);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe("OpenAuthsterCliClient", () => {
	afterEach(() => {
		globalThis.fetch = realFetch;
	});

	it("exchanges a loopback code for access and refresh tokens", async () => {
		const storage = memoryAuthStorage();
		const client = new OpenAuthsterCliClient({
			issuer: "https://auth.example",
			clientID: "cli_app",
			storage,
			timeoutMs: 2000,
			open: async (url) => {
				const auth = new URL(url);
				expect(auth.searchParams.get("code_challenge_method")).toBe("S256");
				expect(auth.searchParams.get("response_type")).toBe("code");
				const redirect = auth.searchParams.get("redirect_uri");
				const state = auth.searchParams.get("state");
				expect(redirect?.startsWith("http://127.0.0.1:")).toBe(true);
				const callback = await realFetch(
					`${redirect}?code=auth-code&state=${state}`,
				);
				expect(callback.status).toBe(200);
			},
		});

		globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = String(input);
			if (url.includes("/token")) {
				const body = String(init?.body);
				expect(body).toContain("grant_type=authorization_code");
				expect(body).toContain("code=auth-code");
				expect(body).toContain("code_verifier=");
				expect(body).not.toContain("client_secret");
				return tokenResponse({
					access_token: "access-1",
					refresh_token: "refresh-1",
					expires_in: 900,
				});
			}
			return tokenResponse({ error: "not_found" }, 404);
		}) as unknown as typeof fetch;

		const tokens = await client.login({ provider: "github" });
		expect(tokens.access).toBe("access-1");
		expect(tokens.refresh).toBe("refresh-1");
		expect(storage.get(AUTH_STORAGE_KEYS.token)).toBe("access-1");
		expect(storage.get(AUTH_STORAGE_KEYS.refresh)).toBe("refresh-1");
		expect(storage.get(AUTH_STORAGE_KEYS.challenge)).toBeNull();
		expect(client.isAuthenticated).toBe(true);
	});

	it("rejects a callback state mismatch", async () => {
		const storage = memoryAuthStorage();
		const client = new OpenAuthsterCliClient({
			issuer: "https://auth.example",
			clientID: "cli_app",
			storage,
			timeoutMs: 2000,
			open: async (url) => {
				const redirect = new URL(url).searchParams.get("redirect_uri");
				await realFetch(`${redirect}?code=auth-code&state=wrong`);
			},
		});

		await expect(client.login()).rejects.toBeInstanceOf(CliAuthError);
		expect(storage.get(AUTH_STORAGE_KEYS.token)).toBeNull();
	});

	it("refreshes an expired access token with the stored refresh token", async () => {
		const storage = memoryAuthStorage({
			[AUTH_STORAGE_KEYS.token]: "expired-access",
			[AUTH_STORAGE_KEYS.refresh]: "refresh-1",
			[AUTH_STORAGE_KEYS.expiresAt]: String(Date.now() - 1000),
		});
		const client = new OpenAuthsterCliClient({
			issuer: "https://auth.example",
			clientID: "cli_app",
			storage,
		});
		globalThis.fetch = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
			const body = String(init?.body);
			expect(body).toContain("grant_type=refresh_token");
			expect(body).toContain("refresh_token=refresh-1");
			return tokenResponse({
				access_token: "access-2",
				refresh_token: "refresh-2",
				expires_in: 900,
			});
		}) as unknown as typeof fetch;

		expect(await client.getValidAccessToken()).toBe("access-2");
		expect(storage.get(AUTH_STORAGE_KEYS.refresh)).toBe("refresh-2");
	});

	it("exchanges a pasted callback URL without a loopback request", async () => {
		const storage = memoryAuthStorage();
		const client = new OpenAuthsterCliClient({
			issuer: "https://auth.example",
			clientID: "cli_app",
			storage,
			timeoutMs: 2000,
			open: async () => {
				throw new Error("browser should not open");
			},
		});
		let redirectURI = "";
		let state = "";
		globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
			const url = String(input);
			if (url.includes("/token")) {
				const body = String(init?.body);
				expect(body).toContain("code=pasted-code");
				expect(body).toContain(
					`redirect_uri=${encodeURIComponent(redirectURI)}`,
				);
				expect(body).not.toContain("client_secret");
				return tokenResponse({
					access_token: "access-pasted",
					refresh_token: "refresh-pasted",
					expires_in: 900,
				});
			}
			return tokenResponse({ error: "not_found" }, 404);
		}) as unknown as typeof fetch;

		const tokens = await client.login({
			open: false,
			onAuthorize: (url) => {
				const auth = new URL(url);
				redirectURI = auth.searchParams.get("redirect_uri") || "";
				state = auth.searchParams.get("state") || "";
			},
			readCode: async () => `${redirectURI}?code=pasted-code&state=${state}`,
		});
		expect(tokens.access).toBe("access-pasted");
		expect(callbackCodeFromInput("raw-code")).toBe("raw-code");
		expect(() =>
			callbackCodeFromInput(`${redirectURI}?code=x&state=wrong`, state),
		).toThrow(CliAuthError);
	});

	it("times out when the browser never returns", async () => {
		const client = new OpenAuthsterCliClient({
			issuer: "https://auth.example",
			clientID: "cli_app",
			storage: memoryAuthStorage(),
			timeoutMs: 30,
		});
		await expect(client.login({ open: false })).rejects.toMatchObject({
			code: "timeout",
		});
	});
});
