import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema/index.ts",
	out: "./src/db/migrations",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId:
			process.env.CLOUDFLARE_ACCOUNT_ID || "8b507ae45219db85402c35138c953727",
		databaseId:
			process.env.CLOUDFLARE_DATABASE_ID ||
			"02de547d-2aa5-4183-933a-25503971e540",
		token: process.env.CLOUDFLARE_D1_TOKEN || "dummy",
	},
});
