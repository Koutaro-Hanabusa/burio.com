import { defineHandler } from "void";
import { trackPostView } from "@/server/posts";

export const POST = defineHandler(async (c) => {
	const id = Number(c.req.param("id"));
	if (!Number.isSafeInteger(id) || id < 1)
		return c.json({ tracked: false }, 404);
	return c.json({ tracked: await trackPostView(c.env, c.req.raw, id) });
});
