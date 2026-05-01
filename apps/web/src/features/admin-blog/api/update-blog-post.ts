import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type UpdateBlogPostInput = Parameters<typeof trpcClient.blog.update.mutate>[0];
type UpdateBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.blog.update.mutate>
>;

/**
 * ブログ記事を更新する純関数。
 */
export const updateBlogPost = (data: UpdateBlogPostInput) =>
	trpcClient.blog.update.mutate(data);

type UseUpdateBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<UpdateBlogPostResult, Error, UpdateBlogPostInput>,
		"mutationFn"
	>;
};

/**
 * ブログ記事更新 mutation hook。
 * 成功時に `blog.getAll` および `blog.getById` のキャッシュを invalidate する。
 */
export const useUpdateBlogPost = ({
	mutationConfig,
}: UseUpdateBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: updateBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getById, { id: variables.id }, "query"),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
