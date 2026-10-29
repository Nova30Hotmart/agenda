import { sha, listAll, getJSON } from "./_lib.js";

/* Recupera tu propio perfil con tu correo (para editarlo desde otro dispositivo). */
export default async function handler(req, res) {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Correo inválido." });
  const blobs = await listAll(`profiles/${sha(email)}/`);
  if (!blobs.length) return res.status(404).json({ error: "No encontramos un perfil con ese correo." });
  const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  const p = await getJSON(latest.url);
  if (!p) return res.status(404).json({ error: "No encontramos un perfil con ese correo." });
  const { email: _e, ...pub } = p;
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ profile: pub });
}
