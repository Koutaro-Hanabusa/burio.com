import type { ErrorComponentProps } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const BlogEditError = ({ error, reset }: ErrorComponentProps) => {
	const navigate = useNavigate();

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-4xl space-y-6 text-center">
				<h1 className="font-bold text-3xl">記事の取得に失敗しました</h1>
				<p className="text-muted-foreground">{error.message}</p>
				<div className="flex justify-center gap-3">
					<Button onClick={reset} variant="outline">
						再読み込み
					</Button>
					<Button onClick={() => navigate({ to: "/admin/blog" })}>
						管理画面に戻る
					</Button>
				</div>
			</div>
		</main>
	);
};
