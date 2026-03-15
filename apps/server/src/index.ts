import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

type AppEnv = {
	Bindings: {
		CORS_ORIGIN: string;
		R2_BUCKET: R2Bucket;
	};
};

const app = new Hono<AppEnv>();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: [
			env.CORS_ORIGIN || "",
			"https://burio-com.koutarouhanabusa.workers.dev",
			"https://burio-com.pages.dev",
			"https://*.burio-com.pages.dev",
			"http://localhost:3001",
			"http://localhost:3002",
		].filter(Boolean),
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.post("/upload/image", async (c) => {
	const r2 = c.env.R2_BUCKET;
	if (!r2) {
		return c.json({ error: "Storage not available" }, 500);
	}

	const formData = await c.req.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return c.json({ error: "No file provided" }, 400);
	}

	const allowedTypes = [
		"image/png",
		"image/jpeg",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	];
	if (!allowedTypes.includes(file.type)) {
		return c.json({ error: "Unsupported image type" }, 400);
	}

	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		return c.json({ error: "File too large (max 10MB)" }, 400);
	}

	const ext = file.name.split(".").pop() || "png";
	const key = `images/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

	await r2.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type },
	});

	// R2のカスタムドメインまたはWorker経由でURLを生成
	const url = `/r2/${key}`;

	return c.json({ url, key });
});

app.get("/r2/images/:filename", async (c) => {
	const r2 = c.env.R2_BUCKET;
	if (!r2) {
		return c.text("Storage not available", 500);
	}

	const key = `images/${c.req.param("filename")}`;
	const object = await r2.get(key);

	if (!object) {
		return c.text("Not found", 404);
	}

	const headers = new Headers();
	headers.set(
		"Content-Type",
		object.httpMetadata?.contentType || "application/octet-stream",
	);
	headers.set("Cache-Control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});

app.get("/", (c) => {
	return c.text("OK");
});

export default {
	async fetch(
		request: Request,
		env: AppEnv["Bindings"],
		ctx: ExecutionContext,
	) {
		return app.fetch(request, env, ctx);
	},
};
