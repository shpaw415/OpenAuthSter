import { afterAll, beforeAll, expect, test } from "bun:test";
import type Cloudflare from "cloudflare";
import { createClient, createCustomDomainForProject } from "../src/cloudflare";

const testEnv = process.env;

const env: Env = {
	CLOUDFLARE_API_TOKEN: testEnv.CLOUDFLARE_API_TOKEN ?? "",
	CF_ACCOUNT_ID: testEnv.CF_ACCOUNT_ID ?? "",
	CLOUDFLARE_AUTH_DOMAIN_ZONE_ID: testEnv.CLOUDFLARE_AUTH_DOMAIN_ZONE_ID ?? "",
	CLOUDFLARE_WORKER_SERVICE_NAME: testEnv.CLOUDFLARE_WORKER_SERVICE_NAME ?? "",
	PUBLIC_ISSUER: testEnv.PUBLIC_ISSUER ?? "",
	CLOUDFLARE_AUTH_ENDPOINT_DOMAIN:
		testEnv.CLOUDFLARE_AUTH_ENDPOINT_DOMAIN ?? "https://webcreas.com",
} as unknown as Env;

if (
	!env.CLOUDFLARE_API_TOKEN ||
	!env.CF_ACCOUNT_ID ||
	!env.CLOUDFLARE_AUTH_DOMAIN_ZONE_ID ||
	!env.CLOUDFLARE_WORKER_SERVICE_NAME ||
	!env.PUBLIC_ISSUER
) {
	throw new Error(
		`Missing Cloudflare environment variables for testing: ${JSON.stringify(env, null, 2)}`,
	);
}

let client: Cloudflare;
let newCreatedDomaineID: string | undefined;

beforeAll(async () => {
	client = createClient(env);
	expect(client).toBeDefined();
});

afterAll(async () => {
	if (newCreatedDomaineID) {
		// Clean up the created custom domain
		await client.workers.domains.delete(newCreatedDomaineID, {
			account_id: env.CF_ACCOUNT_ID,
		});
		console.log("Deleted custom domain:", newCreatedDomaineID);
	}
});

test("Create custom domain for project", async () => {
	const res = await createCustomDomainForProject(env, client);
	expect(res.id).toBeDefined();
	console.log("Created custom domain:", res);
	newCreatedDomaineID = res.id;
});
