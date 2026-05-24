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

app.get("/api/ogp", async (c) => {
	const url = c.req.query("url");
	if (!url) {
		return c.json({ error: "URL is required" }, 400);
	}

	try {
		// Validate URL
		const parsedUrl = new URL(url);
		if (!["http:", "https:"].includes(parsedUrl.protocol)) {
			return c.json({ error: "Invalid URL protocol" }, 400);
		}

		const response = await fetch(url, {
			headers: {
				"User-Agent": "bot",
				Accept: "text/html",
			},
			redirect: "follow",
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			return c.json({ error: "Failed to fetch URL" }, 502);
		}

		const html = await response.text();

		// Parse OGP meta tags
		const getMetaContent = (property: string, html: string): string | null => {
			// Match both property="" and name="" attributes
			const regex = new RegExp(
				`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
				"i",
			);
			const match = html.match(regex);
			return match ? match[1] || match[2] || null : null;
		};

		const getTitle = (html: string): string | null => {
			const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
			return match ? match[1].trim() : null;
		};

		const getFavicon = (html: string, baseUrl: string): string | null => {
			const match = html.match(
				/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i,
			);
			if (match?.[1]) {
				try {
					return new URL(match[1], baseUrl).href;
				} catch {
					return null;
				}
			}
			// Default favicon
			try {
				return new URL("/favicon.ico", baseUrl).href;
			} catch {
				return null;
			}
		};

		const ogp = {
			title:
				getMetaContent("og:title", html) ||
				getMetaContent("twitter:title", html) ||
				getTitle(html) ||
				"",
			description:
				getMetaContent("og:description", html) ||
				getMetaContent("twitter:description", html) ||
				getMetaContent("description", html) ||
				"",
			image:
				getMetaContent("og:image", html) ||
				getMetaContent("twitter:image", html) ||
				"",
			siteName: getMetaContent("og:site_name", html) || parsedUrl.hostname,
			favicon: getFavicon(html, parsedUrl.origin),
			url,
		};

		// Resolve relative image URLs
		if (ogp.image && !ogp.image.startsWith("http")) {
			try {
				ogp.image = new URL(ogp.image, parsedUrl.origin).href;
			} catch {
				ogp.image = "";
			}
		}

		return c.json(ogp, 200, {
			"Cache-Control": "public, max-age=86400",
		});
	} catch (error) {
		console.error("OGP fetch error:", error);
		return c.json({ error: "Failed to fetch OGP data" }, 500);
	}
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
