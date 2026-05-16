import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createServerTrpcClient } from "@/utils/trpc.server";

const inputSchema = z.object({ id: z.number().int().positive() });

export const getBlogPost = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => inputSchema.parse(input))
	.handler(async ({ data }) => {
		const trpc = createServerTrpcClient();
		return trpc.blog.getById.query({ id: data.id });
	});
