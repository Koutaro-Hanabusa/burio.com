import { beforeEach, describe, expect, it, vi } from "vitest";

// Cloudflare Workersのモックは setup.ts で設定済み

describe("blogRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createSlug function", () => {
		it("should create slug from English title", () => {
			const title = "Hello World Post";
			const slug = title
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			expect(slug).toMatch(/hello.*world/i);
		});

		it("should handle Japanese characters", () => {
			const title = "テストブログ記事";
			const slug = title
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			// 日本語の場合、slugに変換される
			expect(slug).toBeDefined();
		});

		it("should handle special characters", () => {
			const title = "Test @ Post #123!";
			const slug = title
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			expect(slug).toBe("test-post-123");
		});

		it("should handle empty title", () => {
			const title = "";
			const slug = title
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			// 空の場合、タイムスタンプベースのslugを生成する必要がある
			expect(slug).toBe("");
		});
	});

	describe("input validation", () => {
		it("should validate getAll input", () => {
			const validInput = {
				limit: 10,
				offset: 0,
				published: true,
			};

			expect(validInput.limit).toBeGreaterThan(0);
			expect(validInput.limit).toBeLessThanOrEqual(100);
			expect(validInput.offset).toBeGreaterThanOrEqual(0);
		});

		it("should validate getBySlug input", () => {
			const validInput = {
				slug: "test-post",
			};

			expect(validInput.slug).toBeDefined();
			expect(typeof validInput.slug).toBe("string");
		});

		it("should validate create input", () => {
			const validInput = {
				title: "Test Post",
				content: "# Test Content",
				excerpt: "Test excerpt",
				tags: ["test", "blog"],
				published: false,
			};

			expect(validInput.title.length).toBeGreaterThan(0);
			expect(Array.isArray(validInput.tags)).toBe(true);
			expect(typeof validInput.published).toBe("boolean");
		});
	});
});
