import { defineHandler } from "void";
import { requireAdmin } from "@/server/auth/guard";

const imageTypes = new Set([
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"image/svg+xml",
]);

export const POST = defineHandler(async (c) => {
	const denied = await requireAdmin(c);
	if (denied) return denied;
	const file = (await c.req.formData()).get("file");
	if (!(file instanceof File))
		return c.json({ error: "No file provided" }, 400);
	if (!imageTypes.has(file.type))
		return c.json({ error: "Unsupported image type" }, 400);
	if (file.size > 10 * 1024 * 1024)
		return c.json({ error: "File too large (max 10MB)" }, 400);
	const extension = {
		"image/png": "png",
		"image/jpeg": "jpg",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/svg+xml": "svg",
	}[file.type];
	const key = `images/${crypto.randomUUID()}.${extension}`;
	await c.env.R2_BUCKET.put(key, file.stream(), {
		httpMetadata: { contentType: file.type },
	});
	return c.json({ url: `https://api.burio16.com/r2/${key}`, key });
});
