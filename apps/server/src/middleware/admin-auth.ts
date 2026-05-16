// tRPC middleware として実装しているが、概念は他環境でも同一:
//   Hono:    app.use("/admin/*", async (c, next) => { ... })
//   Express: app.use("/admin", (req, res, next) => { ... })
//   Lambda:  ハンドラのラッパー関数でトークン検証を実行
//   NestJS:  @Injectable() class AdminAuthGuard implements CanActivate { ... }

import { TRPCError } from "@trpc/server";
import { buildAdminCookie, parseAdminToken } from "../lib/admin-cookie";
import { signAdminToken, verifyAdminToken } from "../lib/admin-token";
import { t } from "../lib/trpc";

// トークン期限まで 15 分以内であれば自動リフレッシュする閾値 (秒)
const REFRESH_THRESHOLD_SECONDS = 15 * 60;

// リフレッシュ後のトークン有効期間 (秒)
const TOKEN_TTL_SECONDS = 3600;

export const adminAuthMiddleware = t.middleware(async ({ ctx, next }) => {
	const secret = ctx.env?.ADMIN_TOKEN_SECRET;
	if (!secret) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "ADMIN_TOKEN_SECRET is not configured",
		});
	}

	const cookieHeader = ctx.req.headers.get("Cookie");
	const token = parseAdminToken(cookieHeader);

	if (!token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const payload = await verifyAdminToken(secret, token);
	if (!payload) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	// 期限まで REFRESH_THRESHOLD_SECONDS 以内なら自動リフレッシュ
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp - now < REFRESH_THRESHOLD_SECONDS) {
		const iat = now;
		const newToken = await signAdminToken(secret, {
			sub: payload.sub,
			iat,
			exp: iat + TOKEN_TTL_SECONDS,
		});
		ctx.responseHeaders.append("Set-Cookie", buildAdminCookie(newToken));
	}

	return next({ ctx: { ...ctx, adminPayload: payload } });
});
