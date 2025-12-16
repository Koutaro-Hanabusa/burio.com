import { motion } from "framer-motion";
import {
	fadeInUpVariants,
	fadeInVariants,
	smoothTransition,
} from "@/constants/animations";

export function Lt() {
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
					<a href="https://slide.burio16.com/">LT 登壇・登壇資料</a>
				</motion.h2>

				<iframe
					className="aspect-video w-full rounded-lg"
					title="ぶりおの登壇資料たち"
					src="https://slide.burio16.com"
				/>
			</div>
		</motion.section>
	);
}
