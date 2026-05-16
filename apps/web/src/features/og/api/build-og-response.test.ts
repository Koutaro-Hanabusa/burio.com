import { describe, expect, it, vi } from "vitest";
import { buildOgResponse } from "./build-og-response";

vi.mock("workers-og", () => {
	class MockImageResponse {
		body: ReadableStream;
		constructor(_element: unknown, _options: unknown) {
			this.body = new ReadableStream({
				start(controller) {
					controller.enqueue(new Uint8Array([137, 80, 78, 71]));
					controller.close();
				},
			});
		}
	}
	return { ImageResponse: MockImageResponse };
});

function makeMockD1(row: unknown | null) {
	return {
		prepare: () => ({
			bind: () => ({
				first: async <T>() => row as T,
			}),
		}),
	} as unknown as D1Database;
}

function makeMockR2(exists: boolean) {
	return {
		get: async (_key: string) => {
			if (!exists) return null;
			return {
				arrayBuffer: async () => new ArrayBuffer(8),
			};
		},
	} as unknown as R2Bucket;
}

global.fetch = vi.fn().mockResolvedValue({
	arrayBuffer: async () => new ArrayBuffer(4),
}) as unknown as typeof fetch;

describe("buildOgResponse", () => {
	it("投稿が存在しない場合は 404 を返す", async () => {
		const res = await buildOgResponse({
			db: makeMockD1(null),
			r2: makeMockR2(true),
			id: 1,
		});
		expect(res.status).toBe(404);
	});

	it("投稿が unpublished の場合は 404 を返す", async () => {
		const res = await buildOgResponse({
			db: makeMockD1({
				title: "Draft Post",
				excerpt: null,
				tags: null,
				published: 0,
			}),
			r2: makeMockR2(true),
			id: 2,
		});
		expect(res.status).toBe(404);
	});

	it("公開済み投稿の場合は 200 と image/png を返す", async () => {
		const res = await buildOgResponse({
			db: makeMockD1({
				title: "Published Post",
				excerpt: "An excerpt",
				tags: '["tag1","tag2"]',
				published: 1,
			}),
			r2: makeMockR2(true),
			id: 3,
		});
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("image/png");
	});

	it("R2 から背景画像が見つからない場合は 500 を返す", async () => {
		const res = await buildOgResponse({
			db: makeMockD1({
				title: "Published Post",
				excerpt: null,
				tags: null,
				published: 1,
			}),
			r2: makeMockR2(false),
			id: 4,
		});
		expect(res.status).toBe(500);
	});
});
