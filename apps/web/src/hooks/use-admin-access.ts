import { trpc } from "@/utils/trpc";

/**
 * 管理者アクセス権限をチェックするカスタムフック
 * ページロード時に自動的にIP制限をチェックし、結果を返す
 */
export function useAdminAccess() {
	const { data: accessCheck, isLoading } = trpc.admin.checkAccess.useQuery(
		undefined,
		{
			retry: false, // 失敗時はリトライしない（非管理者の場合は即座に結果を返す）
			staleTime: 5 * 60 * 1000, // 5分間キャッシュ
			refetchOnWindowFocus: false, // ウィンドウフォーカス時に再取得しない
		},
	);

	return {
		isAdmin: accessCheck?.allowed ?? false,
		isLoading,
		ipInfo: accessCheck,
	};
}
