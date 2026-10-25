import { defineEnv, string } from "void/env";

export default defineEnv({
	ADMIN_ALLOWED_IPS: string().optional(),
	ADMIN_TOKEN_SECRET: string(),
});
