export function useParams<Params extends Record<string, string>>() {
	if (typeof window === "undefined") {
		return {} as Params;
	}
	console.log("Current URL:", window.location.href);
	return Object.fromEntries(
		new URLSearchParams(window.location.search).entries(),
	) as Params;
}
