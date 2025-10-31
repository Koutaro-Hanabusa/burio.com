import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Blog } from "@/components/home/blog";
import { Favorites } from "@/components/home/favorites";
import { Hero } from "@/components/home/hero";
import { SEO } from "@/components/seo";

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
	const [shouldLoadBackground, setShouldLoadBackground] = useState(false);

	useEffect(() => {
		// Defer loading of ThreeBackground until after initial render
		// This ensures critical content (Hero) loads first for better LCP
		if ("requestIdleCallback" in window) {
			// Use requestIdleCallback if available (most browsers)
			requestIdleCallback(
				() => {
					setShouldLoadBackground(true);
				},
				{ timeout: 2000 }, // Fallback timeout
			);
		} else {
			// Fallback for Safari and older browsers
			const timer = setTimeout(() => {
				setShouldLoadBackground(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, []);

	return (
		<>
			<SEO />
			{/* 3D Background - deferred load for better LCP */}
			{shouldLoadBackground && (
				<Suspense fallback={null}>
					<ThreeBackground />
				</Suspense>
			)}

			<main className="relative z-10 min-h-screen">
				{/* Main content - loads immediately for optimal LCP */}
				<Hero />
				<Favorites />
				<Blog />
			</main>
		</>
	);
}
