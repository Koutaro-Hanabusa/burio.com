import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
					<motion.h1
						className="text-5xl md:text-7xl font-bold tracking-tight text-balance"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.8 }}
					>
						ぶりお
					</motion.h1>
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
						文系学部からほぼ未経験でエンジニアとして新卒入社
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

// function About() {
//   return (
//     <motion.section
//       className="px-6 py-20"
//       initial={{ opacity: 0 }}
//       whileInView={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//     >
//       <div className="max-w-4xl mx-auto">
//         <motion.h2
//           className="text-3xl md:text-4xl font-bold mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//         >
//           About
//         </motion.h2>
//         <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             WIP
//           </motion.p>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             WIP
//           </motion.p>
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             WIP
//           </motion.p>
//         </div>
//       </div>
//     </motion.section>
//   );
// }

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

// function Interests() {
// 	const interests = [
// 		{
// 			title: "Web開発",
// 			description:
// 				"最新技術とベストプラクティスを使用して、モダンで高性能なWebアプリケーションを構築しています。",
// 			tags: ["React", "TypeScript", "Cloudflare Workers"],
// 		},
// 		{
// 			title: "ユーザーエクスペリエンス",
// 			description:
// 				"思慮深いデザインとインタラクションを通じて、直感的で魅力的なユーザー体験を創造しています。",
// 			tags: ["UI/UX", "デザインシステム", "アクセシビリティ"],
// 		},
// 		{
// 			title: "サーバーレス技術",
// 			description:
// 				"クラウドネイティブなアーキテクチャを活用して、スケーラブルで効率的なソリューションを開発しています。",
// 			tags: ["Serverless", "Edge Computing", "APIs"],
// 		},
// 		{
// 			title: "オープンソース",
// 			description:
// 				"オープンソースコミュニティへの貢献を通じて、より良いソフトウェアを共に構築しています。",
// 			tags: ["GitHub", "コラボレーション", "コミュニティ"],
// 		},
// 	];

// 	return (
// 		<motion.section
// 			className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30"
// 			initial={{ opacity: 0 }}
// 			whileInView={{ opacity: 1 }}
// 			transition={{ duration: 0.8 }}
// 			viewport={{ once: true }}
// 		>
// 			<div className="max-w-4xl mx-auto">
// 				<motion.h2
// 					className="text-3xl md:text-4xl font-bold mb-12 text-balance"
// 					initial={{ opacity: 0, y: 20 }}
// 					whileInView={{ opacity: 1, y: 0 }}
// 					transition={{ duration: 0.6 }}
// 					viewport={{ once: true }}
// 				>
// 					興味関心
// 				</motion.h2>
// 				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// 					{interests.map((interest, index) => (
// 						<motion.div
// 							key={interest.title}
// 							className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
// 							initial={{ opacity: 0, y: 20 }}
// 							whileInView={{ opacity: 1, y: 0 }}
// 							transition={{ delay: index * 0.1, duration: 0.6 }}
// 							viewport={{ once: true }}
// 							whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
// 						>
// 							<h3 className="text-xl font-semibold mb-3">{interest.title}</h3>
// 							<p className="text-muted-foreground mb-4 leading-relaxed">
// 								{interest.description}
// 							</p>
// 							<div className="flex flex-wrap gap-2">
// 								{interest.tags.map((tag, tagIndex) => (
// 									<motion.span
// 										key={tag}
// 										className="px-3 py-1 text-sm rounded-full bg-accent/20 text-accent-foreground"
// 										initial={{ opacity: 0, scale: 0.8 }}
// 										whileInView={{ opacity: 1, scale: 1 }}
// 										transition={{
// 											delay: index * 0.1 + tagIndex * 0.05,
// 											duration: 0.3,
// 										}}
// 										viewport={{ once: true }}
// 										whileHover={{ scale: 1.05 }}
// 									>
// 										{tag}
// 									</motion.span>
// 								))}
// 							</div>
// 						</motion.div>
// 					))}
// 				</div>
// 			</div>
// 		</motion.section>
// 	);
// }

