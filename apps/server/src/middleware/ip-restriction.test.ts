import { TRPCError } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createAdminIPMiddleware,
	getClientIP,
	getCurrentIP,
	isIPAllowed,
} from "./ip-restriction";

describe("IP Restriction Middleware", () => {
	const originalEnv = process.env.NODE_ENV;

	afterEach(() => {
		process.env.NODE_ENV = originalEnv;
	});

	describe("getClientIP", () => {
		it("should extract IP from CF-Connecting-IP header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
				},
			});

			const ip = getClientIP(request);
			expect(ip).toBe("203.0.113.1");
		});

		it("should extract IP from X-Forwarded-For header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"X-Forwarded-For": "203.0.113.1, 198.51.100.1",
				},
			});

			const ip = getClientIP(request);
			expect(ip).toBe("203.0.113.1");
		});

		it("should extract IP from X-Real-IP header", () => {
			const request = new Request("http://localhost", {
				headers: {
					"X-Real-IP": "203.0.113.1",
				},
			});

			const ip = getClientIP(request);
			expect(ip).toBe("203.0.113.1");
		});

		it("should return 'unknown' when no IP headers are present", () => {
			const request = new Request("http://localhost");

			const ip = getClientIP(request);
			expect(ip).toBe("unknown");
		});

		it("should prioritize CF-Connecting-IP over other headers", () => {
			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
					"X-Forwarded-For": "198.51.100.1",
					"X-Real-IP": "192.0.2.1",
				},
			});

			const ip = getClientIP(request);
			expect(ip).toBe("203.0.113.1");
		});
	});

	describe("isIPAllowed", () => {
		it("should allow localhost IPv4", () => {
			const allowed = isIPAllowed("127.0.0.1");
			expect(allowed).toBe(true);
		});

		it("should allow localhost IPv6", () => {
			const allowed = isIPAllowed("::1");
			expect(allowed).toBe(true);
		});

		it("should allow private network IPs (192.168.x.x)", () => {
			const allowed = isIPAllowed("192.168.1.100");
			expect(allowed).toBe(true);
		});

		it("should allow private network IPs (10.x.x.x)", () => {
			const allowed = isIPAllowed("10.0.0.1");
			expect(allowed).toBe(true);
		});

		it("should allow private network IPs (172.16.x.x)", () => {
			const allowed = isIPAllowed("172.16.0.1");
			expect(allowed).toBe(true);
		});

		it("should deny unknown public IP in production", () => {
			process.env.NODE_ENV = "production";

			const allowed = isIPAllowed("203.0.113.1");
			expect(allowed).toBe(false);
		});

		it("should allow all IPs in development mode", () => {
			process.env.NODE_ENV = "development";

			const allowed = isIPAllowed("203.0.113.1");
			expect(allowed).toBe(true);
		});

		it("should allow IP from environment variable", () => {
			process.env.NODE_ENV = "production";
			process.env.ADMIN_ALLOWED_IPS = "203.0.113.1,198.51.100.1";

			const allowed = isIPAllowed("203.0.113.1");
			expect(allowed).toBe(true);

			delete process.env.ADMIN_ALLOWED_IPS;
		});
	});

	describe("getCurrentIP", () => {
		it("should return IP and allowed status for allowed IP", () => {
			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "127.0.0.1",
				},
			});

			const result = getCurrentIP(request);

			expect(result.ip).toBe("127.0.0.1");
			expect(result.allowed).toBe(true);
		});

		it("should return IP and denied status for denied IP", () => {
			process.env.NODE_ENV = "production";

			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
				},
			});

			const result = getCurrentIP(request);

			expect(result.ip).toBe("203.0.113.1");
			expect(result.allowed).toBe(false);
		});
	});

	describe("createAdminIPMiddleware", () => {
		it("should allow request from authorized IP", () => {
			const middleware = createAdminIPMiddleware();

			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "127.0.0.1",
				},
			});

			const opts = {
				ctx: { env: {} },
				input: {},
				req: request,
			};

			expect(() => middleware(opts)).not.toThrow();
		});

		it("should throw TRPCError for unauthorized IP in production", () => {
			process.env.NODE_ENV = "production";

			const middleware = createAdminIPMiddleware();

			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
				},
			});

			const opts = {
				ctx: { env: {} },
				input: {},
				req: request,
			};

			expect(() => middleware(opts)).toThrow(TRPCError);
			try {
				middleware(opts);
			} catch (error) {
				if (error instanceof TRPCError) {
					expect(error.code).toBe("FORBIDDEN");
				}
			}
		});

		it("should pass through when request is not available", () => {
			const middleware = createAdminIPMiddleware();

			const opts = {
				ctx: { env: {} },
				input: {},
			};

			expect(() => middleware(opts)).not.toThrow();
		});

		it("should include IP address in error message", () => {
			process.env.NODE_ENV = "production";

			const middleware = createAdminIPMiddleware();

			const request = new Request("http://localhost", {
				headers: {
					"CF-Connecting-IP": "203.0.113.1",
				},
			});

			const opts = {
				ctx: { env: {} },
				input: {},
				req: request,
			};

			try {
				middleware(opts);
				expect.fail("Should have thrown an error");
			} catch (error) {
				if (error instanceof TRPCError) {
					expect(error.message).toContain("203.0.113.1");
				} else {
					expect.fail("Should throw TRPCError");
				}
			}
		});
	});

	describe("Environment variable configuration", () => {
		it("should parse comma-separated IP list from environment", () => {
			process.env.NODE_ENV = "production";
			process.env.ADMIN_ALLOWED_IPS = "203.0.113.1, 198.51.100.1, 192.0.2.1";

			expect(isIPAllowed("203.0.113.1")).toBe(true);
			expect(isIPAllowed("198.51.100.1")).toBe(true);
			expect(isIPAllowed("192.0.2.1")).toBe(true);
			expect(isIPAllowed("203.0.113.2")).toBe(false);

			delete process.env.ADMIN_ALLOWED_IPS;
		});

		it("should handle empty environment variable", () => {
			process.env.NODE_ENV = "production";
			process.env.ADMIN_ALLOWED_IPS = "";

			// Should fall back to base allowed IPs
			expect(isIPAllowed("127.0.0.1")).toBe(true);

			delete process.env.ADMIN_ALLOWED_IPS;
		});

		it("should trim whitespace from IP addresses", () => {
			process.env.NODE_ENV = "production";
			process.env.ADMIN_ALLOWED_IPS = "  203.0.113.1  ,  198.51.100.1  ";

			expect(isIPAllowed("203.0.113.1")).toBe(true);
			expect(isIPAllowed("198.51.100.1")).toBe(true);

			delete process.env.ADMIN_ALLOWED_IPS;
		});
	});

	describe("Prefix matching", () => {
		it("should match IP with prefix pattern", () => {
			expect(isIPAllowed("192.168.1.1")).toBe(true);
			expect(isIPAllowed("192.168.100.200")).toBe(true);
			expect(isIPAllowed("10.0.0.1")).toBe(true);
			expect(isIPAllowed("10.255.255.254")).toBe(true);
		});

		it("should not match IP that does not start with prefix", () => {
			process.env.NODE_ENV = "production";

			expect(isIPAllowed("193.168.1.1")).toBe(false);
			expect(isIPAllowed("11.0.0.1")).toBe(false);

			process.env.NODE_ENV = originalEnv;
		});
	});
});
