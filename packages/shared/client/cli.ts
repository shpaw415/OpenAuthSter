import { spawn } from "node:child_process";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Client, Tokens } from "@kagii/openauth/client";
import { createClient } from "./index.ts";
import { fileAuthStorage } from "./file-storage.ts";
import { AUTH_STORAGE_KEYS, type AuthStorage } from "./storage.ts";

const SUCCESS_HTML = `<!doctype html><meta charset="utf-8"><title>OpenAuthster</title><p>Signed in. You can close this window.</p>`;
const FAILURE_HTML = `<!doctype html><meta charset="utf-8"><title>OpenAuthster</title><p>Sign-in failed. You can close this window.</p>`;
const REFRESH_SKEW_MS = 30_000;

export type CliAuthErrorCode =
	| "cancelled"
	| "timeout"
	| "state_mismatch"
	| "missing_code"
	| "exchange_failed"
	| "refresh_failed"
	| "missing_refresh_token"
	| "invalid_redirect";

export class CliAuthError extends Error {
	constructor(
		message: string,
		public code: CliAuthErrorCode,
	) {
		super(message);
		this.name = "CliAuthError";
	}
}

export type CliTokens = {
	access: string;
	refresh: string;
	expiresAt: number;
};

export type CliLoginOptions = {
	provider?: string;
	copyID?: string | null;
	open?: boolean;
	onAuthorize?: (url: string) => void | Promise<void>;
};

export type OpenAuthsterCliOptions = {
	issuer: string;
	clientID: string;
	copyID?: string | null;
	storage?: AuthStorage;
	tokenPath?: string;
	open?: (url: string) => void | Promise<void>;
	hostname?: "127.0.0.1" | "localhost";
	callbackPath?: string;
	port?: number;
	timeoutMs?: number;
};

export function defaultCliTokenPath(clientID: string): string {
	const safe = clientID.replace(/[^a-zA-Z0-9_-]/g, "_");
	return join(homedir(), ".openauthster", `${safe}.json`);
}

export async function openSystemBrowser(url: string): Promise<void> {
	const command =
		process.platform === "darwin"
			? "open"
			: process.platform === "win32"
				? "cmd"
				: "xdg-open";
	const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, { stdio: "ignore", detached: true });
		child.on("error", reject);
		child.on("spawn", () => resolve());
		child.unref();
	});
}

type Loopback = {
	port: number;
	wait: Promise<string>;
	arm: (state: string) => void;
	close: () => Promise<void>;
};

function html(res: ServerResponse, status: number, body: string) {
	res.writeHead(status, {
		"Content-Type": "text/html; charset=utf-8",
		"Cache-Control": "no-store",
	});
	res.end(body);
}

function startLoopback(options: {
	hostname: "127.0.0.1" | "localhost";
	port: number;
	callbackPath: string;
	timeoutMs: number;
}): Promise<Loopback> {
	return new Promise((resolve, reject) => {
		let expectedState: string | null = null;
		let settled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let resolveCode: (code: string) => void = () => {};
		let rejectCode: (error: Error) => void = () => {};
		const wait = new Promise<string>((res, rej) => {
			resolveCode = res;
			rejectCode = rej;
		});
		const settle = (error: Error | null, code?: string) => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			if (error) rejectCode(error);
			else if (code) resolveCode(code);
		};

		const server = createServer((req: IncomingMessage, res: ServerResponse) => {
			const url = new URL(req.url || "/", `http://${options.hostname}`);
			if (url.pathname !== options.callbackPath) {
				res.writeHead(404, { "Cache-Control": "no-store" });
				res.end("not found");
				return;
			}
			if (!expectedState) {
				html(res, 503, FAILURE_HTML);
				return;
			}
			const error = url.searchParams.get("error");
			const code = url.searchParams.get("code");
			const state = url.searchParams.get("state");
			if (!error && !code) {
				html(res, 400, FAILURE_HTML);
				return;
			}
			if (error) {
				settle(
					new CliAuthError(
						url.searchParams.get("error_description") || error,
						"cancelled",
					),
				);
				html(res, 400, FAILURE_HTML);
				return;
			}
			if (state !== expectedState || !code) {
				settle(new CliAuthError("State mismatch", "state_mismatch"));
				html(res, 400, FAILURE_HTML);
				return;
			}
			settle(null, code);
			html(res, 200, SUCCESS_HTML);
		});

		server.on("error", (error) => {
			if (timer) clearTimeout(timer);
			reject(error);
		});
		server.listen(options.port, options.hostname, () => {
			const address = server.address() as AddressInfo;
			resolve({
				port: address.port,
				wait,
				arm: (state: string) => {
					expectedState = state;
					timer = setTimeout(() => {
						settle(new CliAuthError("Sign-in timed out", "timeout"));
					}, options.timeoutMs);
				},
				close: () =>
					new Promise((done) => {
						server.close(() => done());
					}),
			});
		});
	});
}

