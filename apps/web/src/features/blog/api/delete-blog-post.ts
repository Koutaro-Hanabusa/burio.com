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
	ReturnType<typeof trpcClient.admin.deletePost.mutate>
>;

export const deleteBlogPost = ({ id }: DeleteBlogPostInput) =>
	trpcClient.admin.deletePost.mutate({ id });

type UseDeleteBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<DeleteBlogPostResult, Error, DeleteBlogPostInput>,
		"mutationFn"
	>;
};

export const useDeleteBlogPost = ({
	mutationConfig,
}: UseDeleteBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: deleteBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			void queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.admin.getAllPosts),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
