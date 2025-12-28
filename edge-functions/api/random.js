export async function onRequestGet(context) {
  const { env } = context;
  const API_TOKEN = env.LSKY_TOKEN;

  const LSKY_API_URL = "https://im.tiwat.cn/api/v1/albums/6/random-image";
  const FALLBACK_IMAGE =
    "https://imoss.tiwat.cn/2025/12/14/f865399ae020306c54e0063e554bbca2259895991.png_b";

  const cacheHeaders = {
    "Cache-Control":
      "public, max-age=0, s-maxage=10, stale-while-revalidate=30",
  };

  if (!API_TOKEN) {
    return Response.redirect(FALLBACK_IMAGE, 307, {
      headers: cacheHeaders,
    });
  }

  try {
    const res = await fetch(`${LSKY_API_URL}?format=url`, {
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
      },
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const targetUrl = (await res.text()).trim();

    if (!targetUrl.startsWith("http")) {
      throw new Error("Invalid URL");
    }

    return Response.redirect(targetUrl, 307, {
      headers: cacheHeaders,
    });
  } catch (e) {
    return Response.redirect(FALLBACK_IMAGE, 307, {
      headers: cacheHeaders,
    });
  }
}
