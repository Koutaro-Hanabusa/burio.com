import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts } from "../db/schema";
import { publicProcedure, router } from "../lib/trpc";
import {
	createAdminIPMiddleware,
	getCurrentIP,
} from "../middleware/ip-restriction";

// 管理者用プロシージャ（IP制限付き）
const adminProcedure = publicProcedure.use(createAdminIPMiddleware());

export const adminRouter = router({
	// IP制限チェック用エンドポイント
	checkAccess: publicProcedure.query(async ({ ctx }) => {
		if (!ctx.req) {
			return {
				allowed: false,
				message: "Request object not available",
			};
		}

		const { allowed } = getCurrentIP(ctx.req);

		return {
			allowed,
			message: allowed ? "Access granted" : "Access denied",
		};
	}),

	// 管理者専用：全ての記事取得（下書きも含む）
	getAllPosts: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			console.log("📊 Admin getAllPosts called with input:", input);

			const result = await db
				.select()
				.from(posts)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			console.log(`📝 Admin query returned ${result.length} results`);
			return result;
		}),

	// 管理者専用：記事作成
	createPost: adminProcedure
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
			console.log(`📝 Admin creating post: ${input.title}`);

			const slug = createSlug(input.title);

			// R2にコンテンツを保存
			if (ctx.env?.R2_BUCKET && input.content) {
				try {
					await ctx.env.R2_BUCKET.put(`blog/${slug}.md`, input.content, {
						httpMetadata: {
							contentType: "text/markdown",
						},
					});
					console.log(`💾 Content saved to R2: blog/${slug}.md`);
				} catch (error) {
					console.error("❌ Error saving content to R2:", error);
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
					published: input.published ? 1 : 0,
				})
				.returning();

			console.log(`✅ Post created: ${result[0].id}`);
			return result[0];
		}),

	// 管理者専用：記事更新
	updatePost: adminProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).optional(),
				content: z.string().optional(),
				excerpt: z.string().optional(),
				coverImage: z.string().optional(),
				tags: z.array(z.string()).optional(),
				published: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log(`📝 Admin updating post: ${input.id}`);

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

			// 現在の記事を取得してスラッグをチェック
			const currentPost = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (currentPost.length === 0) {
				throw new Error("Post not found");
			}

			// タイトルが変更された場合、スラッグも更新
			if (input.title && input.title !== currentPost[0].title) {
				updateData.slug = createSlug(input.title);
			}

			// R2のコンテンツを更新
			if (ctx.env?.R2_BUCKET && input.content !== undefined) {
				const slug = updateData.slug || currentPost[0].slug;
				try {
					await ctx.env.R2_BUCKET.put(`blog/${slug}.md`, input.content, {
						httpMetadata: {
							contentType: "text/markdown",
						},
					});
					console.log(`💾 Content updated in R2: blog/${slug}.md`);
				} catch (error) {
					console.error("❌ Error updating content in R2:", error);
				}
			}

			const result = await db
				.update(posts)
				.set(updateData)
				.where(eq(posts.id, input.id))
				.returning();

			console.log(`✅ Post updated: ${input.id}`);
			return result[0];
		}),

	// 管理者専用：記事削除
	deletePost: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			console.log(`🗑️ Admin deleting post: ${input.id}`);

			// 削除前に記事情報を取得（R2削除のため）
			const postToDelete = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (postToDelete.length === 0) {
				throw new Error("Post not found");
			}

			// R2からコンテンツを削除
			if (ctx.env?.R2_BUCKET) {
				try {
					await ctx.env.R2_BUCKET.delete(`blog/${postToDelete[0].slug}.md`);
					console.log(
						`🗑️ Content deleted from R2: blog/${postToDelete[0].slug}.md`,
					);
				} catch (error) {
					console.error("❌ Error deleting content from R2:", error);
				}
			}

			await db.delete(posts).where(eq(posts.id, input.id));

			console.log(`✅ Post deleted: ${input.id}`);
			return { success: true };
		}),
});

// スラッグ生成関数
function createSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\\s-]/g, "")
		.replace(/\\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}
