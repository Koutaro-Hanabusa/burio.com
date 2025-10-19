import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	cardHoverVariants,
	fadeInUpVariants,
	fadeInVariants,
	getStaggerDelay,
	smoothTransition,
} from "@/constants/animations";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { formatDate } from "@/utils/date";
import { trpc } from "@/utils/trpc";

const BLOG_POST_LIMIT = 3;

interface BlogPostProps {
	slug: string;
	title: string;
	excerpt?: string | null;
	createdAt: Date | string;
	views: number;
	index: number;
}

function BlogPost({
	slug,
	title,
	excerpt,
	createdAt,
	views,
	index,
}: BlogPostProps) {
	return (
		<motion.article
			className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
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
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
				<h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
					<Link to={`/blog/${slug}`}>{title}</Link>
				</h3>
				<time className="text-sm text-muted-foreground">
					{formatDate(createdAt)}
				</time>
			</div>
			{excerpt && (
				<p className="text-muted-foreground leading-relaxed">{excerpt}</p>
			)}
			{views > 0 && (
				<div className="mt-2 text-sm text-muted-foreground">{views} views</div>
			)}
		</motion.article>
	);
}

function BlogHeader({ isAdmin }: { isAdmin: boolean }) {
	return (
		<div className="flex items-center justify-between mb-12">
			<motion.h2
				className="text-3xl md:text-4xl font-bold text-balance"
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
	);
}

function BlogLoading() {
	return (
		<motion.section
			className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30"
			initial="hidden"
			animate="visible"
			variants={fadeInVariants}
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

export function Blog() {
	const {
		data: posts,
		isLoading,
		error,
	} = trpc.blog.getAll.useQuery({
		limit: BLOG_POST_LIMIT,
		published: true,
	});

	const { isAdmin } = useAdminAccess();

	if (isLoading) {
		return <BlogLoading />;
	}

	if (error || !posts || posts.length === 0) {
		return null;
	}

	return (
		<motion.section
			className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30"
			initial="hidden"
			whileInView="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
			viewport={{ once: true }}
		>
			<div className="max-w-4xl mx-auto">
				<BlogHeader isAdmin={isAdmin} />
				<div className="space-y-6">
					{posts.map((post, index) => (
						<BlogPost
							key={post.slug}
							slug={post.slug}
							title={post.title}
							excerpt={post.excerpt}
							createdAt={post.createdAt}
							views={post.views}
							index={index}
						/>
					))}
				</div>
			</div>
		</motion.section>
	);
}
