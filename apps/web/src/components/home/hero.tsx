import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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

const NAME_CHARACTERS = ["ぶ", "り", "お"] as const;

export function Hero() {
	return (
		<motion.section
			className="flex min-h-screen items-center justify-center px-6 py-20"
			initial="hidden"
			animate="visible"
			variants={sectionVariants}
			transition={smoothTransition}
		>
			<div className="w-full max-w-4xl">
				<div className="space-y-6">
					<motion.div
						className="inline-block text-balance font-bold text-5xl tracking-tight md:text-7xl"
						initial="hidden"
						animate="visible"
						whileHover="hover"
						variants={heroTitleVariants}
						transition={heroTitleTransition}
					>
						{NAME_CHARACTERS.map((char, i) => (
							<motion.span
								key={char}
								className="inline-block"
								initial="hidden"
								animate="visible"
								whileHover="hover"
								variants={characterVariants}
								transition={{
									delay: getStaggerDelay(i, 0.4),
									...springTransition,
								}}
							>
								{char}
							</motion.span>
						))}
					</motion.div>

					<motion.p
						className="text-muted-foreground text-xl md:text-2xl"
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.4, ...smoothTransition }}
					>
						WEBエンジニア
					</motion.p>

					<motion.p
						className="max-w-2xl text-lg text-muted-foreground leading-relaxed"
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.6, ...smoothTransition }}
					>
						文系学部からほぼ未経験でエンジニアとして
						<a href="https://sencorp.co.jp/">千株式会社</a>
						に新卒入社
						<br />
						最近はフロントエンドエンジニアを志し日々勉強中
					</motion.p>

					<motion.div
						className="flex gap-4 pt-4"
						initial="hidden"
						animate="visible"
						variants={fadeInUpVariants}
						transition={{ delay: 0.8, ...smoothTransition }}
					>
						{SOCIAL_LINKS.map((social, index) => (
							<motion.div
								key={social.label}
								initial="hidden"
								animate="visible"
								variants={socialIconVariants}
								transition={{
									delay: getStaggerDelay(index, 1.0),
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
									>
										<social.icon className="h-5 w-5" />
									</a>
								</Button>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
}
