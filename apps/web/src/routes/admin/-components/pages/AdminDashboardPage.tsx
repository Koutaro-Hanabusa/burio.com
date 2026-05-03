import { motion } from "framer-motion";
import { AdminGuard } from "@/components/admin-guard";
import { AdminNavCards } from "@/features/admin/components/admin-nav-cards";
import { AdminQuickActions } from "@/features/admin/components/admin-quick-actions";

export const AdminDashboardPage = () => {
	return (
		<AdminGuard>
			<main className="min-h-screen bg-background">
				<motion.div
					className="px-6 py-12 md:px-12 lg:px-24"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className="mx-auto max-w-6xl">
						<motion.div
							className="mb-12"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.8 }}
						>
							<h1 className="mb-4 font-bold text-4xl md:text-5xl">管理画面</h1>
							<p className="text-muted-foreground text-xl">
								ブログとサイトの管理を行います
							</p>
						</motion.div>

						<AdminNavCards />

						<AdminQuickActions />
					</div>
				</motion.div>
			</main>
		</AdminGuard>
	);
};
