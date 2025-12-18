export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const key = `views:${slug}`;
  let current = await env.blog.get(key);
  let count = current ? parseInt(current, 10) : 0;

  count++;
  await env.blog.put(key, count.toString());

  return new Response(JSON.stringify({ views: count }), {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
