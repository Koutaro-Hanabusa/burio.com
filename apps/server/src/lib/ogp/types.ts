export interface BlogPost {
	id: number;
	title: string;
	excerpt: string | null;
	createdAt: string;
	tags: string | null;
	published: number;
}

export interface OgpEnv {
	R2_PUBLIC_URL: string;
	PAGES_URL: string;
}
