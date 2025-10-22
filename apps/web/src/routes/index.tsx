import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Blog } from "@/components/home/blog";
import { Favorites } from "@/components/home/favorites";
import { Hero } from "@/components/home/hero";

// Lazy load the 3D background for better initial bundle size
const ThreeBackground = lazy(() =>
	import("@/components/backgrounds/ThreeBackground").then((module) => ({
		default: module.ThreeBackground,
	})),
);

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			{/* 3D Background - only loaded on desktop */}
			<Suspense fallback={null}>
				<ThreeBackground />
			</Suspense>

			<main className="relative z-10 min-h-screen">
				{/* Main content */}
				<Hero />
				<Favorites />
				<Blog />
			</main>
		</>
	);
}
