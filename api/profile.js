import { readBody, clean, normIg, idFor, getProfile, storePhoto, saveProfile } from "./_lib.js";

/* Actualiza el perfil. La llave es el @ de Instagram. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const d = await readBody(req);
  const ig = normIg(d.ig);
  const name = clean(d.name, 80);
  if (!ig) return res.status(400).json({ error: "Falta tu usuario de Instagram." });
  if (!name) return res.status(400).json({ error: "Falta el nombre." });
  const id = idFor(ig);
  try {
    const prev = (await getProfile(id)) || {};
    const photo = await storePhoto(typeof d.photo === "string" ? d.photo : "", id).catch(() => prev.photo || "");
    const profile = await saveProfile({
      ...prev, id, ig, name,
      project: clean(d.project, 80),
      country: clean(d.country, 40),
      bio: clean(d.bio, 220),
      challenge: clean(d.challenge, 200),
      help: clean(d.help, 140),
      photo,
      updated: new Date().toISOString()
    });
    return res.status(200).json({ ok: true, profile });
  } catch (e) {
    console.error("PROFILE", e);
    return res.status(500).json({ error: "No pudimos guardar el perfil." });
  }
}
