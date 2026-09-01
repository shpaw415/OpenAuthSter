import { afterEach, describe, expect, it, mock } from "bun:test";
import { createSubjects } from "@kagii/openauth/subject";
import * as v from "valibot";
import {
	createClient,
	isDiscoveryUrl,
	requestUrl,
} from "../../client/index.ts";

const subjects = createSubjects({
	user: v.object({
		id: v.string(),
	}),
});

describe("discovery fetch", () => {
	const originalFetch = global.fetch;

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it("detects well-known and jwks paths", () => {
		expect(
			isDiscoveryUrl(
				"https://auth.example.com/.well-known/oauth-authorization-server",
			),
		).toBe(true);
		expect(
			isDiscoveryUrl("https://auth.example.com/.well-known/jwks.json"),
		).toBe(true);
		expect(isDiscoveryUrl("https://auth.example.com/session/public")).toBe(
			false,
		);
	});

	it("reads urls from Request objects", () => {
		expect(
			requestUrl(new Request("https://auth.example.com/.well-known/jwks.json")),
		).toBe("https://auth.example.com/.well-known/jwks.json");
	});

	it("does not append client_id to well-known or jwks fetches", async () => {
		const urls: string[] = [];
		global.fetch = mock(async (input: RequestInfo | URL) => {
			urls.push(String(input));
			if (String(input).includes("oauth-authorization-server")) {
				return new Response(
					JSON.stringify({
						issuer: "http://issuer.com",
						jwks_uri: "http://issuer.com/.well-known/jwks.json",
						token_endpoint: "http://issuer.com/token",
						authorization_endpoint: "http://issuer.com/authorize",
					}),
				);
			}
			return new Response(JSON.stringify({ keys: [] }));
		}) as unknown as typeof fetch;

		const client = createClient({
			clientID: "test-client",
			issuer: "http://issuer.com",
		});
		await client.verify(subjects, "not-a-jwt");

		expect(urls.length).toBeGreaterThan(0);
		expect(
			urls.every(
				(url) => url.includes("/.well-known/") && !url.includes("client_id="),
			),
		).toBe(true);
	});
});
