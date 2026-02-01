export interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: Date | null;
	tags: string | null;
	published: number | null;
}

export interface OgpEnv {
	R2_PUBLIC_URL: string;
	PAGES_URL: string;
}
