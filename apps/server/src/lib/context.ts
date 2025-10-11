import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	return {
		session: null,
		env: context.env, // Cloudflare環境変数とバインディング
		req: context.req.raw, // 元のRequestオブジェクト
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
