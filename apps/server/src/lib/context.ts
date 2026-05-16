import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	// responseHeaders は tRPC mutation が Set-Cookie を返すための口。
	// Hono 側の responseMeta コールバックでこの Headers をレスポンスにマージする。
	//
	// 他環境での対応:
	//   Express: res.setHeader / res.appendHeader を直接呼ぶラッパーを渡す
	//   AWS Lambda: ハンドラが返す multiValueHeaders に追記する
	//   NestJS: ExecutionContext.switchToHttp().getResponse() 経由で appendHeader
	const responseHeaders = new Headers();

	return {
		session: null,
		env: context.env,
		req: context.req.raw,
		responseHeaders,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
