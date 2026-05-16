type BlogPostHeadInput = {
	id: number;
	title: string;
	excerpt?: string | null;
};

export const buildBlogPostHead = (post: BlogPostHeadInput) => {
	const description = post.excerpt ?? "";
	const pageUrl = `https://burio16.com/blog/${post.id}`;
	const ogImageUrl = `https://burio16.com/api/og/blog/${post.id}`;

	return {
		meta: [
			{ title: post.title },
			{ name: "description", content: description },
			{ property: "og:type", content: "article" },
			{ property: "og:title", content: post.title },
			{ property: "og:description", content: description },
			{ property: "og:image", content: ogImageUrl },
			{ property: "og:url", content: pageUrl },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:site_name", content: "burio16.com" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: post.title },
			{ name: "twitter:description", content: description },
			{ name: "twitter:image", content: ogImageUrl },
		],
		links: [{ rel: "canonical", href: pageUrl }],
	};
};
