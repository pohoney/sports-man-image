import { assetStore, json, jsonHeaders } from "./_shared.js";

function extensionFromMime(mime) {
  const clean = String(mime || "").toLowerCase();
  if (clean.includes("jpeg") || clean.includes("jpg")) return "jpg";
  if (clean.includes("webp")) return "webp";
  return "png";
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  try {
    const body = await request.json();
    const jobId = String(body.jobId || new Date().toISOString().replace(/[:.]/g, "-")).replace(/[^a-zA-Z0-9._-]/g, "");
    const imageSize = Number(body.imageSize || 0);
    if (!jobId) return json({ ok: false, error: "Missing jobId" }, { status: 400 });
    if (!Number.isFinite(imageSize) || imageSize < 1024) {
      return json({ ok: false, error: "Image payload is too small to be a generated result" }, { status: 422 });
    }

    const imageMime = String(body.imageMime || "image/png").split(";")[0] || "image/png";
    const filename = `${jobId}_01.${extensionFromMime(imageMime)}`;
    const upload = await assetStore().createUploadUrl(`images/${filename}`, {
      contentType: imageMime,
      expireSeconds: 600
    });

    return json({
      ok: true,
      jobId,
      name: filename,
      key: upload.key,
      uploadUrl: upload.url,
      expiresAt: upload.expiresAt,
      url: `/api/image?name=${encodeURIComponent(filename)}`,
      downloadUrl: `/api/download?name=${encodeURIComponent(filename)}`
    });
  } catch (error) {
    return json({ ok: false, error: error.message || "Upload URL creation failed" }, { status: 500 });
  }
}
