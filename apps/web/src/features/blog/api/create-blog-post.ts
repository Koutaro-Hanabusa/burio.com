import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type CreateBlogPostInput = Parameters<
	typeof trpcClient.admin.createPost.mutate
>[0];
type CreateBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.admin.createPost.mutate>
>;

export const createBlogPost = (data: CreateBlogPostInput) =>
	trpcClient.admin.createPost.mutate(data);

type UseCreateBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<CreateBlogPostResult, Error, CreateBlogPostInput>,
		"mutationFn"
	>;
};

export const useCreateBlogPost = ({
	mutationConfig,
}: UseCreateBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: createBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			// public 側の一覧 (blog.getAll) と admin 側 (admin.getAllPosts) の
			// 双方を最新化する必要がある。
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
