/**
 * Cloudflare Pages Functions の型定義
 */

declare global {
	/**
	 * Cloudflare Pages Functions のコンテキスト
	 */
	type PagesFunction<Env = unknown> = (context: {
		request: Request;
		env: Env;
		params: Record<string, string>;
		waitUntil: (promise: Promise<unknown>) => void;
		next: () => Promise<Response>;
		data: Record<string, unknown>;
	}) => Response | Promise<Response>;
}

export {};
