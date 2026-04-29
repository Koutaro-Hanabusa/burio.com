import { RiArrowLeftLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogPostPending = () => {
	return (
		<main className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
			<div className="mx-auto max-w-4xl">
				<Button variant="ghost" className="mb-6" disabled>
					<RiArrowLeftLine className="mr-2 h-4 w-4" />
					Back to Blog
				</Button>
				<div className="space-y-6">
					<Skeleton className="h-12 w-3/4" />
					<div className="flex gap-4">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-20" />
					</div>
					<Skeleton className="h-64 w-full" />
					<div className="space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-4/6" />
					</div>
				</div>
			</div>
		</main>
	);
};