// function Blog() {
//   const posts = [
//     {
//       title: "Cloudflare WorkersでサーバーレスAPI開発",
//       date: "2024-01-15",
//       excerpt:
//         "モダンなサーバーレス技術を使用したAPI開発のベストプラクティスについて解説します。",
//       slug: "cloudflare-workers-api-development",
//     },
//     {
//       title: "TanStack Routerで型安全なルーティング",
//       date: "2024-01-01",
//       excerpt:
//         "Next.jsに代わる新しい選択肢として注目されるTanStack Routerの活用方法をご紹介。",
//       slug: "tanstack-router-type-safe-routing",
//     },
//     {
//       title: "Framer Motionでリッチなアニメーション",
//       date: "2023-12-15",
//       excerpt:
//         "Webサイトに動きを加えるFramer Motionライブラリの効果的な使い方を学びます。",
//       slug: "framer-motion-rich-animations",
//     },
//   ];

//   return (
//     <motion.section
//       className="py-20 px-6 md:px-12 lg:px-24"
//       initial={{ opacity: 0 }}
//       whileInView={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//     >
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center justify-between mb-12">
//           <motion.h2
//             className="text-3xl md:text-4xl font-bold text-balance"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             Latest Blog Posts
//           </motion.h2>
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//           >
//             <Link
//               to="/blog"
//               className="text-primary hover:text-primary/80 transition-colors font-medium"
//             >
//               View all →
//             </Link>
//           </motion.div>
//         </div>
//         <div className="space-y-6">
//           {posts.map((post, index) => (
//             <motion.article
//               key={post.slug}
//               className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1, duration: 0.6 }}
//               viewport={{ once: true }}
//               whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
//             >
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
//                 <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
//                   <Link to={`/blog/${post.slug}`}>{post.title}</Link>
//                 </h3>
//                 <time className="text-sm text-muted-foreground">
//                   {new Date(post.date).toLocaleDateString("ja-JP", {
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </time>
//               </div>
//               <p className="text-muted-foreground leading-relaxed">
//                 {post.excerpt}
//               </p>
//             </motion.article>
//           ))}
//         </div>
//       </div>
//     </motion.section>
//   );
// }

// function Contact() {
//   const healthCheck = useQuery(trpc.healthCheck.queryOptions());

//   return (
//     <motion.section
//       className="py-20 px-6"
//       initial={{ opacity: 0 }}
//       whileInView={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//     >
//       <div className="max-w-4xl mx-auto">
//         <motion.h2
//           className="text-3xl md:text-4xl font-bold mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//         >
//           Contact
//         </motion.h2>
//         <motion.div
//           className="rounded-lg border p-8 text-center space-y-6"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//           viewport={{ once: true }}
//           whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
//         >
//           <p className="text-lg text-muted-foreground leading-relaxed">
//             プロジェクトのご相談やお仕事のご依頼はお気軽にご連絡ください。
//             新しい挑戦や面白いプロジェクトのお話をお待ちしています。
//           </p>
//           <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
//             <span>サイトステータス:</span>
//             <div className="flex items-center gap-2">
//               <motion.div
//                 className={`h-2 w-2 rounded-full ${
//                   healthCheck.data ? "bg-green-500" : "bg-red-500"
//                 }`}
//                 animate={healthCheck.data ? { scale: [1, 1.2, 1] } : {}}
//                 transition={{ repeat: Infinity, duration: 2 }}
//               />
//               <span>
//                 {healthCheck.isLoading
//                   ? "Checking..."
//                   : healthCheck.data
//                   ? "Online"
//                   : "Offline"}
//               </span>
//             </div>
//           </div>
//           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//             <Button asChild size="lg">
//               <a href="mailto:contact@burio16.com">Get in Touch</a>
//             </Button>
//           </motion.div>
//         </motion.div>
//       </div>
//     </motion.section>
//   );
// }

function HomeComponent() {
	return (
		<main className="min-h-screen">
			<Hero />
			<Favorites />
		</main>
	);
}
