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
	id: string;
	title: string;
	excerpt?: string | null;
	createdAt: Date | string;
	views: number;
	index: number;
}

function BlogPost({
	id,
	title,
	excerpt,
	createdAt,
	views,
	index,
}: BlogPostProps) {
	return (
		<motion.article
			className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
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
					<Link to={`/blog/${id}`}>{title}</Link>
				</h3>
				<time className="text-muted-foreground text-sm">
					{formatDate(createdAt)}
				</time>
			</div>
			{excerpt && (
				<p className="text-muted-foreground leading-relaxed">{excerpt}</p>
			)}
			{views > 0 && (
				<div className="mt-2 text-muted-foreground text-sm">{views} views</div>
			)}
		</motion.article>
	);
}

function BlogHeader({ isAdmin }: { isAdmin: boolean }) {
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
					to="/blog"
					className="font-medium text-primary transition-colors hover:text-primary/80"
				>
					すべて見る →
				</Link>
				{isAdmin && (
					<Link
						to="/admin"
						className="font-medium text-primary transition-colors hover:text-primary/80"
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
			className="bg-muted/30 px-6 py-20 md:px-12 lg:px-24"
			initial="hidden"
			animate="visible"
			variants={fadeInVariants}
		>
			<div className="mx-auto max-w-4xl">
				<h2 className="mb-12 font-bold text-3xl md:text-4xl">
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
			className="bg-muted/30 px-6 py-20 md:px-12 lg:px-24"
			initial="hidden"
			whileInView="visible"
			variants={fadeInVariants}
			transition={smoothTransition}
			viewport={{ once: true }}
		>
			<div className="mx-auto max-w-4xl">
				<BlogHeader isAdmin={isAdmin} />
				<div className="space-y-6">
					{posts.map((post, index) => (
						<BlogPost
							key={post.id}
							id={post.id}
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
