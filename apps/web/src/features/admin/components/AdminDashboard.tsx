import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "void/client";
import { Button } from "@/components/ui/button";
import { AdminNavCards } from "@/features/admin/components/AdminNavCards";
import { AdminQuickActions } from "@/features/admin/components/AdminQuickActions";

export const AdminDashboard = () => {
	const [signOutError, setSignOutError] = useState(false);

	async function signOut() {
		try {
			const result = await auth.signOut();
			if (result.error) throw result.error;
			window.location.assign("/admin/login");
		} catch {
			setSignOutError(true);
		}
	}

	return (
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
						<Button className="mt-6" variant="outline" onClick={signOut}>
							ログアウト
						</Button>
						{signOutError && (
							<p role="alert" className="mt-2 text-destructive text-sm">
								ログアウトできませんでした。もう一度お試しください。
							</p>
						)}
					</motion.div>

					<AdminNavCards />

					<AdminQuickActions />
				</div>
			</motion.div>
		</main>
	);
};
