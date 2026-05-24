import type React from "react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

type SetContent = React.Dispatch<React.SetStateAction<string>>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch(`${SERVER_URL}/upload/image`, {
		method: "POST",
		body: formData,
		credentials: "include",
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: "Upload failed" }));
		throw new Error(err.error || "Upload failed");
	}

	const data = await res.json();
	// URLがR2の相対パスの場合、サーバーURLを付与
	const url = data.url.startsWith("/") ? `${SERVER_URL}${data.url}` : data.url;
	return url;
}

function insertTextAtCursor(
	textarea: HTMLTextAreaElement,
	text: string,
	setContent: SetContent,
) {
	const { selectionStart, selectionEnd, value } = textarea;
	const newValue =
		value.substring(0, selectionStart) + text + value.substring(selectionEnd);
	setContent(newValue);

	// カーソル位置を挿入テキストの末尾に移動
	requestAnimationFrame(() => {
		textarea.selectionStart = selectionStart + text.length;
		textarea.selectionEnd = selectionStart + text.length;
		textarea.focus();
	});
}

export function useImageUpload(setContent: SetContent) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleFiles = useCallback(
		async (files: FileList | File[], textarea: HTMLTextAreaElement) => {
			const imageFiles = Array.from(files).filter((f) =>
				f.type.startsWith("image/"),
			);

			if (imageFiles.length === 0) return;

			for (const file of imageFiles) {
				const placeholder = `![Uploading ${file.name}...]()`;
				insertTextAtCursor(textarea, placeholder, setContent);

				try {
					const url = await uploadImage(file);
					const markdown = `![${file.name}](${url})`;

					// placeholderを実際のmarkdownに置換
					setContent((prev) => prev.replace(placeholder, markdown));
				} catch (error) {
					toast.error(
						`画像のアップロードに失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
					// placeholderを削除
					setContent((prev) => prev.replace(placeholder, ""));
				}
			}
		},
		[setContent],
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			const imageItems = Array.from(items).filter((item) =>
				item.type.startsWith("image/"),
			);

			if (imageItems.length === 0) return;

			e.preventDefault();
			const files = imageItems
				.map((item) => item.getAsFile())
				.filter((f): f is File => f !== null);

			if (files.length > 0) {
				handleFiles(files, e.currentTarget);
			}
		},
		[handleFiles],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent<HTMLTextAreaElement>) => {
			e.preventDefault();
			e.stopPropagation();
		},
		[],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLTextAreaElement>) => {
			e.preventDefault();
			e.stopPropagation();

			const files = e.dataTransfer?.files;
			if (files && files.length > 0) {
				handleFiles(files, e.currentTarget);
			}
		},
		[handleFiles],
	);

	return {
		textareaRef,
		textareaProps: {
			ref: textareaRef,
			onPaste: handlePaste,
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		},
	};
}
