import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function Hero() {
	return (
		<motion.section
			className="min-h-screen flex items-center justify-center px-6 py-20"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="max-w-4xl w-full">
				<div className="space-y-6">
					<motion.div
						className="text-5xl md:text-7xl font-bold tracking-tight text-balance inline-block"
						initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
						animate={{
							opacity: 1,
							scale: 1,
							rotate: 0,
						}}
						whileHover={{
							scale: 1.1,
							rotate: [0, -5, 5, -5, 0],
							transition: { duration: 0.5 },
						}}
						transition={{
							delay: 0.2,
							duration: 0.8,
							type: "spring",
							stiffness: 200,
							damping: 10,
						}}
					>
						{["ぶ", "り", "お"].map((char, i) => (
							<motion.span
								key={char}
								className="inline-block"
								initial={{ opacity: 0, y: 50 }}
								animate={{ opacity: 1, y: 0 }}
								whileHover={{
									y: -10,
									color: "#3b82f6",
									transition: { duration: 0.2 },
								}}
								transition={{
									delay: 0.4 + i * 0.1,
									type: "spring",
									stiffness: 100,
								}}
							>
								{char}
							</motion.span>
						))}
					</motion.div>
					<motion.p
						className="text-xl md:text-2xl text-muted-foreground"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.8 }}
					>
						WEBエンジニア
					</motion.p>
					<motion.p
						className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					>
						文系学部からほぼ未経験でエンジニアとして
						<a href="https://sencorp.co.jp/">千株式会社</a>
						に新卒入社
						<br />
						最近はフロントエンドエンジニアを志し日々勉強中
					</motion.p>
					<motion.div
						className="flex gap-4 pt-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.8 }}
					>
						{[
							{
								icon: Github,
								href: "https://github.com/Koutaro-Hanabusa?tab=repositories",
								label: "GitHub",
							},
							{
								icon: Twitter,
								href: "https://x.com/buri16_koutaro",
								label: "Twitter",
							},
							{
								icon: Instagram,
								href: "https://www.instagram.com/buri_yellowtail?igsh=b2wyaTBpZ3dicmd0&utm_source=qr",
								label: "Instagram",
							},
						].map((social, index) => (
							<motion.div
								key={social.label}
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
							>
								<Button
									variant="ghost"
									size="icon"
									asChild
									className="hover:scale-110 transition-transform"
								>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
									>
										<social.icon className="h-5 w-5" />
									</a>
								</Button>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
}

function Favorites() {
	const favorites = [
		{
			category: "Tottenham Hotspur FC",
			items: ["Son Heung-Min", "Harry Kane"],
		},
		{
			category: "食べ物",
			items: ["タコス", "ラーメン", "ハンバーガー"],
		},
	];

	return (
		<motion.section
			className="py-20 px-6 md:px-12 lg:px-24"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className="max-w-4xl mx-auto">
				<motion.h2
					className="text-3xl md:text-4xl font-bold mb-12 text-balance"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					好きなもの
				</motion.h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{favorites.map((favorite, index) => (
						<motion.div
							key={favorite.category}
							className="p-6 rounded-lg bg-card border border-border"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.6 }}
							viewport={{ once: true }}
							whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
						>
							<h3 className="text-xl font-semibold mb-4 text-primary">
								{favorite.category}
							</h3>
							<div className="space-y-2">
								{favorite.items.map((item, itemIndex) => (
									<motion.div
										key={item}
										className="text-muted-foreground flex items-center gap-2"
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{
											delay: index * 0.1 + itemIndex * 0.05,
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

function Blog() {
	const {
		data: posts,
		isLoading,
		error,
	} = trpc.blog.getAll.useQuery({
		limit: 3,
		published: true,
	});

	const { isAdmin } = useAdminAccess();

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (isLoading) {
		return (
			<motion.section
				className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold mb-12">
						最新のブログ記事
					</h2>
					<div className="text-center text-muted-foreground">読み込み中...</div>
				</div>
			</motion.section>
		);
	}

	if (error || !posts || posts.length === 0) {
		return null;
	}

	return (
		<motion.section
			className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-12">
					<motion.h2
						className="text-3xl md:text-4xl font-bold text-balance"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						最新のブログ記事
					</motion.h2>
					<motion.div
						className="flex gap-4"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<Link
							to="/blog"
							className="text-primary hover:text-primary/80 transition-colors font-medium"
						>
							すべて見る →
						</Link>
						{isAdmin && (
							<Link
								to="/admin"
								className="text-primary hover:text-primary/80 transition-colors font-medium"
							>
								管理画面
							</Link>
						)}
					</motion.div>
				</div>
				<div className="space-y-6">
					{posts.map((post, index) => (
						<motion.article
							key={post.slug}
							className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.6 }}
							viewport={{ once: true }}
							whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
						>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
								<h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
									<Link to={`/blog/${post.slug}`}>{post.title}</Link>
								</h3>
								<time className="text-sm text-muted-foreground">
									{formatDate(post.createdAt)}
								</time>
							</div>
							{post.excerpt && (
								<p className="text-muted-foreground leading-relaxed">
									{post.excerpt}
								</p>
							)}
							{post.views > 0 && (
								<div className="mt-2 text-sm text-muted-foreground">
									{post.views} views
								</div>
							)}
						</motion.article>
					))}
				</div>
			</div>
		</motion.section>
	);
}

function HomeComponent() {
	return (
		<main className="min-h-screen">
			<Hero />
			<Favorites />
			<Blog />
		</main>
	);
}
