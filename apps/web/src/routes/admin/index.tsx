import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "./-components/pages/AdminDashboardPage";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboardPage,
});
