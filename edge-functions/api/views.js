export async function onRequest({ request, params, env }) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: "Missing 'id' parameter" }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
        });
    }

    const kvKey = `view_${id}`;
    let count = await blog.get(kvKey);
    count = Number(count) + 1;
    
    await blog.put(kvKey, String(count));

    return new Response(JSON.stringify({ visitCount: count }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
}