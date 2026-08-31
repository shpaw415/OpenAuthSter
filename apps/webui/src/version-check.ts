import { version } from "../package.json";

type PackagesNames =
	| "OpenAuthSter-issuer"
	| "OpenAuthSter-shared"
	| "OpenAuthSter-webUI";

/**
 * Fetches the latest version of the specified OpenAuthSter package from the GitHub API.
 * @param packageName The name of the OpenAuthSter package.
 * @returns A promise that resolves to the latest version string.
 */
export function getLatestVersion(packageName: PackagesNames): Promise<string> {
	return fetch(
		`https://api.github.com/repos/shpaw415/${packageName}/releases/latest`,
	)
		.then(
			(response) =>
				response.json() as Promise<{ name: string; tag_name: string }>,
		)
		.then((data) => {
			return data.tag_name.slice(1); // Remove the leading 'v' from the version string
		});
}

export function getCurrentIssuerVersion(issuerURI: string): Promise<string> {
	return fetch(`${issuerURI}/version`).then((r) => r.text());
}

export function getCurrentWebUiVersion(): string {
	return version;
}
