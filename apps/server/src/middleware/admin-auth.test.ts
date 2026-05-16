import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildAdminCookie } from "../lib/admin-cookie";
import { signAdminToken } from "../lib/admin-token";
import type { Context } from "../lib/context";
import { createTestContext } from "../test/helpers/test-context";
import { adminAuthMiddleware } from "./admin-auth";

const TEST_SECRET = "test-secret-32-bytes-minimum-ok!!";

type MiddlewareFn = (opts: {
	ctx: Context;
	next: (opts: { ctx: unknown }) => Promise<void>;
	type: string;
	path: string;
	rawInput: unknown;
	meta: undefined;
}) => Promise<unknown>;

// t.middleware() が返す MiddlewareBuilder は _middlewares 配列に実際の関数を持つ
const middlewareFn = (
	adminAuthMiddleware as unknown as { _middlewares: MiddlewareFn[] }
)._middlewares[0];

async function runMiddleware(ctx: Context) {
	let nextCalled = false;
	let nextCtx: unknown;

	try {
		await middlewareFn({
			ctx,
			next: async (opts: { ctx: unknown }) => {
				nextCalled = true;
				nextCtx = opts.ctx;
			},
			type: "query",
			path: "test",
			rawInput: undefined,
			meta: undefined,
		});
	} catch (e) {
		return { error: e as TRPCError, nextCalled: false, nextCtx: undefined };
	}

	return { error: null, nextCalled, nextCtx };
}

describe("adminAuthMiddleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("Cookie がない場合は UNAUTHORIZED を返す", async () => {
		const ctx = createTestContext();
		const result = await runMiddleware(ctx);

		expect(result.error).toBeInstanceOf(TRPCError);
		expect((result.error as TRPCError).code).toBe("UNAUTHORIZED");
	});

	it("無効なトークンの場合は UNAUTHORIZED を返す", async () => {
		const ctx = createTestContext({
			req: new Request("http://localhost:3000", {
				headers: { Cookie: "admin_token=invalid.token.here" },
			}),
		});
		const result = await runMiddleware(ctx);

		expect(result.error).toBeInstanceOf(TRPCError);
		expect((result.error as TRPCError).code).toBe("UNAUTHORIZED");
	});

	it("有効なトークンの場合は next を呼び出す", async () => {
		const iat = Math.floor(Date.now() / 1000);
		const token = await signAdminToken(TEST_SECRET, {
			sub: "admin",
			iat,
			exp: iat + 3600,
		});
		const ctx = createTestContext({
			req: new Request("http://localhost:3000", {
				headers: { Cookie: buildAdminCookie(token) },
			}),
		});

		const result = await runMiddleware(ctx);

		expect(result.error).toBeNull();
		expect(result.nextCalled).toBe(true);
	});

	it("ADMIN_TOKEN_SECRET が未設定の場合は INTERNAL_SERVER_ERROR を返す", async () => {
		const iat = Math.floor(Date.now() / 1000);
		const token = await signAdminToken(TEST_SECRET, {
			sub: "admin",
			iat,
			exp: iat + 3600,
		});
		// env に ADMIN_TOKEN_SECRET を持たない ctx を手動構築
		const ctx: Context = {
			session: null,
			env: {} as Context["env"],
			req: new Request("http://localhost:3000", {
				headers: { Cookie: buildAdminCookie(token) },
			}),
			responseHeaders: new Headers(),
		};

		const result = await runMiddleware(ctx);

		expect(result.error).toBeInstanceOf(TRPCError);
		expect((result.error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
	});

	it("期限切れトークンは UNAUTHORIZED を返す", async () => {
		const iat = Math.floor(Date.now() / 1000) - 7200;
		const token = await signAdminToken(TEST_SECRET, {
			sub: "admin",
			iat,
			exp: iat + 3600, // すでに期限切れ
		});
		const ctx = createTestContext({
			req: new Request("http://localhost:3000", {
				headers: { Cookie: buildAdminCookie(token) },
			}),
		});

		const result = await runMiddleware(ctx);

		expect(result.error).toBeInstanceOf(TRPCError);
		expect((result.error as TRPCError).code).toBe("UNAUTHORIZED");
	});

	it("期限まで 15 分以内のトークンは自動リフレッシュして Set-Cookie を追加する", async () => {
		// あと 14 分で期限切れになるトークンを生成
		const now = Math.floor(Date.now() / 1000);
		const iat = now - 3600 + 14 * 60;
		const exp = now + 14 * 60;
		const token = await signAdminToken(TEST_SECRET, { sub: "admin", iat, exp });
		const responseHeaders = new Headers();
		const ctx = createTestContext({
			req: new Request("http://localhost:3000", {
				headers: { Cookie: buildAdminCookie(token) },
			}),
			responseHeaders,
		});

		const result = await runMiddleware(ctx);

		expect(result.error).toBeNull();
		expect(result.nextCalled).toBe(true);
		expect(responseHeaders.get("Set-Cookie")).toContain("admin_token=");
	});
});
