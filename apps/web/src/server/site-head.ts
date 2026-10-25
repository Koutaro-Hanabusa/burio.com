import type { HeadDescriptor } from "void";

export function sitePageHead({
	title,
	path,
	description,
	socialTitle = title,
	noIndex = false,
}: {
	title: string;
	path: string;
	description: string;
	socialTitle?: string;
	noIndex?: boolean;
}): HeadDescriptor {
	const url = new URL(path, "https://burio16.com").href;
	return {
		title,
		meta: [
			{ name: "description", content: description },
			{ property: "og:title", content: socialTitle },
			{ property: "og:description", content: description },
			{ property: "og:url", content: url },
			{ name: "twitter:title", content: socialTitle },
			{ name: "twitter:description", content: description },
			{ name: "twitter:url", content: url },
			...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
		],
		link: [{ rel: "canonical", href: url }],
	};
}
