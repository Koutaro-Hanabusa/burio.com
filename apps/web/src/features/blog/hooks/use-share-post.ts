import { useState } from "react";
import { toast } from "sonner";

type ShareablePost = {
	title: string;
	excerpt?: string | null;
};

/**
 * ブログ詳細ページの「シェア / リンクコピー」操作をまとめたフック。
 * - navigator.share が使えればネイティブシェアを起動
 * - 使えない / 失敗した場合はクリップボードにコピー
 * - コピー直後 2 秒間 `copied` を true にしてアイコン切替に利用
 */
export const useSharePost = (post: ShareablePost) => {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			toast.success("リンクをコピーしました");
			setTimeout(() => setCopied(false), 2000);
		} catch (_err) {
			toast.error("コピーに失敗しました");
		}
	};

	const handleShare = async () => {
		const url = window.location.href;

		if (navigator.share) {
			try {
				await navigator.share({
					title: post.title,
					text: post.excerpt || "",
					url,
				});
			} catch (err) {
				console.error("Share failed:", err);
			}
		} else {
			await handleCopyLink();
		}
	};

	return { copied, handleShare, handleCopyLink };
};
