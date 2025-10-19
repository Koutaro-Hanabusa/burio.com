import { vi } from "vitest";
import type { posts } from "../../db/schema";

export interface MockPost {
	id: string;
	title: string;
	slug: string;
	content: string | null;
	excerpt: string | null;
	coverImage: string | null;
	tags: string | null;
	views: number;
	authorId: string | null;
	published: number;
	createdAt: Date;
	updatedAt: Date;
}

// インメモリストレージ
let mockPosts: MockPost[] = [];

// モックデータのリセット
export function resetMockData() {
	mockPosts = [];
}

// モックデータの設定
export function setMockPosts(posts: MockPost[]) {
	mockPosts = [...posts];
}

// モックデータの取得
export function getMockPosts(): MockPost[] {
	return [...mockPosts];
}

// drizzle-ormのクエリビルダーのモック
export const createMockDbQuery = () => {
	const queryBuilder = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		offset: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	};

	// select().from().where()...のチェーンの最終結果を設定
	queryBuilder.limit.mockImplementation((limit: number) => {
		const obj = { ...queryBuilder };
		obj.offset.mockImplementation((offset: number) => {
			// 実際のクエリ実行
			return Promise.resolve(mockPosts.slice(offset, offset + limit));
		});
		// limitのみの場合
		return Promise.resolve(mockPosts.slice(0, limit));
	});

	queryBuilder.offset.mockImplementation((offset: number) => {
		return Promise.resolve(mockPosts.slice(offset));
	});

	return queryBuilder;
};

// dbモックの作成
export const createMockDb = () => {
	return {
		select: vi.fn(() => {
			const builder = createMockDbQuery();

			builder.from.mockImplementation(() => {
				const fromBuilder = { ...builder };

				fromBuilder.where.mockImplementation((condition?: unknown) => {
					const whereBuilder = { ...fromBuilder };

					whereBuilder.orderBy.mockImplementation(() => {
						const orderBuilder = { ...whereBuilder };

						orderBuilder.limit.mockImplementation((limit: number) => {
							const limitBuilder = { ...orderBuilder };

							limitBuilder.offset.mockImplementation((offset: number) => {
								return Promise.resolve(mockPosts.slice(offset, offset + limit));
							});

							return Promise.resolve(mockPosts.slice(0, limit));
						});

						return orderBuilder;
					});

					whereBuilder.limit.mockImplementation((limit: number) => {
						const limitBuilder = { ...whereBuilder };

						limitBuilder.offset.mockImplementation((offset: number) => {
							return Promise.resolve(mockPosts.slice(offset, offset + limit));
						});

						return Promise.resolve(mockPosts.slice(0, limit));
					});

					return whereBuilder;
				});

				fromBuilder.orderBy.mockImplementation(() => {
					const orderBuilder = { ...fromBuilder };

					orderBuilder.limit.mockImplementation((limit: number) => {
						const limitBuilder = { ...orderBuilder };

						limitBuilder.offset.mockImplementation((offset: number) => {
							return Promise.resolve(mockPosts.slice(offset, offset + limit));
						});

						return Promise.resolve(mockPosts.slice(0, limit));
					});

					return orderBuilder;
				});

				fromBuilder.limit.mockImplementation((limit: number) => {
					const limitBuilder = { ...fromBuilder };

					limitBuilder.offset.mockImplementation((offset: number) => {
						return Promise.resolve(mockPosts.slice(offset, offset + limit));
					});

					return Promise.resolve(mockPosts.slice(0, limit));
				});

				return fromBuilder;
			});

			return builder;
		}),

		insert: vi.fn(() => {
			const builder = createMockDbQuery();

			builder.values.mockImplementation((data: Partial<MockPost>) => {
				const valuesBuilder = { ...builder };

				valuesBuilder.returning.mockImplementation(() => {
					const newPost: MockPost = {
						id: `post-${Date.now()}`,
						title: data.title || "",
						slug: data.slug || "",
						content: data.content || null,
						excerpt: data.excerpt || null,
						coverImage: data.coverImage || null,
						tags: data.tags || null,
						views: data.views || 0,
						authorId: data.authorId || null,
						published: data.published || 0,
						createdAt: new Date(),
						updatedAt: new Date(),
					};

					mockPosts.push(newPost);
					return Promise.resolve([newPost]);
				});

				return valuesBuilder;
			});

			return builder;
		}),

		update: vi.fn(() => {
			const builder = createMockDbQuery();

			builder.set.mockImplementation((data: Partial<MockPost>) => {
				const setBuilder = { ...builder };

				setBuilder.where.mockImplementation((condition: unknown) => {
					const whereBuilder = { ...setBuilder };

					whereBuilder.returning.mockImplementation(() => {
						// 最初の投稿を更新（簡略化）
						if (mockPosts.length > 0) {
							const updated = {
								...mockPosts[0],
								...data,
								updatedAt: new Date(),
							};
							mockPosts[0] = updated;
							return Promise.resolve([updated]);
						}
						return Promise.resolve([]);
					});

					return whereBuilder;
				});

				return setBuilder;
			});

			return builder;
		}),

		delete: vi.fn(() => {
			const builder = createMockDbQuery();

			builder.where.mockImplementation((condition: unknown) => {
				const whereBuilder = { ...builder };

				// deleteは返り値がないので、直接Promise.resolveを返す
				return Promise.resolve({ success: true });
			});

			return builder;
		}),
	};
};

// R2バケットのモック
export const createMockR2Bucket = () => {
	const storage = new Map<string, string>();

	return {
		get: vi.fn(async (key: string) => {
			const content = storage.get(key);
			if (!content) return null;

			return {
				text: async () => content,
				body: content,
			};
		}),
		put: vi.fn(async (key: string, content: string) => {
			storage.set(key, content);
			return { key };
		}),
		delete: vi.fn(async (key: string) => {
			storage.delete(key);
			return { success: true };
		}),
		list: vi.fn(async () => {
			return {
				objects: Array.from(storage.keys()).map((key) => ({ key })),
			};
		}),
		_storage: storage, // テスト用に直接アクセス
	};
};

// D1データベースのモック
export const createMockD1Database = () => {
	return {
		prepare: vi.fn((query: string) => {
			return {
				bind: vi.fn().mockReturnThis(),
				all: vi.fn(async () => ({
					results: mockPosts,
					success: true,
				})),
				first: vi.fn(async () => mockPosts[0] || null),
				run: vi.fn(async () => ({
					success: true,
					meta: {},
				})),
			};
		}),
	};
};
