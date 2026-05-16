import type { ReactNode } from "react";

type ContentLayoutProps = {
	children: ReactNode;
};

export const ContentLayout = ({ children }: ContentLayoutProps) => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			{children}
		</main>
	);
};
