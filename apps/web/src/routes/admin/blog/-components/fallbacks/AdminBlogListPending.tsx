import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RiAddLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminBlogListPending = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<motion.div
				className="mx-auto max-w-6xl"
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-bold text-3xl">ブログ管理</h1>
					<Button asChild>
						<Link to="/admin/blog/new">
							<RiAddLine className="mr-2 h-4 w-4" />
							新しい記事
						</Link>
					</Button>
				</div>

				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="rounded-lg border p-4">
							<Skeleton className="mb-2 h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					))}
				</div>
			</motion.div>
		</main>
	);
};
