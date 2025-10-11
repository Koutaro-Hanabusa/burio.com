import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RiArrowLeftLine, RiHome2Line } from "react-icons/ri";
import { Button } from "./ui/button";

export default function NotFound() {
	return (
		<main className="min-h-screen flex items-center justify-center px-6">
			<motion.div
				className="text-center max-w-md"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<motion.div
					className="text-8xl mb-6"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
				>
					404
				</motion.div>

				<h1 className="text-3xl font-bold mb-4">ページが見つかりません</h1>

				<p className="text-muted-foreground mb-8">
					お探しのページは存在しないか、移動した可能性があります。
				</p>

				<div className="flex gap-4 justify-center">
					<Button variant="outline" onClick={() => window.history.back()}>
						<RiArrowLeftLine className="mr-2 h-4 w-4" />
						戻る
					</Button>
					<Button asChild>
						<Link to="/">
							<RiHome2Line className="mr-2 h-4 w-4" />
							ホームへ
						</Link>
					</Button>
				</div>
			</motion.div>
		</main>
	);
}
