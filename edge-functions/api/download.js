import { assetStore, contentTypeFromName } from "./_shared.js";

export async function onRequest({ request }) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!name) return new Response("Missing image name", { status: 400 });

  const body = await assetStore().get(`images/${name}`, {
    type: "arrayBuffer",
    consistency: "eventual"
  });
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: {
      "content-type": contentTypeFromName(name),
      "content-disposition": `attachment; filename="${name.replaceAll('"', "")}"`,
      "cache-control": "no-store"
    }
  });
}
