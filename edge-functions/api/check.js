import { json, jsonHeaders, readSettings } from "./_shared.js";

const CHECK_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function openAiModelUrl(settings) {
  const model = String(settings.custom.model || "").trim() || "gpt-image-1";
  const endpoint = String(settings.custom.endpoint || "");
  if (!endpoint.includes("api.openai.com")) return null;
  return `https://api.openai.com/v1/models/${encodeURIComponent(model)}`;
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "GET") return json({ error: "Method not allowed" }, { status: 405 });

  try {
    const settings = await readSettings({ includeKey: true });
    if (!settings.custom.apiKey) {
      return json({ ok: false, error: "API Key 未配置。" }, { status: 400 });
    }

    const modelUrl = openAiModelUrl(settings);
    if (!modelUrl) {
      return json({
        ok: true,
        provider: "custom",
        message: "当前不是 OpenAI 官方 endpoint，只能确认 API Key 已保存，无法无成本验证模型访问。"
      });
    }

    const response = await fetchWithTimeout(modelUrl, {
      headers: { authorization: `Bearer ${settings.custom.apiKey}` }
    });
    const text = await response.text();

    if (response.status === 401) {
      return json({ ok: false, status: 401, error: "API Key 认证失败。请重新填写 sk- 或 sk-proj- 开头的有效 OpenAI API Key。" }, { status: 401 });
    }
    if (!response.ok) {
      return json({
        ok: false,
        status: response.status,
        error: text.slice(0, 600) || "OpenAI 模型检查失败。"
      }, { status: 400 });
    }

    return json({
      ok: true,
      status: response.status,
      model: settings.custom.model,
      size: settings.custom.size,
      message: "API Key 认证通过，模型可访问。"
    });
  } catch (error) {
    return json({ ok: false, error: error.name === "AbortError" ? "API 检查超时。" : error.message }, { status: 500 });
  }
}
