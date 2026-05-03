import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type DeleteBlogPostInput = {
	id: number;
};

type DeleteBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.blog.delete.mutate>
>;

/**
 * ブログ記事を削除する純関数。
 */
export const deleteBlogPost = ({ id }: DeleteBlogPostInput) =>
	trpcClient.blog.delete.mutate({ id });

type UseDeleteBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<DeleteBlogPostResult, Error, DeleteBlogPostInput>,
		"mutationFn"
	>;
};

/**
 * ブログ記事削除 mutation hook。
 * 成功時に `blog.getAll` のキャッシュを invalidate する。
 */
export const useDeleteBlogPost = ({
	mutationConfig,
}: UseDeleteBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: deleteBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
