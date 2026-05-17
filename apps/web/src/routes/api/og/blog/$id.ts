import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/og/blog/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const id = Number(params.id);
				if (!Number.isInteger(id) || id <= 0) {
					return new Response("Not Found", { status: 404 });
				}
				return env.API.fetch(new Request(`https://api/og/blog/${id}`));
			},
		},
	},
});
