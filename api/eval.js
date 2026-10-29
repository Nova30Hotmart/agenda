import { readBody, clean, putJSON } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const d = await readBody(req);
  const nps = Number(d.nps);
  if (!Number.isInteger(nps) || nps < 0 || nps > 10) return res.status(400).json({ error: "Calificación inválida." });
  const KEYS = ["steven-zamora", "santiago-castaneda", "alex-dey", "alberto-navarro", "julian-otalora", "alejandro-sanchez", "viny-loureiro", "comida"];
  const ratings = {};
  for (const k of KEYS) {
    const v = d.ratings && d.ratings[k];
    ratings[`cal_${k.replace(/-/g, "_")}`] = Number.isInteger(v) && v >= 1 && v <= 5 ? v : "N/A";
  }
  const ev = {
    nps, ...ratings,
    take: clean(d.take, 500), improve: clean(d.improve, 500),
    name: clean(d.name, 80), ig: clean(d.ig, 40),
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
