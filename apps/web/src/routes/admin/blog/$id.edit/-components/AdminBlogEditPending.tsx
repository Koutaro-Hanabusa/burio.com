import { Skeleton } from "@/components/ui/skeleton";

export const AdminBlogEditPending = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-4xl space-y-6">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-10 w-32" />
			</div>
		</main>
	);
};
