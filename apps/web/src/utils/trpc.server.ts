import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/src/routers";
import { getServerUrl } from "../lib/env.server";

// server-to-server fetch なので credentials は不要。
// headers 引数は Phase 6 で Cookie 転送する際に使用する。
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
