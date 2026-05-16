import { trpc } from "@/utils/trpc";

export function useAdminAccess() {
	const { data: accessCheck, isLoading } = trpc.admin.checkAccess.useQuery(
		undefined,
		{
			retry: false,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	);

	return {
		isAdmin: accessCheck?.authenticated ?? false,
		isLoading,
	};
}
