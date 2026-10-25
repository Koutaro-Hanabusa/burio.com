import { defineEnv, string } from "void/env";

export default defineEnv({
	AUTH_GITHUB_CLIENT_ID: string(),
	AUTH_GITHUB_CLIENT_SECRET: string(),
	ADMIN_GITHUB_ID: string(),
	BETTER_AUTH_SECRET: string().optional(),
});
