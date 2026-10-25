import { defineHandler } from "void";

export const GET = defineHandler(async (c) => {
	const filename = c.req.param("filename");
	if (!filename || filename.includes("/") || filename.includes(".."))
		return c.text("Not Found", 404);
	const object = await c.env.R2_BUCKET.get(`images/${filename}`);
	if (!object) return c.text("Not Found", 404);
	return new Response(object.body, {
		headers: {
			"Content-Type":
				object.httpMetadata?.contentType || "application/octet-stream",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
});
