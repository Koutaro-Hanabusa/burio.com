import { lazy, Suspense, useEffect, useState } from "react";
import { Favorites } from "@/features/home/components/favorites";
import { Hero } from "@/features/home/components/hero";
import { BlogSection } from "@/features/home/components/home-blog-section";
import { Lt } from "@/features/home/components/lt";

// Lazy load the 3D background for better initial bundle size
const ThreeBackground = lazy(() =>
	import("@/components/backgrounds/ThreeBackground").then((module) => ({
		default: module.ThreeBackground,
	})),
);

export const HomePage = () => {
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
				<Lt />
				<BlogSection />
			</main>
		</>
	);
};
