import { motion } from "framer-motion";
import {
	cardHoverVariants,
	fadeInLeftVariants,
	fadeInUpVariants,
	fadeInVariants,
	getStaggerDelay,
	smoothTransition,
} from "@/constants/animations";
import { FAVORITES } from "@/constants/favorites";

export function Favorites() {
	return (
		<motion.section
			className="px-6 py-20 md:px-12 lg:px-24"
			initial="hidden"
			whileInView="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
			viewport={{ once: true }}
		>
			<div className="mx-auto max-w-4xl">
				<motion.h2
					className="mb-12 text-balance font-bold text-3xl md:text-4xl"
					initial="hidden"
					whileInView="visible"
					variants={fadeInUpVariants}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					好きなもの
				</motion.h2>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{FAVORITES.map((favorite, index) => (
						<motion.div
							key={favorite.category}
							className="rounded-lg border border-border bg-card p-6"
							initial="hidden"
							whileInView="visible"
							whileHover="hover"
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0 },
								...cardHoverVariants,
							}}
							transition={{ delay: getStaggerDelay(index), duration: 0.6 }}
							viewport={{ once: true }}
						>
							<h3 className="mb-4 font-semibold text-primary text-xl">
								{favorite.category}
							</h3>
							<div className="space-y-2">
								{favorite.items.map((item, itemIndex) => (
									<motion.div
										key={item}
										className="flex items-center gap-2 text-muted-foreground"
										initial="hidden"
										whileInView="visible"
										variants={fadeInLeftVariants}
										transition={{
											delay: getStaggerDelay(index) + itemIndex * 0.05,
											duration: 0.4,
										}}
										viewport={{ once: true }}
									>
										<span className="h-1.5 w-1.5 rounded-full bg-accent" />
										<span>{item}</span>
									</motion.div>
								))}
							</div>
							{favorite.detail && (
								<motion.div
									className="mt-4 whitespace-pre-line text-muted-foreground text-sm"
									initial="hidden"
									whileInView="visible"
									variants={fadeInLeftVariants}
									transition={{
										delay:
											getStaggerDelay(index) + favorite.items.length * 0.05,
										duration: 0.4,
									}}
									viewport={{ once: true }}
								>
									<span>{favorite.detail}</span>
								</motion.div>
							)}
						</motion.div>
					))}
				</div>
			</div>
		</motion.section>
	);
}
