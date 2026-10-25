import { describe, expect, it, vi } from "vite-plus/test";
import { deletePost, getPost, type BlogEnv } from "./posts";

const post = {
	id: 42,
	title: "Example",
	slug: "legacy-slug",
	content: "D1 content",
	excerpt: null,
	coverImage: null,
	tags: null,
	charCount: 10,
	views: 3,
	authorId: null,
	published: 1,
	createdAt: null,
	updatedAt: null,
};

vi.mock("drizzle-orm/d1", () => ({
	drizzle: () => ({
		select: () => ({
			from: () => ({ where: () => ({ limit: async () => [post] }) }),
		}),
		delete: () => ({
			where: async () => {
				throw new Error("D1 unavailable");
			},
		}),
	}),
}));

function env(get: R2Bucket["get"]): BlogEnv {
	return { DB: {} as D1Database, R2_BUCKET: { get } as R2Bucket };
}

describe("getPost content migration", () => {
	it("numeric R2 key takes precedence over legacy slug", async () => {
		const get = vi.fn(async (key: string) =>
			key === "blog/42.md" ? { text: async () => "numeric content" } : null,
		) as R2Bucket["get"];
		expect((await getPost(env(get), 42, true))?.content).toBe(
			"numeric content",
		);
		expect(get).toHaveBeenCalledWith("blog/42.md");
		expect(get).not.toHaveBeenCalledWith("blog/legacy-slug.md");
	});

	it("legacy slug then D1 content remain readable", async () => {
		const get = vi.fn(async (key: string) =>
			key === "blog/legacy-slug.md"
				? { text: async () => "legacy content" }
				: null,
		) as R2Bucket["get"];
		expect((await getPost(env(get), 42, true))?.content).toBe("legacy content");
		const missing = vi.fn(async () => null) as R2Bucket["get"];
		expect((await getPost(env(missing), 42, true))?.content).toBe("D1 content");
	});
});

it("D1 delete failure leaves both R2 content keys intact", async () => {
	const deleteObject = vi.fn(async () => {});
	const bindings = env(vi.fn(async () => null) as R2Bucket["get"]);
	bindings.R2_BUCKET.delete = deleteObject;
	await expect(deletePost(bindings, 42)).rejects.toThrow("D1 unavailable");
	expect(deleteObject).not.toHaveBeenCalled();
});
