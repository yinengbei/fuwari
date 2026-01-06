export async function onRequest(context) {
	const { request, env } = context;
	
	// Only allow GET requests
	if (request.method !== "GET") {
		return new Response("Method Not Allowed", { status: 405 });
	}

	const API_TOKEN = env.LSKY_TOKEN;

	const LSKY_API_URL = "https://im.tiwat.cn/api/v1/albums/6/random-image";
	const FALLBACK_IMAGE =
		"https://imoss.tiwat.cn/2025/12/14/f865399ae020306c54e0063e554bbca2259895991.png_b";

	const noCacheHeaders = {
		"Cache-Control": "no-store, no-cache, must-revalidate",
		Pragma: "no-cache",
		Expires: "0",
	};

	if (!API_TOKEN) {
		console.error("Missing LSKY_TOKEN environment variable");
		return Response.redirect(FALLBACK_IMAGE, 307, {
			headers: noCacheHeaders,
		});
	}

	try {
		const res = await fetch(`${LSKY_API_URL}?format=url`, {
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				Accept: "application/json",
			},
		});

		if (!res.ok) {
			throw new Error(`API Error: ${res.status}`);
		}

		const targetUrl = (await res.text()).trim();

		if (!targetUrl.startsWith("http")) {
			throw new Error("Invalid URL received");
		}

		// Use 307 redirect to avoid fetching image on every request
		// Browser will cache the redirect, reducing server load
		return Response.redirect(targetUrl, 307, {
			headers: noCacheHeaders,
		});
	} catch (error) {
		console.error("Fetch Random Image Failed:", error);
		// Fallback: redirect to fallback image
		return Response.redirect(FALLBACK_IMAGE, 307, {
			headers: noCacheHeaders,
		});
	}
}
