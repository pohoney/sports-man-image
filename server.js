import http from "node:http";
import { spawn } from "node:child_process";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const outputDir = path.join(__dirname, "output", "images");
const jobsDir = path.join(__dirname, "output", "jobs");
const settingsPath = path.join(__dirname, "output", "api-settings.json");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const activeJobs = new Map();

const defaultSettings = {
  provider: "openrouter",
  custom: {
    endpoint: "https://openrouter.ai/api/v1/images",
    apiKey: "",
    model: "google/gemini-3-pro-image",
    size: "1024x1536",
    mode: "openrouter-images"
  }
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function sendJson(res, status, value) {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readSettings({ includeKey = false } = {}) {
  const saved = await readJson(settingsPath, {});
  const merged = normalizeSettings({
    ...defaultSettings,
    ...saved,
    custom: { ...defaultSettings.custom, ...(saved.custom || {}) }
  });
  if (includeKey) return merged;
  return {
    ...merged,
    custom: {
      ...merged.custom,
      apiKey: "",
      apiKeySet: Boolean(merged.custom.apiKey)
    }
  };
}

async function saveSettings(next) {
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  const current = await readSettings({ includeKey: true });
  const custom = { ...current.custom, ...(next.custom || {}) };
  if (!Object.prototype.hasOwnProperty.call(next.custom || {}, "apiKey") || next.custom.apiKey === "") {
    custom.apiKey = current.custom.apiKey;
  }
  const saved = normalizeSettings({
    provider: next.provider === "codex" ? "openrouter" : next.provider || current.provider,
    custom
  });
  await fs.writeFile(settingsPath, JSON.stringify(saved, null, 2), "utf8");
  return readSettings();
}

function normalizeSettings(settings) {
  const normalized = {
    ...defaultSettings,
    ...(settings || {}),
    custom: {
      ...defaultSettings.custom,
      ...((settings || {}).custom || {})
    }
  };
  const isOpenRouter =
    normalized.provider === "openrouter" ||
    String(normalized.custom.apiKey || "").startsWith("sk-or-v1-") ||
    !String(normalized.custom.endpoint || "").trim() ||
    String(normalized.custom.endpoint || "").includes("api.openai.com/v1/images/generations") ||
    String(normalized.custom.endpoint || "").includes("openrouter.ai") ||
    normalized.custom.model === "gpt-image-1" ||
    String(normalized.custom.model || "").startsWith("google/gemini");
  if (isOpenRouter) {
    normalized.provider = "openrouter";
    normalized.custom.endpoint = defaultSettings.custom.endpoint;
    if (
      !normalized.custom.model ||
      normalized.custom.model === "gpt-image-1" ||
      normalized.custom.model.startsWith("openai/")
    ) {
      normalized.custom.model = defaultSettings.custom.model;
    }
    normalized.custom.size = normalized.custom.size || defaultSettings.custom.size;
    normalized.custom.mode = "openrouter-images";
  }
  return normalized;
}

function imageMetaPath(file) {
  return path.join(outputDir, `${file}.json`);
}

async function writeImageMeta(file, meta) {
  await fs.writeFile(imageMetaPath(file), JSON.stringify(meta, null, 2), "utf8");
}

async function listImages() {
  await fs.mkdir(outputDir, { recursive: true });
  const files = await fs.readdir(outputDir);
  const images = [];
  for (const file of files) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const fullPath = path.join(outputDir, file);
    const stat = await fs.stat(fullPath);
    const meta = await readJson(imageMetaPath(file), null);
    images.push({
      name: file,
      url: `/api/image?name=${encodeURIComponent(file)}`,
      downloadUrl: `/api/download?name=${encodeURIComponent(file)}`,
      modified: stat.mtimeMs,
      size: stat.size,
      meta
    });
  }
  return images.sort((a, b) => b.modified - a.modified);
}

async function deleteImage(name) {
  const file = path.basename(name || "");
  if (!file || !/\.(png|jpe?g|webp)$/i.test(file)) {
    return { ok: false, status: 400, error: "Invalid image name" };
  }
  const meta = await readJson(imageMetaPath(file), null);
  await fs.rm(path.join(outputDir, file), { force: true });
  await fs.rm(imageMetaPath(file), { force: true });
  if (meta?.jobId) {
    activeJobs.delete(meta.jobId);
    await fs.rm(path.join(jobsDir, `${meta.jobId}.prompt.txt`), { force: true });
    await fs.rm(path.join(jobsDir, `${meta.jobId}.result.json`), { force: true });
    await fs.rm(path.join(jobsDir, `${meta.jobId}.meta.json`), { force: true });
  }
  return { ok: true, deleted: file, images: await listImages() };
}

async function serveFile(res, filePath, downloadName = "") {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      "content-type": mime[ext] || "application/octet-stream",
      "content-length": stat.size,
      "cache-control": "no-store"
    };
    if (downloadName) {
      headers["content-disposition"] = `attachment; filename="${downloadName.replaceAll('"', "")}"`;
    }
    res.writeHead(200, headers);
    createReadStream(filePath).pipe(res);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

function metaFromBody({ jobId, prompt, body, settings }) {
  return {
    jobId,
    createdAt: new Date().toISOString(),
    provider: settings.provider,
    prompt,
    style: body.summary?.style || body.state?.style?.label || "",
    sport: body.summary?.sport || body.state?.selected?.sport || "",
    dimensions: body.summary?.dimensions || {},
    summary: body.summary || null
  };
}

async function writeResult(resultFile, result) {
  await fs.writeFile(resultFile, JSON.stringify(result, null, 2), "utf8");
}

async function fetchImageBytesFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image URL download failed: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function imageFromResponsePayload(payload) {
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

async function runCustomGeneration({ jobId, prompt, resultFile, settings, meta }) {
  activeJobs.set(jobId, {
    status: "running",
    jobId,
    startedAt: Date.now(),
    provider: "custom",
    message: "Custom image API is running."
  });

  try {
    const endpoint = settings.custom.endpoint.trim();
    if (!endpoint) throw new Error("Custom API endpoint is empty.");
    const headers = {
      "content-type": "application/json",
      "http-referer": "https://sports-man-image.edgeone.dev",
      "x-openrouter-title": "Sports Man Image"
    };
    if (settings.custom.apiKey) headers.authorization = `Bearer ${settings.custom.apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: settings.custom.model,
        prompt,
        n: 1,
        size: settings.custom.size,
        response_format: "b64_json"
      })
    });
    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401) {
        throw new Error("API Key 认证失败。OpenRouter 请填写 sk-or-v1- 开头的完整 key；OpenAI 请填写 sk- 或 sk-proj- 开头的完整 key。不要填写 Project ID、Organization ID 或复制不完整的 key。");
      }
      throw new Error(`Custom API failed: ${response.status} ${text.slice(0, 600)}`);
    }

    const contentType = response.headers.get("content-type") || "";
    let bytes;
    if (contentType.startsWith("image/")) {
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      const payload = await response.json();
      const parsed = imageFromResponsePayload(payload);
      if (parsed.b64) {
        bytes = Buffer.from(parsed.b64, "base64");
      } else if (parsed.url) {
        bytes = await fetchImageBytesFromUrl(parsed.url);
      } else {
        throw new Error("Custom API response did not include b64_json, base64, image_base64, image_url, or url.");
      }
    }

    const filename = `${jobId}_01.png`;
    await fs.writeFile(path.join(outputDir, filename), bytes);
    await writeImageMeta(filename, { ...meta, source: "custom-api" });
    const images = [{ name: filename, url: `/api/image?name=${encodeURIComponent(filename)}` }];
    const result = { ok: true, images };
    await writeResult(resultFile, result);
    activeJobs.set(jobId, {
      status: "done",
      jobId,
      provider: "custom",
      images,
      finishedAt: Date.now(),
      resultFile
    });
  } catch (error) {
    await writeResult(resultFile, { ok: false, error: error.message });
    activeJobs.set(jobId, {
      status: "error",
      jobId,
      provider: "custom",
      error: error.message,
      finishedAt: Date.now(),
      resultFile
    });
  }
}

function runCodexGeneration({ jobId, promptFile, resultFile, meta }) {
  activeJobs.set(jobId, {
    status: "running",
    jobId,
    startedAt: Date.now(),
    provider: "codex",
    resultFile,
    message: "Codex image generation is running."
  });
  const child = spawn(
    process.execPath,
    [
      path.join(__dirname, "scripts", "codex-imagegen.mjs"),
      "--prompt-file",
      promptFile,
      "--output-dir",
      outputDir,
      "--job-id",
      jobId,
      "--result-file",
      resultFile
    ],
    { cwd: __dirname, stdio: ["ignore", "pipe", "pipe"] }
  );

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const timeout = setTimeout(() => {
    child.kill("SIGTERM");
  }, 10 * 60 * 1000);

  child.on("close", async (code) => {
    clearTimeout(timeout);
    let result = null;
    try {
      result = JSON.parse(await fs.readFile(resultFile, "utf8"));
    } catch {
      result = null;
    }
    if (code !== 0 || !result?.ok) {
      activeJobs.set(jobId, {
        status: "error",
        jobId,
        provider: "codex",
        error: result?.error || "Generation command failed",
        stdout: stdout.slice(-4000),
        stderr: stderr.slice(-4000),
        finishedAt: Date.now(),
        resultFile
      });
      return;
    }
    for (const image of result.images || []) {
      await writeImageMeta(image.name, { ...meta, source: image.source || "codex-imagegen" });
    }
    activeJobs.set(jobId, {
      status: "done",
      jobId,
      provider: "codex",
      images: result.images || [],
      logs: result.logs || "",
      finishedAt: Date.now(),
      resultFile
    });
  });
}

async function generate(req, res) {
  const raw = await readBody(req);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
    return;
  }
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    sendJson(res, 400, { error: "Prompt is required" });
    return;
  }

  await fs.mkdir(jobsDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const savedSettings = await readSettings({ includeKey: true });
  const settings = normalizeSettings(
    body.settings?.custom
      ? {
          ...savedSettings,
          ...body.settings,
          custom: { ...savedSettings.custom, ...body.settings.custom }
        }
      : savedSettings
  );
  const jobId = new Date().toISOString().replace(/[:.]/g, "-");
  const promptFile = path.join(jobsDir, `${jobId}.prompt.txt`);
  const resultFile = path.join(jobsDir, `${jobId}.result.json`);
  const meta = metaFromBody({ jobId, prompt, body, settings });
  await fs.writeFile(promptFile, prompt, "utf8");
  await fs.writeFile(path.join(jobsDir, `${jobId}.meta.json`), JSON.stringify(meta, null, 2), "utf8");

  if (settings.provider !== "codex") {
    runCustomGeneration({ jobId, prompt, resultFile, settings, meta });
  } else {
    runCodexGeneration({ jobId, promptFile, resultFile, meta });
  }
  sendJson(res, 202, { ok: true, jobId, status: "running", provider: settings.provider });
}

async function jobStatus(jobId) {
  const cached = activeJobs.get(jobId);
  if (cached) {
    return {
      ...cached,
      gallery: cached.status === "done" ? await listImages() : undefined
    };
  }
  const resultFile = path.join(jobsDir, `${jobId}.result.json`);
  try {
    const result = JSON.parse(await fs.readFile(resultFile, "utf8"));
    if (result.ok) {
      return { status: "done", jobId, images: result.images || [], gallery: await listImages() };
    }
    return { status: "error", jobId, error: result.error || "Generation failed" };
  } catch {
    return { status: "unknown", jobId, error: "Job not found or still starting." };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/settings") {
      sendJson(res, 200, await readSettings());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/settings") {
      const raw = await readBody(req);
      sendJson(res, 200, await saveSettings(JSON.parse(raw)));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/images") {
      sendJson(res, 200, { images: await listImages() });
      return;
    }
    if (req.method === "DELETE" && url.pathname === "/api/images") {
      const result = await deleteImage(url.searchParams.get("name"));
      sendJson(res, result.status || 200, result);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/generate") {
      await generate(req, res);
      return;
    }
    if (req.method === "GET" && url.pathname.startsWith("/api/jobs/")) {
      const jobId = decodeURIComponent(url.pathname.replace("/api/jobs/", ""));
      sendJson(res, 200, await jobStatus(jobId));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/image") {
      const file = path.basename(url.searchParams.get("name") || "");
      await serveFile(res, path.join(outputDir, file));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/download") {
      const file = path.basename(url.searchParams.get("name") || "");
      await serveFile(res, path.join(outputDir, file), file);
      return;
    }
    let staticPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (staticPath.startsWith("public/")) staticPath = staticPath.slice("public/".length);
    const filePath = path.resolve(publicDir, staticPath);
    if (!filePath.startsWith(`${publicDir}${path.sep}`) && filePath !== publicDir) {
      sendJson(res, 403, { error: "Forbidden" });
      return;
    }
    await serveFile(res, filePath);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`sports-man web app: http://${host}:${port}`);
});
