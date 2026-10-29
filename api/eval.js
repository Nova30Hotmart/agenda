import { readBody, clean, putJSON } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const d = await readBody(req);
  const nps = Number(d.nps);
  if (!Number.isInteger(nps) || nps < 0 || nps > 10) return res.status(400).json({ error: "Calificación inválida." });
  const ev = {
    nps,
    speakers: Array.isArray(d.speakers) ? d.speakers.slice(0, 10).map(s => clean(s, 60)) : [],
    take: clean(d.take, 500), improve: clean(d.improve, 500),
    name: clean(d.name, 80), email: clean(d.email, 254).toLowerCase(),
    ts: new Date().toISOString()
  };
  try {
    await putJSON(`evals/${Date.now()}.json`, ev);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("EVAL", e);
    return res.status(500).json({ error: "No pudimos guardar la evaluación." });
  }
}
