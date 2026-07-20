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

function extensionFromBytes(bytes, mime) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "webp";
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
      let bytes;
      let filename = String(body.imageName || "").replace(/[^a-zA-Z0-9._-]/g, "");
      let imageSize = Number(body.imageSize || 0);
      if (filename) {
        if (!/\.(png|jpe?g|webp)$/i.test(filename)) {
          return json({ ok: false, error: "Invalid image name" }, { status: 400 });
        }
        if (!Number.isFinite(imageSize) || imageSize < 1024) {
          return json({ ok: false, error: "Image payload is too small to be a generated result" }, { status: 422 });
        }
      } else if (body.imageBase64) {
        bytes = bytesFromBase64(body.imageBase64);
      } else if (body.imageUrl) {
        bytes = await fetchImageBytesFromUrl(body.imageUrl);
      } else {
        return json({ ok: false, error: "Missing imageName, imageBase64 or imageUrl" }, { status: 400 });
      }
      if (bytes && (bytes.byteLength || 0) < 1024) {
        return json({ ok: false, error: "Image payload is too small to be a generated result" }, { status: 422 });
      }
      if (!filename) {
        filename = `${jobId}_01.${extensionFromBytes(bytes, body.imageMime)}`;
        imageSize = bytes.byteLength || 0;
        await assetStore().set(`images/${filename}`, bytes);
      }
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
        size: imageSize,
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

  try {
    const images = await readImageIndex();
    const target = images.find((image) => image.name === name);
    const nextImages = images.filter((image) => image.name !== name);
    await writeImageIndex(nextImages);

    const errors = [];
    try {
      await assetStore().delete(`images/${name}`);
    } catch (error) {
      errors.push(`image blob: ${error.message || error}`);
    }
    if (target?.meta?.jobId) {
      try {
        await dataStore().delete(`jobs/${target.meta.jobId}.json`);
      } catch (error) {
        errors.push(`job meta: ${error.message || error}`);
      }
    }

    if (errors.length) {
      return json({ ok: false, deleted: name, images: nextImages, error: errors.join("; ") }, { status: 207 });
    }
    return json({ ok: true, deleted: name, images: nextImages });
  } catch (error) {
    return json({ ok: false, error: error.message || "Image delete failed" }, { status: 500 });
  }
}
