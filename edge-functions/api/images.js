import { json, jsonHeaders, readImageIndex } from "./_shared.js";

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "GET") return json({ error: "Method not allowed" }, { status: 405 });
  return json({ images: await readImageIndex() });
}
