import type { getBlogPost } from "./server/get-blog-post";
import type { getBlogPosts } from "./server/get-blog-posts";

export type BlogPost = Awaited<ReturnType<typeof getBlogPost>>;
export type BlogPostListItem = Awaited<ReturnType<typeof getBlogPosts>>[number];
