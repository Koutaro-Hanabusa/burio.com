import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RiAddLine, RiArticleLine, RiDashboardLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";

export const AdminQuickActions = () => {
	return (
		<motion.div
			className="mt-12 rounded-lg border border-border bg-card p-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.8, duration: 0.6 }}
		>
			<h2 className="mb-4 font-semibold text-2xl">クイックアクション</h2>
			<div className="flex flex-wrap gap-4">
				<Button asChild>
					<Link to="/admin/blog/new">
						<RiAddLine className="mr-2 h-4 w-4" />
						新規記事作成
					</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link to="/admin/blog">
						<RiArticleLine className="mr-2 h-4 w-4" />
						記事一覧
					</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link to="/blog">
						<RiDashboardLine className="mr-2 h-4 w-4" />
						ブログを表示
					</Link>
				</Button>
			</div>
		</motion.div>
	);
};
