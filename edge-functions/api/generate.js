import {
  assetStore,
  fetchImageBytesFromUrl,
  imageFromResponsePayload,
  json,
  jsonHeaders,
  metaFromBody,
  readImageIndex,
  readSettings,
  writeImageIndex
} from "./_shared.js";

const GENERATION_TIMEOUT_MS = 135000;

async function generateImage({ prompt, settings }) {
  const endpoint = settings.custom.endpoint.trim();
  if (!endpoint) throw new Error("Custom API endpoint is empty.");

  const headers = { "content-type": "application/json" };
  if (settings.custom.apiKey) headers.authorization = `Bearer ${settings.custom.apiKey}`;
  const model = String(settings.custom.model || "").trim();
  const requestBody = {
    model,
    prompt,
    n: 1,
    size: settings.custom.size
  };
  if (!model.startsWith("gpt-image")) {
    requestBody.response_format = "b64_json";
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("生图 API 响应超时。GPT Image 复杂 prompt 可能接近 2 分钟，请稍后重试，或先降低尺寸/质量后再生成。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("OpenAI API Key 认证失败。请确认填写的是有效的 API key，通常以 sk- 或 sk-proj- 开头；不要填写 Project ID、Organization ID 或被撤销/复制不完整的 key。");
    }
    throw new Error(`Custom API failed: ${response.status} ${text.slice(0, 600)}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) {
    return response.arrayBuffer();
  }

  const payload = await response.json();
  const parsed = imageFromResponsePayload(payload);
  if (parsed.b64) return Uint8Array.from(atob(parsed.b64), (char) => char.charCodeAt(0)).buffer;
  if (parsed.url) return fetchImageBytesFromUrl(parsed.url);
  throw new Error("Custom API response did not include b64_json, base64, image_base64, image_url, or url.");
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return json({ error: "Prompt is required" }, { status: 400 });

    const settings = await readSettings({ includeKey: true });
    if (!settings.custom.apiKey) {
      return json({ error: "API Key is not configured. Open Image API settings and save an API Key first." }, { status: 400 });
    }

    const jobId = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${jobId}_01.png`;
    const key = `images/${filename}`;
    const bytes = await generateImage({ prompt, settings });
    await assetStore().set(key, bytes);

    const meta = metaFromBody({ jobId, prompt, body, provider: "custom" });
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

    return json({ ok: true, jobId, status: "done", provider: "custom", images: [image], gallery: images }, { status: 200 });
  } catch (error) {
    return json({ ok: false, error: error.message || "Generation failed" }, { status: 500 });
  }
}
