import { assetStore, dataStore, json, jsonHeaders, readImageIndex, writeImageIndex } from "./_shared.js";

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method === "GET") return json({ images: await readImageIndex() });
  if (request.method !== "DELETE") return json({ error: "Method not allowed" }, { status: 405 });

  const url = new URL(request.url);
  const name = String(url.searchParams.get("name") || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!name || !/\.(png|jpe?g|webp)$/i.test(name)) {
    return json({ ok: false, error: "Invalid image name" }, { status: 400 });
  }

  const images = await readImageIndex();
  const target = images.find((image) => image.name === name);
  const nextImages = images.filter((image) => image.name !== name);
  await assetStore().delete(`images/${name}`);
  if (target?.meta?.jobId) {
    await dataStore().delete(`jobs/${target.meta.jobId}.json`);
  }
  await writeImageIndex(nextImages);
  return json({ ok: true, deleted: name, images: nextImages });
}
