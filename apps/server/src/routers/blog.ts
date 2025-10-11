import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";

const createSlug = (title: string): string => {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
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
		.query(async ({ input }) => {
			const conditions = [];
			if (input.published !== undefined) {
				conditions.push(eq(posts.published, input.published));
			}

			const result = await db
				.select()
				.from(posts)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return result;
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input, ctx }) => {
			const post = await db
				.select()
				.from(posts)
				.where(eq(posts.slug, input.slug))
				.limit(1);

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
			if (ctx.env?.R2_BUCKET) {
				try {
					const object = await ctx.env.R2_BUCKET.get(
						`blog/${postData.slug}.md`,
					);
					if (object) {
						postData.content = await object.text();
					}
				} catch (error) {
					console.error("Error fetching content from R2:", error);
				}
			}

			return postData;
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
					content: input.content,
					excerpt: input.excerpt,
					coverImage: input.coverImage,
					tags: input.tags ? JSON.stringify(input.tags) : null,
					published: input.published,
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
			if (input.published !== undefined) updateData.published = input.published;

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
			// Get post to delete R2 content
			const postToDelete = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (postToDelete.length === 0) {
				throw new Error("Post not found");
			}

			// Delete from R2
			if (ctx.env?.R2_BUCKET) {
				try {
					await ctx.env.R2_BUCKET.delete(`blog/${postToDelete[0].slug}.md`);
				} catch (error) {
					console.error("Error deleting content from R2:", error);
				}
			}

			await db.delete(posts).where(eq(posts.id, input.id));
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
						eq(posts.published, true),
						sql`lower(${posts.title}) LIKE lower(${`%${input.query}%`}) OR lower(${posts.excerpt}) LIKE lower(${`%${input.query}%`})`,
					),
				)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit);

			return result;
		}),
});
