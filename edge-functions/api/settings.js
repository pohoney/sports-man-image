import { json, jsonHeaders, readSettings, saveSettings } from "./_shared.js";

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });
  if (request.method === "GET") return json(await readSettings());
  if (request.method === "POST") {
    const payload = await request.json();
    return json(await saveSettings(payload));
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}
