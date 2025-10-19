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
			className="py-20 px-6 md:px-12 lg:px-24"
			initial="hidden"
			whileInView="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
			viewport={{ once: true }}
		>
			<div className="max-w-4xl mx-auto">
				<motion.h2
					className="text-3xl md:text-4xl font-bold mb-12 text-balance"
					initial="hidden"
					whileInView="visible"
					variants={fadeInUpVariants}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					好きなもの
				</motion.h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{FAVORITES.map((favorite, index) => (
						<motion.div
							key={favorite.category}
							className="p-6 rounded-lg bg-card border border-border"
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
							<h3 className="text-xl font-semibold mb-4 text-primary">
								{favorite.category}
							</h3>
							<div className="space-y-2">
								{favorite.items.map((item, itemIndex) => (
									<motion.div
										key={item}
										className="text-muted-foreground flex items-center gap-2"
										initial="hidden"
										whileInView="visible"
										variants={fadeInLeftVariants}
										transition={{
											delay: getStaggerDelay(index) + itemIndex * 0.05,
											duration: 0.4,
										}}
										viewport={{ once: true }}
									>
										<span className="w-1.5 h-1.5 rounded-full bg-accent" />
										<span>{item}</span>
									</motion.div>
								))}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</motion.section>
	);
}
