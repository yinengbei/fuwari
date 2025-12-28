export async function onRequest({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const ua = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || '';

  const viewKey = `view_${id}`;
  const rateKey = `rate_${ip}_${ua}_${id}`;

  let count = 0;
  let visited = true;

  try {
    const v = await blog.get(viewKey);
    count = Number(v) || 0;
  } catch (e) {
    console.error('[KV] get viewKey failed:', e);
    count = 0;
  }

  if (!referer.startsWith('https://tiwat.cn')) {
    return new Response(JSON.stringify({ visitCount: count }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    visited = !!(await blog.get(rateKey));
  } catch (e) {
    console.error('[KV] get rateKey failed:', e);
    visited = true;
  }

  if (!visited) {
    count += 1;
    try {
      await blog.put(viewKey, String(count));
      await blog.put(rateKey, '1', { expirationTtl: 30 });
    } catch (e) {
      console.error('[KV] put failed:', e);
    }
  }

  return new Response(JSON.stringify({ visitCount: count }), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': 'https://tiwat.cn',
    },
  });
}
