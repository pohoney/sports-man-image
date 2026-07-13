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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = String(value || "").replace(/^data:[^,]+,/, "").replace(/\s/g, "");
  const output = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean.replace(/=+$/, "")) {
    const index = chars.indexOf(char);
    if (index === -1) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(output);
}

function extensionFromMime(mime) {
  const clean = String(mime || "").toLowerCase();
  if (clean.includes("jpeg") || clean.includes("jpg")) return "jpg";
  if (clean.includes("webp")) return "webp";
  return "png";
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method === "GET") return json({ images: await readImageIndex() });
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const jobId = String(body.jobId || new Date().toISOString().replace(/[:.]/g, "-")).replace(/[^a-zA-Z0-9._-]/g, "");
      const filename = `${jobId}_01.${extensionFromMime(body.imageMime)}`;
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
    } catch (error) {
      return json({ ok: false, error: error.message || "Image upload failed" }, { status: 500 });
    }
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
