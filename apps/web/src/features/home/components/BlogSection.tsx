import { Link } from "@void/react";
import { motion } from "framer-motion";
import {
	cardHoverVariants,
	fadeInUpVariants,
	fadeInVariants,
	getStaggerDelay,
	smoothTransition,
} from "@/constants/animations";
import type { BlogPostListItem } from "@/features/blog/types";
import { formatDate } from "@/utils/date";

interface BlogPostProps {
	id: number;
	title: string;
	excerpt?: string | null;
	createdAt: Date | string | null;
	views: number | null;
	index: number;
}

const BlogPost = ({
	id,
	title,
	excerpt,
	createdAt,
	views,
	index,
}: BlogPostProps) => {
	return (
		<Link href={`/blog/${id}`} className="block">
			<motion.article
				className="group cursor-pointer rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
				initial="hidden"
				whileInView="visible"
				whileHover="hover"
				variants={{
					hidden: { opacity: 0, y: 20 },
					visible: { opacity: 1, y: 0 },
					...cardHoverVariants,
				}}
				transition={{ delay: getStaggerDelay(index), duration: 0.6 }}
				viewport={{ once: true }}
			>
				<div className="mb-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<h3 className="font-semibold text-xl transition-colors group-hover:text-primary">
						{title}
					</h3>
					<time className="text-muted-foreground text-sm">
						{createdAt ? formatDate(createdAt) : "N/A"}
					</time>
				</div>
				{excerpt && (
					<p className="text-muted-foreground leading-relaxed">{excerpt}</p>
				)}
				{views != null && views > 0 && (
					<div className="mt-2 text-muted-foreground text-sm">
						{views} views
					</div>
				)}
			</motion.article>
		</Link>
	);
};

const BlogHeader = ({ isAdmin }: { isAdmin: boolean }) => {
	return (
		<div className="mb-12 flex items-center justify-between">
			<motion.h2
				className="text-balance font-bold text-3xl md:text-4xl"
				initial="hidden"
				whileInView="visible"
				variants={fadeInUpVariants}
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
					href="/blog"
					className="font-medium text-primary transition-colors hover:text-primary/80"
				>
					すべて見る →
				</Link>
				{isAdmin && (
					<Link
						href="/admin"
						className="font-medium text-primary transition-colors hover:text-primary/80"
					>
						管理画面
					</Link>
				)}
			</motion.div>
		</div>
	);
};

export const BlogSection = ({
	posts,
	isAdmin,
}: {
	posts: BlogPostListItem[];
	isAdmin: boolean;
}) => {
	return (
		<motion.section
			className="bg-muted/30 px-6 py-20 md:px-12 lg:px-24"
			initial="hidden"
			whileInView="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
			viewport={{ once: true }}
		>
			<div className="mx-auto max-w-4xl">
				<BlogHeader isAdmin={isAdmin} />
				{posts.length === 0 ? (
					<div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
						まだブログ記事がありません
					</div>
				) : (
					<div className="space-y-6">
						{posts.map((post, index) => (
							<BlogPost
								key={post.id}
								id={post.id}
								title={post.title}
								excerpt={post.excerpt}
								createdAt={post.createdAt ?? new Date()}
								views={post.views ?? 0}
								index={index}
							/>
						))}
					</div>
				)}
			</div>
		</motion.section>
	);
};
