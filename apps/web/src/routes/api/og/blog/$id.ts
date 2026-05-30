import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

// HEAD も明示する。未定義だと TanStack が SSR にフォールスルーし image/png ではなく text/html を返すため、HEAD で Content-Type を確認する SNS クローラーが画像と認識できない
function proxyOgImage(
	rawId: string,
	request: Request,
): Response | Promise<Response> {
	const id = Number(rawId);
	if (!Number.isInteger(id) || id <= 0) {
		return new Response("Not Found", { status: 404 });
	}
	return env.API.fetch(
		new Request(`https://api/og/blog/${id}`, { method: request.method }),
	);
}

export const Route = createFileRoute("/api/og/blog/$id")({
	server: {
		handlers: {
			GET: ({ params, request }) => proxyOgImage(params.id, request),
			HEAD: ({ params, request }) => proxyOgImage(params.id, request),
		},
	},
});
