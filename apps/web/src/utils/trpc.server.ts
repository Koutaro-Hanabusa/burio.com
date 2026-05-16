import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/src/routers";
import { getServerUrl } from "../lib/env.server";

export function createServerTrpcClient(_headers?: Headers) {
	const url = `${getServerUrl()}/trpc`;
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url,
				fetch,
			}),
		],
	});
}
