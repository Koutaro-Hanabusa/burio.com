import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type UpdateBlogPostInput = Parameters<
	typeof trpcClient.admin.updatePost.mutate
>[0];
type UpdateBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.admin.updatePost.mutate>
>;

export const updateBlogPost = (data: UpdateBlogPostInput) =>
	trpcClient.admin.updatePost.mutate(data);

type UseUpdateBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<UpdateBlogPostResult, Error, UpdateBlogPostInput>,
		"mutationFn"
	>;
};

export const useUpdateBlogPost = ({
	mutationConfig,
}: UseUpdateBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: updateBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			void queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.admin.getAllPosts),
			});
			void queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getById, { id: variables.id }, "query"),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
