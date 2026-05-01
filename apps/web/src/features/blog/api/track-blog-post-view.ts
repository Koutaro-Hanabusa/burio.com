import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { trpcClient } from "@/utils/trpc";

type TrackBlogPostViewInput = {
	id: number;
};

type TrackBlogPostViewResult = Awaited<
	ReturnType<typeof trpcClient.blog.trackView.mutate>
>;

/**
 * ブログ記事の view を track する純関数。
 */
export const trackBlogPostView = ({ id }: TrackBlogPostViewInput) =>
	trpcClient.blog.trackView.mutate({ id });

type UseTrackBlogPostViewOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<TrackBlogPostViewResult, Error, TrackBlogPostViewInput>,
		"mutationFn"
	>;
};

/**
 * ブログ記事の view を track する mutation hook。
 * 副作用専用のため invalidate は行わない。
 */
export const useTrackBlogPostView = ({
	mutationConfig,
}: UseTrackBlogPostViewOptions = {}) =>
	useMutation({
		...mutationConfig,
		mutationFn: trackBlogPostView,
	});
