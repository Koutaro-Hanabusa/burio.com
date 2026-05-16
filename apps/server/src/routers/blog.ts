import { and, desc, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts, viewLogs } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";
import {
	getAllowedIPs,
	getClientIP,
	isIPAllowed,
} from "../middleware/client-ip";

const createSlug = (title: string): string => {
	const baseSlug = title
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();

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
			console.log("📊 getAll called with input:", input);
			console.log("🗄️ Database available:", !!ctx.env?.DB);

			const conditions = [];
			if (input.published !== undefined) {
				const publishedValue = input.published ? 1 : 0;
				console.log(
					`🔍 Filtering by published: ${input.published} (DB value: ${publishedValue})`,
				);
				conditions.push(eq(posts.published, publishedValue));
			}

			console.log("🔍 Executing query with conditions:", conditions.length);

			const result = await db
				.select()
				.from(posts)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			if (result.length === 0) {
				console.log("🆘 Drizzle returned 0 results, trying raw SQL...");
				const rawResult = await ctx.env.DB.prepare(
					"SELECT * FROM posts ORDER BY created_at DESC LIMIT ?",
				)
					.bind(input.limit)
					.all();
				console.log("🔍 Raw SQL result:", rawResult);
			}

			console.log(`📝 Query returned ${result.length} results`);
			if (result.length > 0) {
				console.log("🔍 First result:", result[0]);
			}

			return result;
		}),

	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			console.log(`🔍 getById called with id: ${input.id}`);

			try {
				const post = await db
					.select()
					.from(posts)
					.where(eq(posts.id, Number(input.id)))
					.limit(1);

				console.log(`📊 Query result: found ${post.length} posts`);

				if (post.length === 0) {
					throw new Error("Post not found");
				}

				const postData = post[0];
				console.log(`🔍 Attempting to fetch R2 content for id: ${postData.id}`);

				if (ctx.env?.R2_BUCKET) {
					try {
						const r2Key = `blog/${postData.id}.md`;
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
				console.error(`❌ Error in getById for id ${input.id}:`, error);
				throw error;
			}
		}),

	trackView: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			try {
				const clientIP = ctx.req ? getClientIP(ctx.req) : "unknown";

				// 管理者 IP からのアクセスはトラッキングしない
				if (isIPAllowed(clientIP, getAllowedIPs(ctx.env?.ADMIN_ALLOWED_IPS))) {
					return { tracked: false };
				}

				const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
				const existing = await db
					.select()
					.from(viewLogs)
					.where(
						and(
							eq(viewLogs.postId, input.id),
							eq(viewLogs.ipAddress, clientIP),
							gt(viewLogs.viewedAt, oneHourAgo),
						),
					)
					.limit(1);

				if (existing.length > 0) {
					return { tracked: false };
				}

				await db.insert(viewLogs).values({
					postId: input.id,
					ipAddress: clientIP,
				});

				await db
					.update(posts)
					.set({ views: sql`${posts.views} + 1` })
					.where(eq(posts.id, input.id));

				return { tracked: true };
			} catch (error) {
				console.error("Failed to track view:", error);
				return { tracked: false };
			}
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
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

// createSlug は将来の拡張のためエクスポートしておく
export { createSlug };
