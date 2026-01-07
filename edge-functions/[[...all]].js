export default async function middleware(request) {
  if (request.headers.get("checkmode")) {
    return new Response("", { status: 500 });
  }

  const url = new URL(request.url);
  if (url.pathname === "/") {
    return new Response("", { status: 500 });
  }

  return fetch(request);
}