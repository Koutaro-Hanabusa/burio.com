import type { RefObject } from "react";

type BlogPreviewProps = {
	title: string;
	excerpt: string;
	coverImage: string;
	htmlContent: string;
	tags: string;
	previewRef: RefObject<HTMLDivElement | null>;
};

export function BlogPreview({
	title,
	excerpt,
	coverImage,
	htmlContent,
	tags,
	previewRef,
}: BlogPreviewProps) {
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h2 className="mb-4 font-bold text-2xl">{title || "タイトル未設定"}</h2>
				{excerpt && <p className="mb-4 text-muted-foreground">{excerpt}</p>}
				{coverImage && (
					<img
						src={coverImage}
						alt={title}
						className="mb-6 h-64 w-full rounded-lg object-cover"
					/>
				)}
				<div
					ref={previewRef}
					className="prose prose-lg dark:prose-invert max-w-none"
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
				{tags && (
					<div className="mt-6 flex flex-wrap gap-2">
						{tags.split(",").map((tag) => {
							const trimmedTag = tag.trim();
							return (
								<span
									key={trimmedTag}
									className="rounded-full bg-accent/20 px-3 py-1 text-accent-foreground text-sm"
								>
									{trimmedTag}
								</span>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
