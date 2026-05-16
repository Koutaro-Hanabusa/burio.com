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
	ReturnType<typeof trpcClient.admin.updatePost.mutate>
>;

export const togglePublishBlogPost = ({
	id,
	currentPublished,
}: TogglePublishBlogPostInput) =>
	trpcClient.admin.updatePost.mutate({
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
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.admin.getAllPosts),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
