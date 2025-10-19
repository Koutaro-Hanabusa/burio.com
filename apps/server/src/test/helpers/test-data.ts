import type { MockPost } from "../mocks/db.mock";

export const createMockPost = (overrides?: Partial<MockPost>): MockPost => {
	const id = overrides?.id || Math.floor(Math.random() * 1000000);
	const now = new Date();

	return {
		id,
		title: "Test Blog Post",
		slug: "test-blog-post",
		content: "# Test Content\n\nThis is a test blog post content.",
		excerpt: "This is a test excerpt",
		coverImage: "https://example.com/cover.jpg",
		tags: JSON.stringify(["test", "vitest"]),
		views: 0,
		authorId: 1,
		published: 1,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
};

export const createMultipleMockPosts = (count: number): MockPost[] => {
	return Array.from({ length: count }, (_, i) =>
		createMockPost({
			id: i + 1,
			title: `Test Post ${i + 1}`,
			slug: `test-post-${i + 1}`,
			published: i % 2 === 0 ? 1 : 0, // 偶数は公開、奇数は下書き
		}),
	);
};

export const createPublishedPost = (
	overrides?: Partial<MockPost>,
): MockPost => {
	return createMockPost({
		published: 1,
		...overrides,
	});
};

export const createDraftPost = (overrides?: Partial<MockPost>): MockPost => {
	return createMockPost({
		published: 0,
		...overrides,
	});
};
