import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

type CreateBlogPostInput = Parameters<typeof trpcClient.blog.create.mutate>[0];
type CreateBlogPostResult = Awaited<
	ReturnType<typeof trpcClient.blog.create.mutate>
>;

/**
 * 新規ブログ記事を作成する純関数。
 */
export const createBlogPost = (data: CreateBlogPostInput) =>
	trpcClient.blog.create.mutate(data);

type UseCreateBlogPostOptions = {
	mutationConfig?: Omit<
		UseMutationOptions<CreateBlogPostResult, Error, CreateBlogPostInput>,
		"mutationFn"
	>;
};

/**
 * 新規ブログ記事作成 mutation hook。
 * 成功時に `blog.getAll` 配下のキャッシュを invalidate する（hook 内部で固定）。
 * ナビゲーション等の追加副作用は consumer 側から `mutationConfig` で渡す。
 */
export const useCreateBlogPost = ({
	mutationConfig,
}: UseCreateBlogPostOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restConfig } = mutationConfig ?? {};

	return useMutation({
		...restConfig,
		mutationFn: createBlogPost,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: getQueryKey(trpc.blog.getAll),
			});
			onSuccess?.(data, variables, onMutateResult, context);
		},
	});
};
