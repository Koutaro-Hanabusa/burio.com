export function getServerUrl(): string {
	const url = import.meta.env.VITE_SERVER_URL;
	if (!url) {
		throw new Error("VITE_SERVER_URL is not defined");
	}
	return url;
}
