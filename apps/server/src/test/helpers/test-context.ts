import type { Context } from "../../lib/context";
import { createMockD1Database, createMockR2Bucket } from "../mocks/db.mock";

export interface TestEnv {
	DB: ReturnType<typeof createMockD1Database>;
	R2_BUCKET?: ReturnType<typeof createMockR2Bucket>;
	ADMIN_ALLOWED_IPS?: string;
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
		} as TestEnv,
		req: new Request("http://localhost:3000", {
			headers: {
				"CF-Connecting-IP": "127.0.0.1",
			},
		}),
	};

	return {
		...defaultContext,
		...overrides,
	};
}

export function createAdminTestContext(): Context {
	return createTestContext({
		req: new Request("http://localhost:3000", {
			headers: {
				"CF-Connecting-IP": "127.0.0.1",
			},
		}),
	});
}

export function createUnauthorizedTestContext(): Context {
	return createTestContext({
		req: new Request("http://localhost:3000", {
			headers: {
				"CF-Connecting-IP": "192.168.1.100", // Unauthorized IP
			},
		}),
	});
}
