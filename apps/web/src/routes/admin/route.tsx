import { createFileRoute, Outlet } from "@tanstack/react-router";
import { trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/admin")({
	ssr: false,
	// beforeLoad で authenticate を先行させないと、子 route の loader
	// (admin.getAllPosts) が Cookie 未発行のまま走り 401 になる。
	// 失敗時は子の AdminGuard 側で拒否 UI を出すので握り潰してよい。
	beforeLoad: async () => {
		try {
			await trpcClient.admin.authenticate.mutate();
		} catch {
			// noop
		}
	},
	component: () => <Outlet />,
});
