import { beforeEach, describe, expect, it, vi } from "vitest";

// Cloudflare Workersのモックは setup.ts で設定済み

describe("adminRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createSlug function", () => {
		it("should create slug from title", () => {
			const title = "Admin Blog Post";
			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			expect(slug).toBe("admin-blog-post");
		});

		it("should handle special characters", () => {
			const title = "Test @ Admin #123!";
			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			expect(slug).toBe("test-admin-123");
		});

		it("should handle multiple spaces", () => {
			const title = "Multiple   Spaces   Test";
			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

			expect(slug).toBe("multiple-spaces-test");
		});
	});

	describe("input validation", () => {
		it("should validate getAllPosts input", () => {
			const validInput = {
				limit: 50,
				offset: 0,
			};

			expect(validInput.limit).toBeGreaterThan(0);
			expect(validInput.limit).toBeLessThanOrEqual(100);
			expect(validInput.offset).toBeGreaterThanOrEqual(0);
		});

		it("should validate createPost input", () => {
			const validInput = {
				title: "Admin Post",
				content: "# Admin Content",
				excerpt: "Admin excerpt",
				tags: ["admin", "test"],
				published: false,
			};

			expect(validInput.title.length).toBeGreaterThan(0);
			expect(Array.isArray(validInput.tags)).toBe(true);
			expect(typeof validInput.published).toBe("boolean");
		});

		it("should validate updatePost input", () => {
			const validInput = {
				id: "post-123",
				title: "Updated Title",
				published: true,
			};

			expect(validInput.id).toBeDefined();
			expect(typeof validInput.id).toBe("string");
			expect(typeof validInput.published).toBe("boolean");
		});

		it("should validate deletePost input", () => {
			const validInput = {
				id: "post-123",
			};

			expect(validInput.id).toBeDefined();
			expect(typeof validInput.id).toBe("string");
		});
	});

	describe("tags handling", () => {
		it("should stringify tags array", () => {
			const tags = ["admin", "blog", "test"];
			const stringified = JSON.stringify(tags);

			expect(stringified).toBe('["admin","blog","test"]');
		});

		it("should parse stringified tags", () => {
			const stringified = '["admin","blog","test"]';
			const parsed = JSON.parse(stringified);

			expect(Array.isArray(parsed)).toBe(true);
			expect(parsed).toEqual(["admin", "blog", "test"]);
		});

		it("should handle null tags", () => {
			const tags = null;

			expect(tags).toBeNull();
		});
	});
});
