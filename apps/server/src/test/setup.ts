import { beforeEach, vi } from "vitest";

// Cloudflare Workersのモック
vi.mock("cloudflare:workers", () => ({
	env: {
		DB: null,
		R2_BUCKET: null,
		ADMIN_ALLOWED_IPS: "127.0.0.1,::1",
	},
}));

// グローバルなモックのリセット
beforeEach(() => {
	vi.clearAllMocks();
});

vi.stubEnv("NODE_ENV", "test");
