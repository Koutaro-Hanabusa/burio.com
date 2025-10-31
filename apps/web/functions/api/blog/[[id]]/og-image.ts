/**
 * Cloudflare Pages Function to proxy OGP image from server
 *
 * This proxies the OGP image from the Workers server through the
 * main domain (burio16.com) to improve Twitter compatibility.
 */

export const onRequest: PagesFunction = async (context) => {
	const { params } = context;
	const id = (params as { id: string }).id;

	const SERVER_URL = "https://burio-com-server.koutarouhanabusa.workers.dev";

	try {
		// Fetch the OGP image from the server
		const response = await fetch(`${SERVER_URL}/blog/${id}/og-image`);

		if (!response.ok) {
			return new Response("Image not found", { status: 404 });
		}

		// Return the image with appropriate headers
		return new Response(response.body, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("Error proxying OG image:", error);
		return new Response("Error generating image", { status: 500 });
	}
};
