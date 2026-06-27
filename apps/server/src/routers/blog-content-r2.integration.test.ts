import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { testClient, testDb } = await vi.hoisted(async () => {
	const { createClient } = await import("@libsql/client");
	const { drizzle } = await import("drizzle-orm/libsql");
	const schema = await import("../db/schema");
	const client = createClient({ url: ":memory:" });
	return { testClient: client, testDb: drizzle(client, { schema }) };
});

vi.mock("../db", () => ({ db: testDb }));

import { posts } from "../db/schema";
import { buildAdminCookie } from "../lib/admin-cookie";
import { signAdminToken } from "../lib/admin-token";
import { appRouter } from "./index";

const ADMIN_SECRET = "test-admin-secret-key-at-least-32-bytes!!";

type R2Store = Map<string, string>;

function createR2Mock(store: R2Store) {
	return {
		async put(key: string, value: string) {
			store.set(key, value);
		},
		async get(key: string) {
			if (!store.has(key)) return null;
			const value = store.get(key) as string;
			return { text: async () => value };
		},
		async delete(keys: string | string[]) {
			for (const k of Array.isArray(keys) ? keys : [keys]) store.delete(k);
		},
	};
}

async function createTestCaller(r2Store: R2Store) {
	const now = Math.floor(Date.now() / 1000);
	const token = await signAdminToken(ADMIN_SECRET, {
		sub: "admin",
		iat: now,
		exp: now + 3600,
	});
	const ctx = {
		session: null,
		env: {
			DB: null,
			R2_BUCKET: createR2Mock(r2Store),
			ADMIN_TOKEN_SECRET: ADMIN_SECRET,
			ADMIN_ALLOWED_IPS: "127.0.0.1,::1",
		},
		req: new Request("http://localhost/trpc", {
			headers: { Cookie: buildAdminCookie(token) },
		}),
		responseHeaders: new Headers(),
	};
	return appRouter.createCaller(ctx as never);
}

async function resetPostsTable() {
	await testClient.execute("DROP TABLE IF EXISTS posts");
	await testClient.execute(`
		CREATE TABLE posts (
			id integer PRIMARY KEY AUTOINCREMENT,
			title text NOT NULL,
			slug text NOT NULL UNIQUE,
			content text,
			excerpt text,
			cover_image text,
			tags text,
			char_count integer DEFAULT 0,
			views integer DEFAULT 0,
			author_id integer,
			published integer DEFAULT 0,
			created_at integer,
			updated_at integer
		)
	`);
}

describe("ブログ本文 R2 ラウンドトリップ (id キー統一)", () => {
	let r2: R2Store;

	beforeEach(async () => {
		await resetPostsTable();
		r2 = new Map();
	});

	it("日本語タイトルで作成した本文を getById で読み戻せる", async () => {
		const caller = await createTestCaller(r2);
		const created = await caller.admin.createPost({
			title: "日本語のタイトル",
			content: "v1 本文",
			published: false,
		});
		expect(created.slug).not.toBe("");
		expect(created.slug).toMatch(/^[a-z0-9-]+$/);
		expect(r2.get(`blog/${created.id}.md`)).toBe("v1 本文");
		const fetched = await caller.blog.getById({ id: created.id });
		expect(fetched.content).toBe("v1 本文");
	});

	it("本文を更新すると getById に反映される（本来のバグの再発防止）", async () => {
		const caller = await createTestCaller(r2);
		const created = await caller.admin.createPost({
			title: "更新テスト",
			content: "v1",
			published: false,
		});
		await caller.admin.updatePost({ id: created.id, content: "v2" });
		expect(r2.get(`blog/${created.id}.md`)).toBe("v2");
		const fetched = await caller.blog.getById({ id: created.id });
		expect(fetched.content).toBe("v2");
	});

	it("タイトルを変更しても本文は id キーのまま読み戻せる", async () => {
		const caller = await createTestCaller(r2);
		const created = await caller.admin.createPost({
			title: "旧タイトル",
			content: "v1",
			published: false,
		});
		await caller.admin.updatePost({
			id: created.id,
			title: "新しいタイトル",
			content: "v3",
		});
		const fetched = await caller.blog.getById({ id: created.id });
		expect(fetched.content).toBe("v3");
		expect(r2.get(`blog/${created.id}.md`)).toBe("v3");
	});

	it("日本語タイトルの記事を複数作成できる（slug UNIQUE 衝突しない）", async () => {
		const caller = await createTestCaller(r2);
		const a = await caller.admin.createPost({
			title: "記事A",
			content: "a",
			published: false,
		});
		const b = await caller.admin.createPost({
			title: "記事B",
			content: "b",
			published: false,
		});
		expect(a.id).not.toBe(b.id);
		expect(a.slug).not.toBe(b.slug);
		expect((await caller.blog.getById({ id: a.id })).content).toBe("a");
		expect((await caller.blog.getById({ id: b.id })).content).toBe("b");
	});

	it("旧 slug キー保存の本文は getById がフォールバックで読む", async () => {
		const caller = await createTestCaller(r2);
		const inserted = await testDb
			.insert(posts)
			.values({ title: "レガシー", slug: "legacy-slug", published: 0 })
			.returning();
		const id = inserted[0].id;
		r2.set("blog/legacy-slug.md", "legacy content");
		const fetched = await caller.blog.getById({ id });
		expect(fetched.content).toBe("legacy content");
	});

	it("削除すると id キーと旧 slug キーの両方が消える", async () => {
		const caller = await createTestCaller(r2);
		const created = await caller.admin.createPost({
			title: "削除テスト",
			content: "x",
			published: false,
		});
		r2.set(`blog/${created.slug}.md`, "legacy x");
		await caller.admin.deletePost({ id: created.id });
		expect(r2.has(`blog/${created.id}.md`)).toBe(false);
		expect(r2.has(`blog/${created.slug}.md`)).toBe(false);
	});
});
