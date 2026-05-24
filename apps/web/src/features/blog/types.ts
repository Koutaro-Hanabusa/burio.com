import type { getBlogPost } from "./api/get-blog-post";
import type { getBlogPosts } from "./api/get-blog-posts";

export type BlogPost = Awaited<ReturnType<typeof getBlogPost>>;
export type BlogPostListItem = Awaited<ReturnType<typeof getBlogPosts>>[number];
