import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";

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
						const Component = prop as keyof JSX.IntrinsicElements;
						return <Component {...props}>{children}</Component>;
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
