import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getBlogPostUrl } from "@/utils/urls";

interface BlogLinkProps {
	id: number | string;
	children: ReactNode;
	className?: string;
}

/**
 * ブログ記事へのリンク
 * 本番環境では外部リンク（blog.burio16.com）、開発環境では内部リンクを使用
 */
export function BlogLink({ id, children, className }: BlogLinkProps) {
	const isExternalBlog = !!import.meta.env.VITE_BLOG_URL;

	if (isExternalBlog) {
		return (
			<a href={getBlogPostUrl(id)} className={className}>
				{children}
			</a>
		);
	}

	return (
		<Link to="/blog/$id" params={{ id: String(id) }} className={className}>
			{children}
		</Link>
	);
}
