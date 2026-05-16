// Workers env binding に切り替える分岐は Phase 4 で追加する
export function getServerUrl(): string {
	const url = import.meta.env.VITE_SERVER_URL;
	if (!url) {
		throw new Error("VITE_SERVER_URL is not defined");
	}
	return url;
}
