import {
  assetStore,
  fetchImageBytesFromUrl,
  imageFromResponsePayload,
  json,
  jsonHeaders,
  metaFromBody,
  normalizeSettings,
  readImageIndex,
  writeJob,
  readSettings,
  writeImageIndex
} from "./_shared.js";

const GENERATION_TIMEOUT_MS = 135000;

async function generateImage({ prompt, settings }) {
  const endpoint = settings.custom.endpoint.trim();
  if (!endpoint) throw new Error("Custom API endpoint is empty.");

  const headers = {
    "content-type": "application/json",
    "http-referer": "https://sports-man-image.edgeone.dev",
    "x-openrouter-title": "Sports Man Image"
  };
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
      throw new Error("API Key 认证失败。OpenRouter 请填写 sk-or-v1- 开头的完整 key；OpenAI 请填写 sk- 或 sk-proj- 开头的完整 key。不要填写 Project ID、Organization ID 或复制不完整的 key。");
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

async function runGenerationJob({ jobId, prompt, body, settings }) {
  try {
    await writeJob(jobId, {
      status: "running",
      provider: settings.provider || "openrouter",
      message: "Image generation is running.",
      startedAt: new Date().toISOString()
    });

    const filename = `${jobId}_01.png`;
    const key = `images/${filename}`;
    const bytes = await generateImage({ prompt, settings });
    await assetStore().set(key, bytes);

    const meta = metaFromBody({ jobId, prompt, body, provider: settings.provider || "openrouter" });
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
    await writeJob(jobId, {
      status: "done",
      provider: settings.provider || "openrouter",
      images: [image],
      finishedAt: new Date().toISOString()
    });
  } catch (error) {
    await writeJob(jobId, {
      status: "error",
      provider: settings.provider || "openrouter",
      error: error.message || "Generation failed",
      finishedAt: new Date().toISOString()
    });
  }
}

function startGenerationJob(args) {
  runGenerationJob(args).catch(async (error) => {
    try {
      await writeJob(args.jobId, {
        status: "error",
        provider: args.settings.provider || "openrouter",
        error: error.message || "Generation failed",
        finishedAt: new Date().toISOString()
      });
    } catch {
      // The request has already returned; avoid surfacing background cleanup failures.
    }
  });
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  try {
    const body = await request.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) return json({ error: "Prompt is required" }, { status: 400 });

    const savedSettings = await readSettings({ includeKey: true });
    const requestSettings = body.settings?.custom
      ? {
          ...savedSettings,
          ...body.settings,
          custom: { ...savedSettings.custom, ...body.settings.custom }
        }
      : savedSettings;
    const settings = normalizeSettings(requestSettings);
    if (!settings.custom.apiKey) {
      return json({ error: "API Key is not configured. Open Image API settings and save an API Key first." }, { status: 400 });
    }

    const jobId = new Date().toISOString().replace(/[:.]/g, "-");
    await writeJob(jobId, {
      status: "queued",
      provider: settings.provider || "openrouter",
      message: "Image generation job queued.",
      createdAt: new Date().toISOString()
    });

    startGenerationJob({ jobId, prompt, body, settings });

    return json({ ok: true, jobId, status: "running", provider: settings.provider || "openrouter" }, { status: 202 });
  } catch (error) {
    return json({ ok: false, error: error.message || "Generation failed" }, { status: 500 });
  }
}
