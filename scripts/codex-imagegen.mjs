import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

function arg(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1] || fallback;
}

async function listGeneratedImages(root) {
  const found = [];
  async function walk(dir) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
        const stat = await fs.stat(full);
        found.push({ path: full, modified: stat.mtimeMs });
      }
    }
  }
  await walk(root);
  return found;
}

async function newestAfter(root, since) {
  const files = await listGeneratedImages(root);
  return files
    .filter((file) => file.modified >= since)
    .sort((a, b) => b.modified - a.modified);
}

async function main() {
  const promptFile = arg("--prompt-file");
  const outputDir = arg("--output-dir");
  const jobId = arg("--job-id", new Date().toISOString().replace(/[:.]/g, "-"));
  const resultFile = arg("--result-file");
  const generatedRoot = path.join(os.homedir(), ".codex", "generated_images");
  const bundledCodex = "/Applications/Codex.app/Contents/Resources/codex";
  const codexBin =
    process.env.CODEX_BIN ||
    (await fs
      .access(bundledCodex)
      .then(() => bundledCodex)
      .catch(() => "codex"));

  if (!promptFile || !outputDir || !resultFile) {
    throw new Error("Missing --prompt-file, --output-dir, or --result-file");
  }

  const prompt = await fs.readFile(promptFile, "utf8");
  await fs.mkdir(outputDir, { recursive: true });
  const startedAt = Date.now();

  const instruction = [
    "Use $imagegen to generate exactly one image from this prompt.",
    "Do not ask follow-up questions.",
    "Leave the original generated file in place.",
    `After generation, report the generated image path if available.`,
    "",
    "<prompt>",
    prompt,
    "</prompt>"
  ].join("\n");

  const outputMessage = path.join(path.dirname(resultFile), `${jobId}.codex-last-message.txt`);
  const child = spawn(
    codexBin,
    [
      "-a",
      "never",
      "exec",
      "--skip-git-repo-check",
      "--sandbox",
      "workspace-write",
      "--output-last-message",
      outputMessage,
      instruction
    ],
    { cwd: path.dirname(path.dirname(resultFile)), stdio: ["ignore", "pipe", "pipe"] }
  );

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const code = await new Promise((resolve) => child.on("close", resolve));
  if (code !== 0) {
    await fs.writeFile(
      resultFile,
      JSON.stringify({ ok: false, error: `codex exec exited with ${code}`, stdout, stderr }, null, 2),
      "utf8"
    );
    process.exit(code || 1);
  }

  const generated = await newestAfter(generatedRoot, startedAt - 1000);
  const copied = [];
  for (let i = 0; i < generated.length; i += 1) {
    const source = generated[i].path;
    const ext = path.extname(source) || ".png";
    const filename = `${jobId}_${String(i + 1).padStart(2, "0")}${ext}`;
    const target = path.join(outputDir, filename);
    await fs.copyFile(source, target);
    copied.push({ name: filename, url: `/api/image?name=${encodeURIComponent(filename)}`, source });
  }

  if (!copied.length) {
    await fs.writeFile(
      resultFile,
      JSON.stringify(
        {
          ok: false,
          error:
            "Codex finished but no new image file was found in ~/.codex/generated_images. The current CLI may not expose imagegen to exec sessions.",
          stdout,
          stderr
        },
        null,
        2
      ),
      "utf8"
    );
    process.exit(2);
  }

  await fs.writeFile(
    resultFile,
    JSON.stringify({ ok: true, images: copied, logs: stdout.slice(-4000) || stderr.slice(-4000) }, null, 2),
    "utf8"
  );
}

main().catch(async (error) => {
  const resultFile = arg("--result-file");
  if (resultFile) {
    await fs.writeFile(resultFile, JSON.stringify({ ok: false, error: error.message }, null, 2), "utf8");
  }
  console.error(error);
  process.exit(1);
});
