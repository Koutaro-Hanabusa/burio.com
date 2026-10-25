import { describe, expect, it } from "vite-plus/test";
import { authenticateAdmin, authorizeAdmin } from "./admin";

const env = {
	ADMIN_ALLOWED_IPS: "203.0.113.4",
	ADMIN_TOKEN_SECRET: "test-secret-at-least-32-bytes-long!!",
};

function request(ip: string, cookie?: string) {
	return new Request("https://burio16.com/admin", {
		headers: { "CF-Connecting-IP": ip, ...(cookie ? { Cookie: cookie } : {}) },
	});
}

describe("admin authorization", () => {
	it("allowed IP can obtain a cookie, and the cookie authorizes that IP", async () => {
		const cookie = await authenticateAdmin(request("203.0.113.4"), env);
		expect(cookie).toContain("admin_token=");
		const result = await authorizeAdmin(request("203.0.113.4", cookie!), env);
		expect(result.authorized).toBe(true);
	});

	it("a valid cookie cannot authorize a different IP", async () => {
		const cookie = await authenticateAdmin(request("203.0.113.4"), env);
		const result = await authorizeAdmin(request("198.51.100.2", cookie!), env);
		expect(result.authorized).toBe(false);
	});

	it("a missing cookie cannot mutate admin data", async () => {
		expect((await authorizeAdmin(request("203.0.113.4"), env)).authorized).toBe(
			false,
		);
	});
});
