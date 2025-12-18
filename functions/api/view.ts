export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  try {
    const KV = env.blog;
    const key = `views:${slug}`;
    let current = await KV.get(key);
    let count = current ? parseInt(current, 10) : 0;

    count++;
    await KV.put(key, count.toString());

    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "KV operation failed" }), { status: 500 });
  }
}
