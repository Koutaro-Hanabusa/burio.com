import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";

const createSlug = (title: string): string => {
	// 日本語を含むタイトルに対応するため、日本語文字をローマ字に変換するか、
	// タイムスタンプベースのslugを生成
	const baseSlug = title
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, "") // Unicode文字とハイフンを残す
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();

	// slugが空の場合（日本語のみのタイトルなど）は、タイムスタンプベースのslugを生成
	if (!baseSlug) {
		return `post-${Date.now()}`;
	}

	return baseSlug;
};

export const blogRouter = router({
	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(10),
				offset: z.number().min(0).default(0),
				published: z.boolean().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			console.log(`📊 getAll called with input:`, input);
			console.log(`🗄️ Database available:`, !!ctx.env?.DB);

			const conditions = [];
			if (input.published !== undefined) {
				// Convert boolean to integer for database comparison
				const publishedValue = input.published ? 1 : 0;
				console.log(
					`🔍 Filtering by published: ${input.published} (DB value: ${publishedValue})`,
				);
				conditions.push(eq(posts.published, publishedValue));
			}

			// Temporary: Use raw SQL to debug
			console.log(`🔍 Executing query with conditions:`, conditions.length);

			const result = await db
				.select()
				.from(posts)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			// Try raw SQL as fallback for debugging
			if (result.length === 0) {
				console.log(`🆘 Drizzle returned 0 results, trying raw SQL...`);
				const rawResult = await ctx.env.DB.prepare(
					"SELECT * FROM posts ORDER BY created_at DESC LIMIT ?",
				)
					.bind(input.limit)
					.all();
				console.log(`🔍 Raw SQL result:`, rawResult);
			}

			console.log(`📝 Query returned ${result.length} results`);
			if (result.length > 0) {
				console.log(`🔍 First result:`, result[0]);
			}

			return result;
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx }) => {
			console.log(`🔍 getBySlug called with slug: ${input.slug}`);

			try {
				const post = await db
					.select()
					.from(posts)
					.where(eq(posts.slug, input.slug))
					.limit(1);

				console.log(`📊 Query result: found ${post.length} posts`);

				if (post.length === 0) {
					throw new Error("Post not found");
				}

				// Increment view count
				await db
					.update(posts)
					.set({ views: sql`${posts.views} + 1` })
					.where(eq(posts.slug, input.slug));

				// Fetch markdown content from R2 if needed
				const postData = post[0];
				console.log(
					`🔍 Attempting to fetch R2 content for slug: ${postData.slug}`,
				);

				if (ctx.env?.R2_BUCKET) {
					try {
						const r2Key = `blog/${postData.slug}.md`;
						console.log(`📁 R2 Key: ${r2Key}`);

						const object = await ctx.env.R2_BUCKET.get(r2Key);
						console.log(`📄 R2 Object exists: ${!!object}`);

						if (object) {
							const content = await object.text();
							console.log(`📝 Content length: ${content.length} characters`);
							console.log(
								`🔤 Content preview: ${content.substring(0, 100)}...`,
							);
							postData.content = content;
						} else {
							console.log(`❌ No object found for key: ${r2Key}`);
						}
					} catch (error) {
						console.error("❌ Error fetching content from R2:", error);
					}
				} else {
					console.log("⚠️ R2_BUCKET not available in context");
				}

				return postData;
			} catch (error) {
				console.error(`❌ Error in getBySlug for slug ${input.slug}:`, error);
				throw error;
			}
		}),

	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1),
				content: z.string().optional(),
				excerpt: z.string().optional(),
				coverImage: z.string().optional(),
				tags: z.array(z.string()).optional(),
				published: z.boolean().default(false),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const slug = createSlug(input.title);

			// Save markdown content to R2 if available
			if (ctx.env?.R2_BUCKET && input.content) {
				try {
					await ctx.env.R2_BUCKET.put(`blog/${slug}.md`, input.content, {
						httpMetadata: {
							contentType: "text/markdown",
						},
					});
				} catch (error) {
					console.error("Error saving content to R2:", error);
				}
			}

			const result = await db
				.insert(posts)
				.values({
					title: input.title,
					slug,
					content: input.content || null,
					excerpt: input.excerpt || null,
					coverImage: input.coverImage || null,
					tags:
						input.tags && input.tags.length > 0
							? JSON.stringify(input.tags)
							: null,
					published: input.published ? 1 : 0,
				})
				.returning();

			return result[0];
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				content: z.string().optional(),
				excerpt: z.string().optional(),
				coverImage: z.string().optional(),
				tags: z.array(z.string()).optional(),
				published: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const updateData: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			if (input.title) updateData.title = input.title;
			if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
			if (input.coverImage !== undefined)
				updateData.coverImage = input.coverImage;
			if (input.tags !== undefined)
				updateData.tags = JSON.stringify(input.tags);
			if (input.published !== undefined)
				updateData.published = input.published ? 1 : 0;

			// Get current post to check slug
			const currentPost = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (currentPost.length === 0) {
				throw new Error("Post not found");
			}

			// Update slug if title changed
			if (input.title && input.title !== currentPost[0].title) {
				updateData.slug = createSlug(input.title);
			}

			// Update markdown content in R2
			if (ctx.env?.R2_BUCKET && input.content !== undefined) {
				const slug = updateData.slug || currentPost[0].slug;
				try {
					await ctx.env.R2_BUCKET.put(`blog/${slug}.md`, input.content, {
						httpMetadata: {
							contentType: "text/markdown",
						},
					});
				} catch (error) {
					console.error("Error updating content in R2:", error);
				}
			}

			const result = await db
				.update(posts)
				.set(updateData)
				.where(eq(posts.id, input.id))
				.returning();

			return result[0];
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			console.log(`🗑️ Attempting to delete post with ID: ${input.id}`);

			// Get post to delete R2 content
			const postToDelete = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			console.log(`📊 Found ${postToDelete.length} posts to delete`);

			if (postToDelete.length === 0) {
				console.error(`❌ Post not found with ID: ${input.id}`);
				throw new Error("Post not found");
			}

			console.log(
				`📝 Deleting post: ${postToDelete[0].title} (${postToDelete[0].slug})`,
			);

			// Delete from R2
			if (ctx.env?.R2_BUCKET) {
				try {
					console.log(
						`📁 Deleting R2 content: blog/${postToDelete[0].slug}.md`,
					);
					await ctx.env.R2_BUCKET.delete(`blog/${postToDelete[0].slug}.md`);
				} catch (error) {
					console.error("Error deleting content from R2:", error);
				}
			}

			// Delete from database
			console.log(`🗄️ Deleting from database...`);
			const deleteResult = await db.delete(posts).where(eq(posts.id, input.id));
			console.log(`✅ Delete completed successfully`);

			return { success: true };
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			// Simple search implementation
			const result = await db
				.select()
				.from(posts)
				.where(
					and(
						eq(posts.published, 1),
						sql`lower(${posts.title}) LIKE lower(${`%${input.query}%`}) OR lower(${posts.excerpt}) LIKE lower(${`%${input.query}%`})`,
					),
				)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit);

			return result;
		}),
});
