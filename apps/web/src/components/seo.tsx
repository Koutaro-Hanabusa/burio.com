import { Helmet } from "react-helmet-async";

interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: "website" | "article";
	siteName?: string;
}

const DEFAULT_VALUES = {
	title: "burio16.com　ぶりおのプロフィールサイト",
	description: "burio16.comへようこそ",
	image: "https://burio16.com/burio.com_ogp.png",
	url: "https://burio16.com/",
	type: "website" as const,
	siteName: "burio16.com",
};

export function SEO({
	title,
	description,
	image,
	url,
	type = "article",
	siteName,
}: SEOProps) {
	const seoTitle = title || DEFAULT_VALUES.title;
	const seoDescription = description || DEFAULT_VALUES.description;
	const seoImage = image || DEFAULT_VALUES.image;
	const seoUrl = url || DEFAULT_VALUES.url;
	const seoType = type || DEFAULT_VALUES.type;
	const seoSiteName = siteName || DEFAULT_VALUES.siteName;

	return (
		<Helmet>
			{/* Basic Meta Tags */}
			<title>{seoTitle}</title>
			<meta name="description" content={seoDescription} />

			{/* Open Graph Protocol */}
			<meta property="og:type" content={seoType} />
			<meta property="og:site_name" content={seoSiteName} />
			<meta property="og:title" content={seoTitle} />
			<meta property="og:description" content={seoDescription} />
			<meta property="og:url" content={seoUrl} />
			<meta property="og:image" content={seoImage} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta property="og:image:alt" content={`${seoTitle} thumbnail`} />
			<meta property="og:locale" content="ja_JP" />

			{/* Twitter Card */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={seoTitle} />
			<meta name="twitter:description" content={seoDescription} />
			<meta name="twitter:image" content={seoImage} />
			<meta name="twitter:image:alt" content={`${seoTitle} thumbnail`} />

			{/* Canonical URL */}
			<link rel="canonical" href={seoUrl} />
		</Helmet>
	);
}
