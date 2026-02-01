interface Env {
	SERVER_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const { params, env } = context;
	const id = params.id as string;

	// serverのOGP画像エンドポイントにプロキシ
	const ogpUrl = `${env.SERVER_URL}/ogp/${id}/og.png`;
	const response = await fetch(ogpUrl);

	return new Response(response.body, {
		status: response.status,
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
