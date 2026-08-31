import { PROVIDER_REGISTRY } from "openauth-webui-shared-types";

// GET /api/providers - Get all available provider types and metadata
export async function GET() {
	return {
		success: true,
		data: PROVIDER_REGISTRY,
	};
}
