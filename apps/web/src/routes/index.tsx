import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/features/home/components/Home";

export const Route = createFileRoute("/")({
	component: Home,
});
