import { TRPCError } from "@trpc/server";
import { buildAdminCookie, parseAdminToken } from "../lib/admin-cookie";
import { signAdminToken, verifyAdminToken } from "../lib/admin-token";
import { t } from "../lib/trpc";

const REFRESH_THRESHOLD_SECONDS = 15 * 60;
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
