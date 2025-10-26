import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from "./db";
import { posts } from "./db/schema";
import { createContext } from "./lib/context";
import { generateOGPImage } from "./lib/ogp-generator";
import { appRouter } from "./routers/index";

const app = new Hono();

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

app.get("/", (c) => {
	return c.text("OK");
});

// OGP Image Generation Endpoints
app.get("/api/og", async (c) => {
	const title = c.req.query("title");
	const id = c.req.query("id");

	if (!title && !id) {
		return c.json(
			{ error: "Either 'title' or 'id' parameter is required" },
			400,
		);
	}

	try {
		let imageTitle = title;

		// If id is provided, fetch the post title from database
		if (id) {
			const postId = Number.parseInt(id, 10);
			if (Number.isNaN(postId)) {
				return c.json({ error: "Invalid post id" }, 400);
			}

			const post = await db
				.select()
				.from(posts)
				.where(eq(posts.id, postId))
				.limit(1);

			if (post.length === 0) {
				return c.json({ error: `Post not found with id: ${postId}` }, 404);
			}

			imageTitle = post[0].title;
		}

		if (!imageTitle) {
			return c.json({ error: "No title available for OGP generation" }, 400);
		}

		// Generate OGP image
		const result = await generateOGPImage({
			title: imageTitle,
			siteName: "burio16.com",
		});

		// Return SVG image
		return c.body(result.svg, 200, {
			"Content-Type": result.contentType,
			"Cache-Control": "public, max-age=31536000, immutable",
		});
	} catch (error) {
		console.error("Error generating OGP image:", error);
		return c.json(
			{
				error: "Failed to generate OGP image",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

app.get("/api/blog/og/:id", async (c) => {
	const id = c.req.param("id");
	const postId = Number.parseInt(id, 10);

	if (Number.isNaN(postId)) {
		return c.json({ error: "Invalid post id" }, 400);
	}

	try {
		// Fetch post from database
		const post = await db
			.select()
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);

		if (post.length === 0) {
			return c.json({ error: `Post not found with id: ${postId}` }, 404);
		}

		// Generate OGP image
		const result = await generateOGPImage({
			title: post[0].title,
			siteName: "burio16.com",
		});

		// Return SVG image
		return c.body(result.svg, 200, {
			"Content-Type": result.contentType,
			"Cache-Control": "public, max-age=31536000, immutable",
		});
	} catch (error) {
		console.error("Error generating OGP image:", error);
		return c.json(
			{
				error: "Failed to generate OGP image",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

export default app;
