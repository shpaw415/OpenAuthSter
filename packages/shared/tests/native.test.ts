import { describe, expect, it } from "bun:test";
import type { Project } from "../index.ts";
import {
	getProjectClientType,
	getProjectOriginURLs,
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

	it("allows http(s) redirect paths whose origin is listed in originURL", () => {
		const p = project({
			originURL: "https://gpio-companion.com,https://app.example.com",
		});
		expect(getProjectOriginURLs(p)).toEqual([
			"https://gpio-companion.com",
			"https://app.example.com",
		]);
		expect(isAllowedRedirectURI(p, "https://gpio-companion.com/callback")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://app.example.com/auth")).toBe(true);
		expect(isAllowedRedirectURI(p, "https://other.example.com/callback")).toBe(
			false,
		);
		expect(isAllowedRedirectURI(p, "http://gpio-companion.com/callback")).toBe(
			false,
		);
	});

	it("allows localhost http and rejects unknown custom schemes", () => {
		const p = project();
		expect(isAllowedRedirectURI(p, "http://localhost:3000/callback")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://localhost/callback")).toBe(false);
		expect(isAllowedRedirectURI(p, "gpio-companion://auth/callback")).toBe(
			false,
		);
	});

	it("allows hyphenated and numeric subdomains", () => {
		const p = project({
			originURL: "https://resto-pi-01.webcreas.com,https://sub-01.mysite.com",
		});
		expect(isAllowedRedirectURI(p, "https://resto-pi-01.webcreas.com")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://resto-pi-01.webcreas.com/")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://sub-01.mysite.com/callback")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://resto-pi.webcreas.com")).toBe(
			false,
		);
	});

	it("accepts scheme-less originURL entries", () => {
		const p = project({
			originURL: "resto-pi-01.webcreas.com",
		});
		expect(isAllowedRedirectURI(p, "https://resto-pi-01.webcreas.com")).toBe(
			true,
		);
	});

	it("allows wildcard subdomain origins", () => {
		const p = project({
			originURL: "https://*.webcreas.com",
		});
		expect(isAllowedRedirectURI(p, "https://resto-pi-01.webcreas.com")).toBe(
			true,
		);
		expect(isAllowedRedirectURI(p, "https://webcreas.com")).toBe(false);
		expect(isAllowedRedirectURI(p, "https://evil.example.com")).toBe(false);
	});

	it("allows native scheme redirect URIs listed in originURL", () => {
		const p = project({
			originURL: "gpio-companion-desktop://auth/callback",
		});
		expect(
			isAllowedRedirectURI(p, "gpio-companion-desktop://auth/callback"),
		).toBe(true);
		expect(
			isAllowedRedirectURI(p, "gpio-companion-desktop://auth/callback/"),
		).toBe(true);
		expect(isAllowedRedirectURI(p, "gpio-companion://auth/callback")).toBe(
			false,
		);
		expect(
			isAllowedRedirectURI(p, "gpio-companion-desktop://other/callback"),
		).toBe(false);
	});

	it("allows mixed https origins and native URIs in originURL", () => {
		const p = project({
			originURL:
				"https://gpio-companion.com,gpio-companion-desktop://auth/callback",
		});
		expect(isAllowedRedirectURI(p, "https://gpio-companion.com/callback")).toBe(
			true,
		);
		expect(
			isAllowedRedirectURI(p, "gpio-companion-desktop://auth/callback"),
		).toBe(true);
		expect(isAllowedRedirectURI(p, "gpio-companion://auth/callback")).toBe(
			false,
		);
	});

	it("rejects unlisted custom schemes and dangerous schemes", () => {
		const p = project({
			originURL: "gpio-companion-desktop://auth/callback",
			projectData: {
				redirectURIs: ["javascript:alert(1)"],
			},
		});
		expect(isAllowedRedirectURI(p, "gpio-companion://auth/callback")).toBe(
			false,
		);
		expect(isAllowedRedirectURI(p, "javascript:alert(1)")).toBe(false);
		expect(isAllowedRedirectURI(p, "data:text/html,hi")).toBe(false);
	});
});
