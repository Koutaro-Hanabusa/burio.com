/// <reference types="@cloudflare/workers-types" />

declare global {
	interface Fetcher {
		fetch(request: Request | string): Promise<Response>;
	}

	type PagesFunction<Env = unknown> = (
		context: EventContext<Env, any, any>,
	) => Response | Promise<Response>;

	interface EventContext<Env, P extends string, Data> {
		request: Request;
		env: Env;
		params: P extends `${infer _Start}:${infer Param}/${infer Rest}`
			? { [K in Param | keyof EventContext<Env, Rest, Data>["params"]]: string }
			: P extends `${infer _Start}:${infer Param}`
				? { [K in Param]: string }
				: P extends `${infer _Start}[${infer Param}]/${infer Rest}`
					? {
							[K in
								| Param
								| keyof EventContext<Env, Rest, Data>["params"]]: string;
						}
					: P extends `${infer _Start}[${infer Param}]`
						? { [K in Param]: string }
						: {};
		data: Data;
		waitUntil(promise: Promise<any>): void;
		passThroughOnException(): void;
		next(input?: Request | string, init?: RequestInit): Promise<Response>;
	}
}

export {};
