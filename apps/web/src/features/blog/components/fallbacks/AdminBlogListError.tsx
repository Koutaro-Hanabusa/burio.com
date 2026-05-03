import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const AdminBlogListError = ({ error, reset }: ErrorComponentProps) => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-6xl space-y-6 text-center">
				<h1 className="font-bold text-3xl">記事一覧の取得に失敗しました</h1>
				<p className="text-muted-foreground">{error.message}</p>
				<div className="flex justify-center gap-3">
					<Button onClick={reset} variant="outline">
						再読み込み
					</Button>
					<Button asChild>
						<Link to="/admin">管理ホームへ</Link>
					</Button>
				</div>
			</div>
		</main>
	);
};
