import { type RenderOptions, render } from "@testing-library/react";
import React, { type ReactElement } from "react";

// framer-motionのモック
export const mockFramerMotion = () => {
	return {
		motion: new Proxy(
			{},
			{
				get:
					(_target, prop) =>
					({ children, ...props }: any) => {
						// motion.divなどのコンポーネントを通常のHTML要素として扱う
						const Component = prop as keyof React.JSX.IntrinsicElements;
						return React.createElement(Component as string, props, children);
					},
			},
		),
	};
};

// カスタムレンダー関数
const customRender = (ui: ReactElement, options?: RenderOptions) =>
	render(ui, { ...options });

export * from "@testing-library/react";
export { customRender as render };
