import type { CloudContext } from "void";
import { getSession } from "void/auth";

export function requireAdmin(c: CloudContext, redirectToLogin = false) {
	if (getSession()) return null;
	return redirectToLogin
		? c.redirect("/admin/login")
		: c.text("Unauthorized", 401);
}
