import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const AdminBlogEditNotFound = () => {
	const navigate = useNavigate();

	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-4xl text-center">
				<h1 className="mb-4 font-bold text-3xl">記事が見つかりません</h1>
				<Button onClick={() => navigate({ to: "/admin/blog" })}>
					管理画面に戻る
				</Button>
			</div>
		</main>
	);
};
