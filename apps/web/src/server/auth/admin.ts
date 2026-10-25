import { buildAdminCookie, parseAdminToken } from "./admin-cookie";
import { signAdminToken, verifyAdminToken } from "./admin-token";
import { getAllowedIPs, getClientIP, isIPAllowed } from "./client-ip";

export type AdminEnv = {
	ADMIN_ALLOWED_IPS?: string;
	ADMIN_TOKEN_SECRET?: string;
};

export async function authenticateAdmin(request: Request, env: AdminEnv) {
	if (!env.ADMIN_TOKEN_SECRET)
		throw new Error("ADMIN_TOKEN_SECRET is not configured");
	if (
		!isIPAllowed(getClientIP(request), getAllowedIPs(env.ADMIN_ALLOWED_IPS))
	) {
		return null;
	}
	const now = Math.floor(Date.now() / 1000);
	const token = await signAdminToken(env.ADMIN_TOKEN_SECRET, {
		sub: "admin",
		iat: now,
		exp: now + 3600,
	});
	return buildAdminCookie(token);
}

export async function authorizeAdmin(request: Request, env: AdminEnv) {
	if (!env.ADMIN_TOKEN_SECRET)
		throw new Error("ADMIN_TOKEN_SECRET is not configured");
	if (
		!isIPAllowed(getClientIP(request), getAllowedIPs(env.ADMIN_ALLOWED_IPS))
	) {
		return { authorized: false, refreshCookie: null };
	}
	const token = parseAdminToken(request.headers.get("Cookie"));
	const payload =
		token && (await verifyAdminToken(env.ADMIN_TOKEN_SECRET, token));
	if (!payload || payload.sub !== "admin") {
		return { authorized: false, refreshCookie: null };
	}
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp - now >= 15 * 60) {
		return { authorized: true, refreshCookie: null };
	}
	const refreshed = await signAdminToken(env.ADMIN_TOKEN_SECRET, {
		sub: payload.sub,
		iat: now,
		exp: now + 3600,
	});
	return { authorized: true, refreshCookie: buildAdminCookie(refreshed) };
}
