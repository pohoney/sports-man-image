import { json, jsonHeaders, readImageIndex, readJob } from "../_shared.js";

export async function onRequest({ request, params }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method !== "GET") return json({ error: "Method not allowed" }, { status: 405 });

  const jobId = String(params?.jobId || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!jobId) return json({ status: "error", error: "Missing job id" }, { status: 400 });

  const job = await readJob(jobId);
  if (!job) {
    return json({ status: "unknown", jobId, error: "Job not found or still starting." }, { status: 200 });
  }

  if (job.status === "done") {
    return json({ ...job, gallery: await readImageIndex() });
  }

  return json(job);
}
