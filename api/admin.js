import { listAll, del } from "./_lib.js";

/* Borra un perfil o una evaluación. Requiere EXPORT_KEY.
   /api/admin?key=...&profile=<id>   ·   /api/admin?key=...&eval=<archivo sin .json> */
export default async function handler(req, res) {
  if (!process.env.EXPORT_KEY || req.query.key !== process.env.EXPORT_KEY) return res.status(401).json({ error: "No autorizado." });
  const id = String(req.query.profile || "").replace(/[^a-z0-9]/gi, "");
  const ev = String(req.query.eval || "").replace(/[^0-9]/g, "");
  if (!id && !ev) return res.status(400).json({ error: "Indica profile o eval." });
  const prefixes = id ? [`profiles/${id}/`, `photos/${id}`] : [`evals/${ev}`];
  const blobs = (await Promise.all(prefixes.map(listAll))).flat();
  if (blobs.length) await del(blobs.map(b => b.url));
  return res.status(200).json({ ok: true, deleted: blobs.length });
}
