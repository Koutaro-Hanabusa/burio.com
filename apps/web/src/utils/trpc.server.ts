import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/src/routers";
import { env } from "cloudflare:workers";

export function createServerTrpcClient(_headers?: Headers) {
	const binding = (env as Cloudflare.Env).API;

	if (binding) {
		return createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: "https://api/trpc",
					fetch: (input, init) => binding.fetch(new Request(input, init)),
				}),
			],
		});
	}

	const serverUrl =
		(env as Cloudflare.Env).SERVER_URL ?? "http://localhost:3000";
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${serverUrl}/trpc`,
				fetch,
			}),
		],
	});
}
