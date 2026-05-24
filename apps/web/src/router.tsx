import { createRouter } from "@tanstack/react-router";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { createQueryClient, trpc } from "./utils/trpc";

export function getRouter() {
	const queryClient = createQueryClient();

	return createRouter({
		routeTree,
		defaultPreload: "intent",
		defaultPendingComponent: () => <Loader />,
		context: { trpc, queryClient },
		scrollRestoration: true,
	});
}
