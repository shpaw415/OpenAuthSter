import { PROVIDER_REGISTRY } from "openauthster-shared";

// GET /api/providers - Get all available provider types and metadata
export async function GET() {
	return {
		success: true,
		data: PROVIDER_REGISTRY,
	};
}
