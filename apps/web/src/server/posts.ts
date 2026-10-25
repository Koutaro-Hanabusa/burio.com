import { and, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getSession } from "void/auth";
import { posts, viewLogs } from "./schema";
import { countContentChars } from "./auth/count-content-chars";
import { getClientIP } from "./auth/client-ip";

export type BlogEnv = {
	DB: D1Database;
	R2_BUCKET: R2Bucket;
};

export type Post = typeof posts.$inferSelect;
export type PostInput = {
	title: string;
	content: string;
	excerpt: string;
	coverImage: string;
	tags: string[];
	published: boolean;
};

const database = (env: BlogEnv) => drizzle(env.DB);

export async function listPosts(
	env: BlogEnv,
	publishedOnly: boolean,
	limit = 50,
) {
	return database(env)
		.select()
		.from(posts)
		.where(publishedOnly ? eq(posts.published, 1) : undefined)
		.orderBy(desc(posts.createdAt))
		.limit(limit);
}

export async function getPost(
	env: BlogEnv,
	id: number,
	publishedOnly: boolean,
) {
	const rows = await database(env)
		.select()
		.from(posts)
		.where(
			and(eq(posts.id, id), publishedOnly ? eq(posts.published, 1) : undefined),
		)
		.limit(1);
	const post = rows[0];
	if (!post) return null;
	const object =
		(await env.R2_BUCKET.get(`blog/${id}.md`)) ??
		(await env.R2_BUCKET.get(`blog/${post.slug}.md`));
	return { ...post, content: object ? await object.text() : post.content };
}

function createSlug(title: string) {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	const suffix = crypto.randomUUID().slice(0, 8);
	return base ? `${base}-${suffix}` : suffix;
}

export async function createPost(env: BlogEnv, input: PostInput) {
	const db = database(env);
	const [created] = await db
		.insert(posts)
		.values({
			title: input.title,
			slug: createSlug(input.title),
			content: input.content,
			excerpt: input.excerpt,
			coverImage: input.coverImage,
			tags: JSON.stringify(input.tags),
			published: 0,
			charCount: countContentChars(input.content),
		})
		.returning();
	try {
		await env.R2_BUCKET.put(`blog/${created.id}.md`, input.content, {
			httpMetadata: { contentType: "text/markdown" },
		});
		if (input.published) {
			await db
				.update(posts)
				.set({ published: 1 })
				.where(eq(posts.id, created.id));
		}
	} catch (error) {
		await db.delete(posts).where(eq(posts.id, created.id));
		throw error;
	}
	return created.id;
}

export async function updatePost(env: BlogEnv, id: number, input: PostInput) {
	const db = database(env);
	const current = await getPost(env, id, false);
	if (!current) return false;
	const key = `blog/${id}.md`;
	const original = await env.R2_BUCKET.get(key);
	await env.R2_BUCKET.put(key, input.content, {
		httpMetadata: { contentType: "text/markdown" },
	});
	try {
		await db
			.update(posts)
			.set({
				title: input.title,
				slug:
					input.title === current.title
						? current.slug
						: createSlug(input.title),
				content: input.content,
				excerpt: input.excerpt,
				coverImage: input.coverImage,
				tags: JSON.stringify(input.tags),
				published: input.published ? 1 : 0,
				charCount: countContentChars(input.content),
				updatedAt: new Date(),
			})
			.where(eq(posts.id, id));
	} catch (error) {
		if (original) {
			await env.R2_BUCKET.put(key, original.body, {
				httpMetadata: original.httpMetadata,
			});
		} else {
			await env.R2_BUCKET.delete(key);
		}
		throw error;
	}
	return true;
}

export async function setPostPublished(
	env: BlogEnv,
	id: number,
	published: boolean,
) {
	const result = await database(env)
		.update(posts)
		.set({ published: published ? 1 : 0, updatedAt: new Date() })
		.where(eq(posts.id, id))
		.returning({ id: posts.id });
	return result.length > 0;
}

export async function deletePost(env: BlogEnv, id: number) {
	const rows = await database(env)
		.select()
		.from(posts)
		.where(eq(posts.id, id))
		.limit(1);
	const post = rows[0];
	if (!post) return false;
	await database(env).delete(posts).where(eq(posts.id, id));
	await env.R2_BUCKET.delete([`blog/${id}.md`, `blog/${post.slug}.md`]);
	return true;
}

export async function trackPostView(
	env: BlogEnv,
	request: Request,
	id: number,
) {
	const ip = getClientIP(request);
	if (getSession()) return false;
	const db = database(env);
	const existing = await db
		.select({ id: viewLogs.id })
		.from(viewLogs)
		.where(
			and(
				eq(viewLogs.postId, id),
				eq(viewLogs.ipAddress, ip),
				gt(viewLogs.viewedAt, new Date(Date.now() - 3600_000)),
			),
		)
		.limit(1);
	if (existing.length) return false;
	const published = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.id, id), eq(posts.published, 1)))
		.limit(1);
	if (!published.length) return false;
	await db.insert(viewLogs).values({ postId: id, ipAddress: ip });
	await db
		.update(posts)
		.set({ views: sql`${posts.views} + 1` })
		.where(eq(posts.id, id));
	return true;
}
