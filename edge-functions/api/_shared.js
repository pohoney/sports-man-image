import { getStore } from "@edgeone/pages-blob";

export const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

export const defaultSettings = {
  provider: "custom",
  custom: {
    endpoint: "https://api.openai.com/v1/images/generations",
    apiKey: "",
    model: "gpt-image-1",
    size: "1024x1536",
    mode: "openai-compatible"
  }
};

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...jsonHeaders, ...(init.headers || {}) }
  });
}

export function dataStore() {
  return getStore("sports-man-data");
}

export function assetStore() {
  return getStore("sports-man-assets");
}

export async function readSettings({ includeKey = false } = {}) {
  const envApiKey = globalThis.SPORTS_MAN_API_KEY || globalThis.OPENAI_API_KEY || "";
  const saved = await dataStore().get("settings/api.json", {
    type: "json",
    consistency: "strong"
  });
  const merged = {
    ...defaultSettings,
    ...(saved || {}),
    custom: { ...defaultSettings.custom, ...((saved || {}).custom || {}) }
  };
  if (includeKey && !merged.custom.apiKey && envApiKey) {
    merged.custom.apiKey = envApiKey;
  }
  if (includeKey) return merged;
  return {
    ...merged,
    custom: {
      ...merged.custom,
      apiKey: "",
      apiKeySet: Boolean(merged.custom.apiKey || envApiKey)
    }
  };
}

export async function saveSettings(next) {
  const current = await readSettings({ includeKey: true });
  const custom = { ...current.custom, ...(next.custom || {}) };
  if (!Object.prototype.hasOwnProperty.call(next.custom || {}, "apiKey") || next.custom.apiKey === "") {
    custom.apiKey = current.custom.apiKey;
  }
  const provider = next.provider === "codex" ? "custom" : next.provider || current.provider || "custom";
  const saved = { provider, custom };
  await dataStore().setJSON("settings/api.json", saved);
  return readSettings();
}

export function imageFromResponsePayload(payload) {
  const first = Array.isArray(payload?.data) ? payload.data[0] : payload;
  const b64 =
    first?.b64_json ||
    first?.image_base64 ||
    first?.base64 ||
    payload?.b64_json ||
    payload?.image_base64 ||
    payload?.base64;
  const url = first?.url || payload?.url || payload?.image_url;
  return { b64, url };
}

export async function fetchImageBytesFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image URL download failed: ${response.status}`);
  return response.arrayBuffer();
}

export function contentTypeFromName(name) {
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "image/png";
}

export async function readImageIndex() {
  return (
    (await dataStore().get("images/index.json", {
      type: "json",
      consistency: "strong"
    })) || []
  );
}

export async function writeImageIndex(images) {
  await dataStore().setJSON("images/index.json", images);
}

export function metaFromBody({ jobId, prompt, body, provider }) {
  return {
    jobId,
    createdAt: new Date().toISOString(),
    provider,
    prompt,
    style: body.summary?.style || body.state?.style?.label || "",
    sport: body.summary?.sport || body.state?.selected?.sport || "",
    dimensions: body.summary?.dimensions || {},
    summary: body.summary || null
  };
}
