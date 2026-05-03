import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const BlogPostNotFound = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-4xl text-center">
				<h1 className="mb-4 font-bold text-3xl">記事が見つかりません</h1>
				<p className="mb-6 text-muted-foreground">
					お探しの記事は存在しないか、削除された可能性があります。
				</p>
				<Button asChild>
					<Link to="/blog">ブログ一覧に戻る</Link>
				</Button>
			</div>
		</main>
	);
};
