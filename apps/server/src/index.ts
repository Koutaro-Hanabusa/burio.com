import { env } from "cloudflare:workers";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { ogImageRouter } from "./routes/og-image";

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

app.route("/api/og-image.png", ogImageRouter);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
