import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { useRenderedMarkdown } from "./use-rendered-markdown";

function Preview({ content }: { content: string | null }) {
	const { htmlContent, contentRef } = useRenderedMarkdown(content);
	return (
		<div
			ref={contentRef}
			data-testid="preview"
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	);
}

describe("useRenderedMarkdown", () => {
	it("keeps server HTML empty for hydration", () => {
		expect(renderToString(<Preview content="**server content**" />)).toBe(
			'<div data-testid="preview"></div>',
		);
	});

	it("hydrates sanitized content and follows changes and null", async () => {
		const initialContent = "**safe** <script>alert(1)</script>";
		const container = document.createElement("div");
		container.innerHTML = renderToString(<Preview content={initialContent} />);
		document.body.appendChild(container);
		const { rerender, unmount } = render(<Preview content={initialContent} />, {
			container,
			hydrate: true,
		});
		const preview = screen.getByTestId("preview");
		await waitFor(() =>
			expect(preview.innerHTML).toContain("<strong>safe</strong>"),
		);
		expect(preview.innerHTML).not.toContain("<script>");

		rerender(<Preview content="*changed*" />);
		await waitFor(() =>
			expect(preview.innerHTML).toContain("<em>changed</em>"),
		);
		expect(preview.innerHTML).not.toContain("safe");

		rerender(<Preview content={null} />);
		await waitFor(() => expect(preview.innerHTML).toBe(""));
		unmount();
		container.remove();
	});
});
