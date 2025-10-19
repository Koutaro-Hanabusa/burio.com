import { vi } from "vitest";

// Cloudflare Workers環境変数のモック
export const mockEnv = {
	DB: null, // D1データベースのモック
	R2_BUCKET: null, // R2バケットのモック
	ADMIN_ALLOWED_IPS: "127.0.0.1,::1",
};

// cloudflare:workersモジュールのモック
vi.mock("cloudflare:workers", () => ({
	env: mockEnv,
}));
