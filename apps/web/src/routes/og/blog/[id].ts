import { defineHandler } from "void";
import { buildOgResponse } from "@/server/og/build-og-response";

export const GET = defineHandler(async (c) => {
	const id = Number(c.req.param("id"));
	if (!Number.isSafeInteger(id) || id < 1) return c.text("Not Found", 404);
	return buildOgResponse({ d1: c.env.DB, r2: c.env.R2_BUCKET, id });
});
