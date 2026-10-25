import type { CloudContext } from "void";
import { authenticateAdmin, authorizeAdmin } from "./admin";

export async function requireAdmin(c: CloudContext, allowIpLogin = false) {
	const auth = await authorizeAdmin(c.req.raw, c.env);
	if (auth.authorized) {
		if (auth.refreshCookie)
			c.header("Set-Cookie", auth.refreshCookie, { append: true });
		return null;
	}
	if (allowIpLogin) {
		const cookie = await authenticateAdmin(c.req.raw, c.env);
		if (cookie) {
			c.header("Set-Cookie", cookie, { append: true });
			return null;
		}
	}
	return c.text("Forbidden", 403);
}
