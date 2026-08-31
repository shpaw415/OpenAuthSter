import Cloudflare from "cloudflare";

export class CloudflareClientError extends Error {
	public data: unknown;
	constructor(message: string, cause?: unknown, data?: unknown) {
		super(message, { cause });
		this.name = "CloudflareClientError";
		this.data = data;
	}
}

/**
 * @returns the custom domain created for the project
 */
export async function createCustomDomainForProject(
	env: Env,
	client: Cloudflare,
): Promise<Cloudflare.Workers.Domains.Domain> {
	const cf = client;
	const issuer_url = new URL(env.CLOUDFLARE_AUTH_ENDPOINT_DOMAIN);
	const subdomainLabel = crypto.randomUUID().replaceAll("-", "").slice(0, 63);

	const dotCount = issuer_url.hostname.split(".").length - 1;

	const newDomaineName =
		dotCount > 1
			? `${subdomainLabel}-${issuer_url.hostname}`
			: `${subdomainLabel}.${issuer_url.hostname}`;

	try {
		const domaine = await cf.workers.domains.update({
			account_id: env.CF_ACCOUNT_ID,
			zone_id: env.CLOUDFLARE_AUTH_DOMAIN_ZONE_ID,
			hostname: newDomaineName,
			service: env.CLOUDFLARE_WORKER_SERVICE_NAME,
			environment: "production",
		});

		return domaine;
	} catch (error) {
		throw new CloudflareClientError(
			`Cloudflare domain creation failed: ${newDomaineName}`,
			error,
			{
				domaineName: newDomaineName,
				accountId: env.CF_ACCOUNT_ID,
				zoneId: env.CLOUDFLARE_AUTH_DOMAIN_ZONE_ID,
				service: env.CLOUDFLARE_WORKER_SERVICE_NAME,
			},
		);
	}
}

export async function deleteCustomDomainForProject(
	env: Env,
	client: Cloudflare,
	domaineID: string,
): Promise<void> {
	return client.workers.domains.delete(domaineID, {
		account_id: env.CF_ACCOUNT_ID,
	});
}

export function createClient(env: Env): Cloudflare {
	return new Cloudflare({
		apiToken: env.CLOUDFLARE_API_TOKEN,
	});
}
