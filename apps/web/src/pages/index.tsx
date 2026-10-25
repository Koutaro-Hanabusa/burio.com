import { Home } from "@/features/home/components/Home";
import type { Props } from "./index.server";

export default function HomePage({ posts, isAdmin }: Props) {
	return <Home posts={posts} isAdmin={isAdmin} />;
}
