export default async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const checkmode = request.headers.get("checkmode");
  if (checkmode) {
    return new Response("", { status: 500 });
  }
  if (pathname === "/") {
    return new Response("", { status: 500 });
  }
  return fetch(request);
}
