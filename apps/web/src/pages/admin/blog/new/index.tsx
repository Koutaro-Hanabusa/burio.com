import { ContentLayout } from "@/components/layouts/ContentLayout";
import { AdminBlogForm } from "@/features/blog/components/AdminBlogForm";

export default function NewBlogPage() {
	return (
		<ContentLayout>
			<AdminBlogForm mode="new" headingText="新しい記事を作成" />
		</ContentLayout>
	);
}
