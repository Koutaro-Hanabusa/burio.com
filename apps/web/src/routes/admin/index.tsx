import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";

export const Route = createFileRoute("/admin/")({
	ssr: false,
	component: AdminDashboard,
});