export class OpenAuthsterCliClient {
	private readonly storage: AuthStorage;
	private openAuthClient: Client;
	private refreshInFlight: Promise<string> | null = null;

	constructor(private readonly options: OpenAuthsterCliOptions) {
		if (!options.issuer.startsWith("http")) {
			throw new CliAuthError(
				"Invalid issuer URI. Must start with http or https.",
				"invalid_redirect",
			);
		}
		const hostname = options.hostname ?? "127.0.0.1";
		if (hostname !== "127.0.0.1" && hostname !== "localhost") {
			throw new CliAuthError(
				"CLI redirect must use 127.0.0.1 or localhost",
				"invalid_redirect",
			);
		}
		this.storage =
			options.storage ??
			fileAuthStorage(options.tokenPath ?? defaultCliTokenPath(options.clientID));
		this.openAuthClient = createClient({
			clientID: options.clientID,
			issuer: options.issuer,
			copyID: options.copyID,
		});
	}

	get isAuthenticated(): boolean {
		return Boolean(this.readTokens()?.access);
	}

	getTokens(): CliTokens | null {
		return this.readTokens();
	}

	async login(loginOptions: CliLoginOptions = {}): Promise<CliTokens> {
		const hostname = this.options.hostname ?? "127.0.0.1";
		const callbackPath = this.options.callbackPath ?? "/callback";
		const timeoutMs = this.options.timeoutMs ?? 5 * 60 * 1000;
		const copyID = loginOptions.copyID ?? this.options.copyID ?? null;
		if (loginOptions.copyID !== undefined) {
			this.openAuthClient = createClient({
				clientID: this.options.clientID,
				issuer: this.options.issuer,
				copyID,
			});
		}

		const loopback = await startLoopback({
			hostname,
			port: this.options.port ?? 0,
			callbackPath,
			timeoutMs,
		});
		const redirectURI = `http://${hostname}:${loopback.port}${callbackPath}`;
		let authorized: Awaited<ReturnType<Client["authorize"]>>;
		try {
			authorized = await this.openAuthClient.authorize(redirectURI, "code", {
				pkce: true,
				provider: loginOptions.provider,
			});
		} catch (error) {
			await loopback.close();
			throw error;
		}
		if (!authorized.challenge.verifier || !authorized.challenge.state) {
			await loopback.close();
			throw new CliAuthError("PKCE challenge was not created", "missing_code");
		}
		loopback.arm(authorized.challenge.state);
		void loopback.wait.catch(() => {});

		this.storage.set(
			AUTH_STORAGE_KEYS.challenge,
			JSON.stringify(authorized.challenge),
		);
		const authURL = new URL(authorized.url);
		if (copyID) authURL.searchParams.set("copy_id", copyID);

		try {
			if (loginOptions.onAuthorize) await loginOptions.onAuthorize(authURL.toString());
			if (loginOptions.open !== false) {
				const open = this.options.open ?? openSystemBrowser;
				await open(authURL.toString());
			}
			const code = await loopback.wait;
			this.storage.remove(AUTH_STORAGE_KEYS.token);
			this.storage.remove(AUTH_STORAGE_KEYS.refresh);
			this.storage.remove(AUTH_STORAGE_KEYS.expiresAt);
			const exchanged = await this.openAuthClient.exchange(
				code,
				redirectURI,
				authorized.challenge.verifier,
			);
			if (exchanged.err || !exchanged.tokens?.access || !exchanged.tokens.refresh) {
				throw new CliAuthError(
					"Authorization code exchange failed",
					"exchange_failed",
				);
			}
			return this.persistTokens(exchanged.tokens);
		} finally {
			this.storage.remove(AUTH_STORAGE_KEYS.challenge);
			await loopback.close();
		}
	}

