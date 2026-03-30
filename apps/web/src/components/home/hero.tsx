import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";
import {
	characterVariants,
	fadeInUpVariants,
	getStaggerDelay,
	heroTitleTransition,
	heroTitleVariants,
	sectionVariants,
	smoothTransition,
	socialIconVariants,
	springTransition,
} from "@/constants/animations";
import { SOCIAL_LINKS } from "@/constants/social-links";
import { type SocialPlatform, trackSocialClick } from "@/utils/analytics";

const NAME_CHARACTERS = ["ぶ", "り", "お"] as const;

export function Hero() {
	const [enableAnimations, setEnableAnimations] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Check if device is mobile (only in browser environment)
		const checkMobile = () => {
			if (typeof window !== "undefined") {
				setIsMobile(window.innerWidth < 768);
			}
		};

		checkMobile();

		if (typeof window !== "undefined") {
			window.addEventListener("resize", checkMobile);
		}

		// Enable animations after initial render for better LCP
		// This ensures critical content is visible immediately
		// Use requestIdleCallback if available for better performance
		if ("requestIdleCallback" in window) {
			requestIdleCallback(() => {
				setEnableAnimations(true);
			});
		} else {
			requestAnimationFrame(() => {
				setEnableAnimations(true);
			});
		}
	}, []);

	/**
	 * Handle social media link clicks and track them in GTM
	 */
	const handleSocialClick = (label: string) => {
		const platform = label.toLowerCase() as SocialPlatform;
		if (
			platform === "github" ||
			platform === "twitter" ||
			platform === "instagram"
		) {
			trackSocialClick(platform);
		}
	};

	return (
		<motion.section
			className="flex min-h-screen items-center justify-center px-6 py-20"
			initial={enableAnimations && !isMobile ? "hidden" : "visible"}
			animate="visible"
			variants={sectionVariants}
			transition={smoothTransition}
		>
			<MeshGradientCard
				className="aspect-[91/55] w-full max-w-4xl"
				colors={["#ffffff", "#a0c4ff", "#c4b0ff", "#80e0d0"]}
				shaderOpacity={0.4}
				contentClassName="flex h-full flex-col justify-between p-8 md:p-12 w-full"
			>
				<div className="space-y-4">
					<motion.div
						className="inline-block whitespace-nowrap text-balance font-bold text-5xl tracking-tight md:text-7xl"
						initial={enableAnimations && !isMobile ? "hidden" : "visible"}
						animate="visible"
						whileHover="hover"
						variants={heroTitleVariants}
						transition={heroTitleTransition}
					>
						{NAME_CHARACTERS.map((char, i) => (
							<motion.span
								key={char}
								className="inline-block"
								initial={enableAnimations && !isMobile ? "hidden" : "visible"}
								animate="visible"
								whileHover="hover"
								variants={characterVariants}
								transition={{
									delay:
										enableAnimations && !isMobile ? getStaggerDelay(i, 0.4) : 0,
									...springTransition,
								}}
							>
								{char}
							</motion.span>
						))}
					</motion.div>

					<motion.p
						className="text-muted-foreground text-xl md:text-2xl"
						initial={enableAnimations && !isMobile ? "hidden" : "visible"}
						animate="visible"
						variants={fadeInUpVariants}
						transition={{
							delay: enableAnimations && !isMobile ? 0.4 : 0,
							...smoothTransition,
						}}
					>
						WEBエンジニア
					</motion.p>
				</div>

				<div className="space-y-4">
					<motion.p
						className="max-w-2xl text-lg text-muted-foreground leading-relaxed"
						initial={enableAnimations && !isMobile ? "hidden" : "visible"}
						animate="visible"
						variants={fadeInUpVariants}
						transition={{
							delay: enableAnimations && !isMobile ? 0.6 : 0,
							...smoothTransition,
						}}
					>
						文系学部からほぼ未経験でエンジニアとして
						<a href="https://sencorp.co.jp/">千株式会社</a>
						に新卒入社
						<br />
						最近はフロントエンドエンジニアを志し日々勉強中
					</motion.p>

					<motion.div
						className="flex gap-6 pt-4"
						initial={enableAnimations && !isMobile ? "hidden" : "visible"}
						animate="visible"
						variants={fadeInUpVariants}
						transition={{
							delay: enableAnimations && !isMobile ? 0.8 : 0,
							...smoothTransition,
						}}
					>
						{SOCIAL_LINKS.map((social, index) => (
							<motion.div
								key={social.label}
								initial={enableAnimations && !isMobile ? "hidden" : "visible"}
								animate="visible"
								variants={socialIconVariants}
								transition={{
									delay:
										enableAnimations && !isMobile
											? getStaggerDelay(index, 1.0)
											: 0,
									duration: 0.3,
								}}
							>
								<Button
									variant="ghost"
									size="icon"
									asChild
									className="transition-transform hover:scale-110"
								>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										onClick={() => handleSocialClick(social.label)}
									>
										<social.icon className="size-9" />
									</a>
								</Button>
							</motion.div>
						))}
					</motion.div>
				</div>
			</MeshGradientCard>
		</motion.section>
	);
}
