import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	RiAddLine,
	RiArticleLine,
	RiDashboardLine,
	RiSettingsLine,
} from "react-icons/ri";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const adminCards = [
		{
			title: "記事管理",
			description: "ブログ記事の作成、編集、削除",
			icon: RiArticleLine,
			href: "/admin/posts",
			color: "bg-primary",
		},
		{
			title: "新規記事作成",
			description: "新しいブログ記事を作成",
			icon: RiAddLine,
			href: "/admin/posts/new",
			color: "bg-emerald-500",
		},
		{
			title: "ダッシュボード",
			description: "サイト統計とアナリティクス",
			icon: RiDashboardLine,
			href: "/admin/dashboard",
			color: "bg-violet-500",
		},
		{
			title: "設定",
			description: "サイト設定とカスタマイズ",
			icon: RiSettingsLine,
			href: "/admin/settings",
			color: "bg-slate-500",
		},
	];

	return (
		<AdminGuard>
			<main className="min-h-screen bg-background">
				<motion.div
					className="px-6 py-12 md:px-12 lg:px-24"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					<div className="max-w-6xl mx-auto">
						<motion.div
							className="mb-12"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.8 }}
						>
							<h1 className="text-4xl md:text-5xl font-bold mb-4">管理画面</h1>
							<p className="text-xl text-muted-foreground">
								ブログとサイトの管理を行います
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{adminCards.map((card, index) => (
								<motion.div
									key={card.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
									whileHover={{ y: -4 }}
								>
									<Link to={card.href}>
										<Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
											<CardHeader className="pb-3">
												<div className="flex items-center gap-3">
													<div
														className={`p-3 rounded-lg ${card.color} text-white group-hover:scale-110 transition-transform`}
													>
														<card.icon className="h-6 w-6" />
													</div>
													<CardTitle className="text-xl">
														{card.title}
													</CardTitle>
												</div>
											</CardHeader>
											<CardContent>
												<p className="text-muted-foreground">
													{card.description}
												</p>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							))}
						</div>

						<motion.div
							className="mt-12 p-6 bg-card rounded-lg border border-border"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8, duration: 0.6 }}
						>
							<h2 className="text-2xl font-semibold mb-4">
								クイックアクション
							</h2>
							<div className="flex flex-wrap gap-4">
								<Button asChild>
									<Link to="/admin/posts/new">
										<RiAddLine className="h-4 w-4 mr-2" />
										新規記事作成
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/admin/posts">
										<RiArticleLine className="h-4 w-4 mr-2" />
										記事一覧
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link to="/blog">
										<RiDashboardLine className="h-4 w-4 mr-2" />
										ブログを表示
									</Link>
								</Button>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</main>
		</AdminGuard>
	);
}
