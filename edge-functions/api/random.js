export async function onRequestGet(context) {
	const { env } = context;
	const API_TOKEN = env.LSKY_TOKEN;

	const LSKY_API_URL = "https://im.tiwat.cn/api/v1/albums/6/random-image";
	const FALLBACK_IMAGE =
		"https://imoss.tiwat.cn/2025/12/14/f865399ae020306c54e0063e554bbca2259895991.png_b";

	const noCacheHeaders = {
		"Cache-Control": "no-store, no-cache, must-revalidate",
		Pragma: "no-cache",
		Expires: "0",
	};

	// Helper function to fetch and return image directly
	async function fetchImageDirectly(imageUrl) {
		try {
			const imageRes = await fetch(imageUrl);
			if (!imageRes.ok) {
				throw new Error(`Failed to fetch image: ${imageRes.status}`);
			}

			// Get content type from response or default to image
			const contentType = imageRes.headers.get("content-type") || "image/jpeg";
			const imageData = await imageRes.arrayBuffer();

			return new Response(imageData, {
				status: 200,
				headers: {
					...noCacheHeaders,
					"Content-Type": contentType,
					// Add CORS headers if needed
					"Access-Control-Allow-Origin": "*",
				},
			});
		} catch (error) {
			console.error("Failed to fetch image directly:", error);
			throw error;
		}
	}

	if (!API_TOKEN) {
		console.error("Missing LSKY_TOKEN environment variable");
		// Fallback: redirect to fallback image if direct fetch fails
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

		// Fetch and return image directly instead of redirecting
		// This allows fetchpriority="high" to work correctly for LCP optimization
		return await fetchImageDirectly(targetUrl);
	} catch (error) {
		console.error("Fetch Random Image Failed:", error);
		// Fallback: try to fetch fallback image directly, or redirect if that fails
		try {
			return await fetchImageDirectly(FALLBACK_IMAGE);
		} catch (fallbackError) {
			console.error("Failed to fetch fallback image:", fallbackError);
			return Response.redirect(FALLBACK_IMAGE, 307, {
				headers: noCacheHeaders,
			});
		}
	}
}
