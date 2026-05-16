import type { Context } from "../../lib/context";
import { createMockD1Database, createMockR2Bucket } from "../mocks/db.mock";

export interface TestEnv {
	DB: ReturnType<typeof createMockD1Database>;
	R2_BUCKET?: ReturnType<typeof createMockR2Bucket>;
	ADMIN_ALLOWED_IPS?: string;
	ADMIN_TOKEN_SECRET?: string;
}

export function createTestContext(overrides?: Partial<Context>): Context {
	const mockR2Bucket = createMockR2Bucket();
	const mockD1Database = createMockD1Database();

	const defaultContext: Context = {
		session: null,
		env: {
			DB: mockD1Database,
			R2_BUCKET: mockR2Bucket,
			ADMIN_ALLOWED_IPS: "127.0.0.1,::1",
			ADMIN_TOKEN_SECRET: "test-secret-32-bytes-minimum-ok!!",
		} as TestEnv,
		req: new Request("http://localhost:3000", {
			headers: {
				"CF-Connecting-IP": "127.0.0.1",
			},
		}),
		responseHeaders: new Headers(),
	};

	return {
		...defaultContext,
		...overrides,
	};
}

export function createAdminTestContext(adminToken?: string): Context {
	const headers: Record<string, string> = {
		"CF-Connecting-IP": "127.0.0.1",
	};
	if (adminToken) {
		headers["Cookie"] = `admin_token=${adminToken}`;
	}
	return createTestContext({
		req: new Request("http://localhost:3000", { headers }),
	});
}

export function createUnauthorizedTestContext(): Context {
	return createTestContext({
		req: new Request("http://localhost:3000", {
			headers: {
				"CF-Connecting-IP": "203.0.113.1",
			},
		}),
	});
}
