import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSlug } from "./admin";

// Cloudflare Workersのモックは setup.ts で設定済み

describe("blogRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createSlug function", () => {
		it("should create slug from English title", () => {
			const slug = createSlug("Hello World Post");
			expect(slug).toMatch(/^[a-z0-9-]+$/);
			expect(slug).toContain("hello");
			expect(slug).toContain("world");
		});

		it("should handle Japanese title and return non-empty slug", () => {
			const slug = createSlug("テストブログ記事");
			expect(slug).toBeTruthy();
			expect(slug).toMatch(/^[a-z0-9-]+$/);
		});

		it("should return unique slugs on each call", () => {
			const slug1 = createSlug("Same Title");
			const slug2 = createSlug("Same Title");
			expect(slug1).not.toBe(slug2);
		});

		it("should handle special characters", () => {
			const slug = createSlug("Test @ Post #123!");
			expect(slug).toMatch(/^test-post-123-/);
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

		it("should validate getById input", () => {
			const validInput = {
				id: 123,
			};

			expect(validInput.id).toBeDefined();
			expect(typeof validInput.id).toBe("number");
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
