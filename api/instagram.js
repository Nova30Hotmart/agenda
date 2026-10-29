import { normIg, igLookup } from "./_lib.js";

export default async function handler(req, res) {
  const u = normIg(req.query.u);
  if (!u) return res.status(400).json({ error: "Usuario inválido." });
  const info = await igLookup(u);
  if (!info) return res.status(404).json({ error: "Cuenta no disponible." });
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).json(info);
}
