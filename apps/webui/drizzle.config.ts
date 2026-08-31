import { defineConfig } from "drizzle-kit";
export default defineConfig({
	driver: "d1-http",
	dialect: "sqlite",
	schema: "./src/db/schema.ts",
	out: "./drizzle/migrations",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_D1_ID!,
		token: process.env.CLOUDFLARE_TOKEN!,
	},
});
