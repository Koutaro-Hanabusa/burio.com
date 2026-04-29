import { createFileRoute } from "@tanstack/react-router";
import { BlogList } from "./-components/BlogList";

export const Route = createFileRoute("/admin/blog/")({
	component: BlogAdmin,
});

function BlogAdmin() {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<BlogList />
		</main>
	);
}
