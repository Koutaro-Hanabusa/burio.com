import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	RiAddLine,
	RiArticleLine,
	RiDashboardLine,
	RiSettingsLine,
} from "react-icons/ri";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminCards = [
	{
		title: "記事管理",
		description: "ブログ記事の作成、編集、削除",
		icon: RiArticleLine,
		href: "/admin/blog",
		color: "bg-primary",
	},
	{
		title: "新規記事作成",
		description: "新しいブログ記事を作成",
		icon: RiAddLine,
		href: "/admin/blog/new",
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

export const AdminNavCards = () => {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{adminCards.map((card, index) => (
				<motion.div
					key={card.href}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
					whileHover={{ y: -4 }}
				>
					<Link to={card.href}>
						<Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3">
									<div
										className={`rounded-lg p-3 ${card.color} text-white transition-transform group-hover:scale-110`}
									>
										<card.icon className="h-6 w-6" />
									</div>
									<CardTitle className="text-xl">{card.title}</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">{card.description}</p>
							</CardContent>
						</Card>
					</Link>
				</motion.div>
			))}
		</div>
	);
};
