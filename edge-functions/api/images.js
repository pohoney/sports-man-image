import {
  assetStore,
  dataStore,
  fetchImageBytesFromUrl,
  json,
  jsonHeaders,
  metaFromBody,
  readImageIndex,
  writeImageIndex
} from "./_shared.js";

function bytesFromBase64(value) {
  return Uint8Array.from(atob(String(value || "")), (char) => char.charCodeAt(0)).buffer;
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method === "GET") return json({ images: await readImageIndex() });
  if (request.method === "POST") {
    const body = await request.json();
    const jobId = String(body.jobId || new Date().toISOString().replace(/[:.]/g, "-")).replace(/[^a-zA-Z0-9._-]/g, "");
    const filename = `${jobId}_01.png`;
    let bytes;
    if (body.imageBase64) {
      bytes = bytesFromBase64(body.imageBase64);
    } else if (body.imageUrl) {
      bytes = await fetchImageBytesFromUrl(body.imageUrl);
    } else {
      return json({ ok: false, error: "Missing imageBase64 or imageUrl" }, { status: 400 });
    }

    await assetStore().set(`images/${filename}`, bytes);
    const meta = metaFromBody({
      jobId,
      prompt: String(body.prompt || ""),
      body,
      provider: body.provider || "openrouter-browser"
    });
    const image = {
      name: filename,
      url: `/api/image?name=${encodeURIComponent(filename)}`,
      downloadUrl: `/api/download?name=${encodeURIComponent(filename)}`,
      modified: Date.now(),
      size: bytes.byteLength || 0,
      meta
    };
    const images = [image, ...(await readImageIndex()).filter((item) => item.name !== filename)].slice(0, 80);
    await writeImageIndex(images);
    await dataStore().setJSON(`jobs/${jobId}.json`, {
      status: "done",
      provider: body.provider || "openrouter-browser",
      images: [image],
      finishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobId
    });
    return json({ ok: true, jobId, images: [image], gallery: images }, { status: 201 });
  }
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
