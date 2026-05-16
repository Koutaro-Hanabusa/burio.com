import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	// tRPC mutation から Set-Cookie を返す経路。index.ts の responseMeta でレスポンスにマージする。
	const responseHeaders = new Headers();

	return {
		session: null,
		env: context.env,
		req: context.req.raw,
		responseHeaders,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
