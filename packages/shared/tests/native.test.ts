import { describe, expect, it } from "bun:test";
import type { Project } from "../index.ts";
import {
	getProjectClientType,
	getProjectRedirectURIs,
	isAllowedRedirectURI,
	isPublicClient,
} from "../native.ts";

function project(overrides: Partial<Project> = {}): Project {
	return {
		clientID: "gpio_companion",
		name: "gpio",
		owner_id: "u1",
		owner_group_id: "g1",
		active: true,
		providers_data: [],
		theme_id: null,
		projectData: {},
		registerOnInvite: false,
		originURL: "https://gpio-companion.com",
		secret: "server-only",
		authEndpointURL: "https://auth.example.com",
		cloudflareDomaineID: "zone",
		created_at: "0",
		...overrides,
	} as Project;
}

describe("native public clients", () => {
	it("defaults to confidential", () => {
		const p = project();
		expect(getProjectClientType(p)).toBe("confidential");
		expect(isPublicClient(p)).toBe(false);
	});

	it("reads public clientType and extra redirect URIs", () => {
		const p = project({
			projectData: {
				clientType: "public",
				redirectURIs: ["gpio-companion://auth/callback"],
			},
		});
		expect(isPublicClient(p)).toBe(true);
		expect(getProjectRedirectURIs(p)).toEqual([
			"https://gpio-companion.com",
			"gpio-companion://auth/callback",
		]);
		expect(isAllowedRedirectURI(p, "gpio-companion://auth/callback")).toBe(
			true,
		);
	});
});
