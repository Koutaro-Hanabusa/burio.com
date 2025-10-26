import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { posts } from "../db/schema";
import { generateOGPImage } from "../lib/ogp-generator";
import { publicProcedure, router } from "../lib/trpc";

export const ogpRouter = router({
	/**
	 * Generate OGP image by blog post ID
	 */
	generateById: publicProcedure
		.input(
			z.object({
				id: z.number(),
			}),
		)
		.query(async ({ input }) => {
			// Fetch post from database
			const post = await db
				.select()
				.from(posts)
				.where(eq(posts.id, input.id))
				.limit(1);

			if (post.length === 0) {
				throw new Error(`Post not found with id: ${input.id}`);
			}

			const postData = post[0];

			// Generate OGP image
			const result = await generateOGPImage({
				title: postData.title,
				siteName: "burio16.com",
			});

			return {
				image: result.svg,
				contentType: result.contentType,
			};
		}),

	/**
	 * Generate OGP image by custom title (for preview/testing)
	 */
	generateByTitle: publicProcedure
		.input(
			z.object({
				title: z.string().min(1),
				siteName: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			// Generate OGP image with custom title
			const result = await generateOGPImage({
				title: input.title,
				siteName: input.siteName || "burio16.com",
			});

			return {
				image: result.svg,
				contentType: result.contentType,
			};
		}),
});
