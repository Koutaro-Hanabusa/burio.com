import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type TogglePublishBlogPostInput = {
	id: number;
	currentPublished: boolean;
};

type TogglePublishBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.blog.update.mutate>
>;

/**
 * ブログ記事の公開状態をトグルする純関数。
 * 現在の公開状態を反転して update mutation を呼び出す。
 */
export const togglePublishBlogPost = ({
	id,
	currentPublished,
}: TogglePublishBlogPostInput) =>
	trpcClient.blog.update.mutate({
		id,
		published: !currentPublished,
	});

type UseTogglePublishBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<
			TogglePublishBlogPostResult,
			Error,
			TogglePublishBlogPostInput
		>,
		"mutationFn"
	>;
};

/**
 * ブログ記事の公開状態切替 mutation hook。
 * 成功時に `blog.getAll` のキャッシュを invalidate する。
 */
export const useTogglePublishBlogPost = ({
	mutationConfig,
}: UseTogglePublishBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: togglePublishBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
