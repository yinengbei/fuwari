export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	const action = url.searchParams.get("action") || "increment";

	if (!id) {
		return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const referer = request.headers.get("referer") || "";
	const viewKey = `view_${id}`;

	// Get current count from KV via context.env
	let count = 0;
	try {
		// Assuming 'blog' is the KV namespace binding
		if (env.blog) {
			const v = await env.blog.get(viewKey);
			count = Number(v) || 0;
		}
	} catch (e) {
		console.error("[KV] get viewKey failed:", e);
		count = 0;
	}

	// If referer is not from the site, return count without incrementing
	if (!referer.startsWith("https://tiwat.cn")) {
		return new Response(JSON.stringify({ visitCount: count }), {
			headers: { "content-type": "application/json" },
		});
	}

	if (action === "increment") {
		try {
			count += 1;
			if (env.blog) {
				await env.blog.put(viewKey, String(count));
			}
		} catch (e) {
			console.error("[KV] update viewKey failed:", e);
		}
	}

	return new Response(JSON.stringify({ visitCount: count }), {
		headers: {
			"content-type": "application/json; charset=UTF-8",
			"Access-Control-Allow-Origin": "https://tiwat.cn",
		},
	});
}
