import { createFileRoute } from "@tanstack/react-router";
import { Blog } from "@/components/home/blog";
import { Favorites } from "@/components/home/favorites";
import { Hero } from "@/components/home/hero";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<main className="min-h-screen">
			<Hero />
			<Favorites />
			<Blog />
		</main>
	);
}
