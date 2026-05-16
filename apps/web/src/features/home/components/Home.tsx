import { lazy, Suspense, useEffect, useState } from "react";
import { BlogSection } from "@/features/home/components/BlogSection";
import { Favorites } from "@/features/home/components/Favorites";
import { Hero } from "@/features/home/components/Hero";
import { Lt } from "@/features/home/components/Lt";

const ThreeBackground = lazy(() =>
	import("@/components/backgrounds/ThreeBackground").then((module) => ({
		default: module.ThreeBackground,
	})),
);

export const Home = () => {
	const [shouldLoadBackground, setShouldLoadBackground] = useState(false);

	useEffect(() => {
		if ("requestIdleCallback" in window) {
			requestIdleCallback(
				() => {
					setShouldLoadBackground(true);
				},
				{ timeout: 2000 },
			);
		} else {
			const timer = setTimeout(() => {
				setShouldLoadBackground(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, []);

	return (
		<>
			{shouldLoadBackground && (
				<Suspense fallback={null}>
					<ThreeBackground />
				</Suspense>
			)}

			<main className="relative z-10 min-h-screen">
				<Hero />
				<Favorites />
				<Lt />
				<BlogSection />
			</main>
		</>
	);
};
