export async function onRequest({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const referer = request.headers.get('referer') || '';
  const viewKey = `view_${id}`;

  if (!referer.startsWith('https://tiwat.cn')) {
    let count = 0;
    try {
      const v = await blog.get(viewKey);
      count = Number(v) || 0;
    } catch (e) {
      console.error('[KV] get viewKey failed:', e);
      count = 0;
    }
    return new Response(JSON.stringify({ visitCount: count }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  let count = 0;
  try {
    const v = await blog.get(viewKey);
    count = Number(v) || 0;
    count += 1;
    await blog.put(viewKey, String(count));
  } catch (e) {
    console.error('[KV] update viewKey failed:', e);
  }

  return new Response(JSON.stringify({ visitCount: count }), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': 'https://tiwat.cn',
    },
  });
}
