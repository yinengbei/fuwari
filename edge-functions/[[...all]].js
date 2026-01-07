export default async function onRequest(context) {
  const { request } = context;
  const checkmode = request.headers.get("checkmode");

  if (checkmode) {
    return new Response("", { status: 500 });
  }

  return fetch(request);
}
