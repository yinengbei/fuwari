export function getBuildVersion(): string {
	if (import.meta.env.BUILD_VERSION) {
		return import.meta.env.BUILD_VERSION;
	}
	
	if (import.meta.env.DEV) {
		return Date.now().toString();
	}
	
	return "";
}
export function addVersionToUrl(url: string, version?: string): string {
	const v = version || getBuildVersion();
	if (!v) return url;
	
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}v=${v}`;
}
