"no action";


export function generateSecret(): string {
    return [
		crypto.randomUUID(),
		crypto.randomUUID(),
		crypto.randomUUID(),
	].join("-")
}