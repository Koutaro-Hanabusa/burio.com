import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts } from "../db/schema";
import { buildAdminCookie, buildClearAdminCookie } from "../lib/admin-cookie";
import { signAdminToken } from "../lib/admin-token";
import { countContentChars } from "../lib/count-content-chars";
import { publicProcedure, router } from "../lib/trpc";
import { adminAuthMiddleware } from "../middleware/admin-auth";
import {
	getAllowedIPs,
	getClientIP,
	isIPAllowed,
} from "../middleware/client-ip";

const TOKEN_TTL_SECONDS = 3600;

const adminProcedure = publicProcedure.use(adminAuthMiddleware);

export const adminRouter = router({
	authenticate: publicProcedure.mutation(async ({ ctx }) => {
		const secret = ctx.env?.ADMIN_TOKEN_SECRET;
		if (!secret) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "ADMIN_TOKEN_SECRET is not configured",
			});
		}

		const ip = getClientIP(ctx.req);
		const allowed = isIPAllowed(ip, getAllowedIPs(ctx.env?.ADMIN_ALLOWED_IPS));

		if (!allowed) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `Access denied from IP: ${ip}`,
			});
		}

		const iat = Math.floor(Date.now() / 1000);
		const exp = iat + TOKEN_TTL_SECONDS;
		const token = await signAdminToken(secret, { sub: "admin", iat, exp });

		ctx.responseHeaders.append("Set-Cookie", buildAdminCookie(token));

		return { authenticated: true, expiresAt: exp * 1000 };
	}),

	signOut: publicProcedure.mutation(({ ctx }) => {
		ctx.responseHeaders.append("Set-Cookie", buildClearAdminCookie());
		return { success: true };
	}),

	// UI ヒント用の IP 判定。実際の認可は Cookie トークンで adminProcedure が行う。
	checkAccess: publicProcedure.query(({ ctx }) => {
		const ip = getClientIP(ctx.req);
		const allowed = isIPAllowed(ip, getAllowedIPs(ctx.env?.ADMIN_ALLOWED_IPS));
		return { allowed };
	}),

	getAllPosts: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			const result = await db
				.select()
				.from(posts)
				.orderBy(desc(posts.createdAt))
				.limit(input.limit)
				.offset(input.offset);

			return result;
		}),

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
			const slug = createSlug(input.title);

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
					charCount: countContentChars(input.content),
				})
				.returning();

			const created = result[0];

			if (ctx.env?.R2_BUCKET && input.content) {
				try {
					await ctx.env.R2_BUCKET.put(`blog/${created.id}.md`, input.content, {
						httpMetadata: { contentType: "text/markdown" },
					});
				} catch (error) {
					console.error("Error saving content to R2:", error);
				}
			}

			return created;
		}),

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
			const updateData: Record<string, unknown> = { updatedAt: new Date() };

			if (input.title) updateData.title = input.title;
			if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
			if (input.coverImage !== undefined)
				updateData.coverImage = input.coverImage;
			if (input.tags !== undefined)
				updateData.tags = JSON.stringify(input.tags);
			if (input.published !== undefined)
				updateData.published = input.published ? 1 : 0;
			if (input.content !== undefined) {
				updateData.content = input.content;
				updateData.charCount = countContentChars(input.content);
			}

			const currentPost = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (currentPost.length === 0) {
				throw new Error("Post not found");
			}

			if (input.title && input.title !== currentPost[0].title) {
				updateData.slug = createSlug(input.title);
			}

			if (ctx.env?.R2_BUCKET && input.content !== undefined) {
				try {
					await ctx.env.R2_BUCKET.put(`blog/${input.id}.md`, input.content, {
						httpMetadata: { contentType: "text/markdown" },
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

	deletePost: adminProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const postToDelete = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (postToDelete.length === 0) {
				throw new Error("Post not found");
			}

			if (ctx.env?.R2_BUCKET) {
				try {
					await ctx.env.R2_BUCKET.delete([
						`blog/${postToDelete[0].id}.md`,
						`blog/${postToDelete[0].slug}.md`,
					]);
				} catch (error) {
					console.error("Error deleting content from R2:", error);
				}
			}

			await db.delete(posts).where(eq(posts.id, input.id));

			return { success: true };
		}),
});

export function createSlug(title: string): string {
	const base = title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	const suffix = crypto.randomUUID().slice(0, 8);
	return base ? `${base}-${suffix}` : suffix;
}
