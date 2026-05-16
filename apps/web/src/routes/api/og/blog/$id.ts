import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { buildOgResponse } from "@/features/og/api/build-og-response";

export const Route = createFileRoute("/api/og/blog/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const id = Number(params.id);
				if (!Number.isInteger(id) || id <= 0) {
					return new Response("Not Found", { status: 404 });
				}
				return buildOgResponse({ db: env.DB, r2: env.R2_BUCKET, id });
			},
		},
	},
});