	async getValidAccessToken(): Promise<string> {
		const tokens = this.readTokens();
		if (tokens && tokens.expiresAt > Date.now() + REFRESH_SKEW_MS) {
			return tokens.access;
		}
		if (!this.refreshInFlight) {
			this.refreshInFlight = this.refresh()
				.then((next) => next.access)
				.finally(() => {
					this.refreshInFlight = null;
				});
		}
		return this.refreshInFlight;
	}

	async refresh(): Promise<CliTokens> {
		const current = this.readTokens();
		const refreshToken =
			current?.refresh ?? this.storage.get(AUTH_STORAGE_KEYS.refresh);
		if (!refreshToken) {
			throw new CliAuthError("No refresh token", "missing_refresh_token");
		}
		const result = await this.openAuthClient.refresh(refreshToken);
		if (result.err) {
			throw new CliAuthError("Token refresh failed", "refresh_failed");
		}
		if (!result.tokens) {
			if (!current) {
				throw new CliAuthError("Token refresh failed", "refresh_failed");
			}
			return current;
		}
		return this.persistTokens(result.tokens);
	}

	async getPublicSession(): Promise<unknown> {
		const access = await this.getValidAccessToken();
		const url = new URL("/session/public", this.options.issuer);
		url.searchParams.set("client_id", this.options.clientID);
		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${access}` },
		});
		if (!response.ok) {
			throw new CliAuthError(
				`Session request failed (${response.status})`,
				"refresh_failed",
			);
		}
		return response.json();
	}

	logout() {
		this.refreshInFlight = null;
		this.storage.remove(AUTH_STORAGE_KEYS.token);
		this.storage.remove(AUTH_STORAGE_KEYS.refresh);
		this.storage.remove(AUTH_STORAGE_KEYS.challenge);
		this.storage.remove(AUTH_STORAGE_KEYS.expiresAt);
	}

	private persistTokens(tokens: Tokens): CliTokens {
		const expiresAt = Date.now() + tokens.expiresIn * 1000;
		this.storage.set(AUTH_STORAGE_KEYS.token, tokens.access);
		this.storage.set(AUTH_STORAGE_KEYS.refresh, tokens.refresh);
		this.storage.set(AUTH_STORAGE_KEYS.expiresAt, String(expiresAt));
		return {
			access: tokens.access,
			refresh: tokens.refresh,
			expiresAt,
		};
	}

	private readTokens(): CliTokens | null {
		const access = this.storage.get(AUTH_STORAGE_KEYS.token);
		const refresh = this.storage.get(AUTH_STORAGE_KEYS.refresh);
		const expiresAt = Number(this.storage.get(AUTH_STORAGE_KEYS.expiresAt));
		if (!access || !refresh || !Number.isFinite(expiresAt)) return null;
		return { access, refresh, expiresAt };
	}
}

export { fileAuthStorage } from "./file-storage.ts";
export { AUTH_STORAGE_KEYS, type AuthStorage } from "./storage.ts";
