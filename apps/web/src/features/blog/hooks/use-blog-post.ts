import { useEffect } from "react";
import { trpc } from "@/utils/trpc";

/**
 * 公開ブログ詳細を Suspense 経由で取得するフック。
 * 取得した記事の view を一度だけ track する副作用も内包する。
 */
export const useBlogPost = (id: number) => {
	const [data] = trpc.blog.getById.useSuspenseQuery({ id });
	const trackViewMutation = trpc.blog.trackView.useMutation();

	// Track page view (fire once per page load / per post)
	// biome-ignore lint/correctness/useExhaustiveDependencies: track once per post id
	useEffect(() => {
		trackViewMutation.mutate({ id: data.id });
	}, [data.id]);

	return data;
};
