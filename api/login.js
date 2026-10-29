import { readBody, clean, normIg, idFor, getProfile, igLookup, storePhoto, saveProfile } from "./_lib.js";

/* Entrar con el @ de Instagram.
   - Si ya hay perfil: lo regresa.
   - Si no: lo crea con los datos públicos de Instagram.
   - Si Instagram no da datos (cuenta personal/privada) y no mandan nombre: pide el nombre. */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const d = await readBody(req);
  const ig = normIg(d.ig);
  if (!ig || ig.length < 2) return res.status(400).json({ error: "Escribe tu usuario de Instagram." });
  const id = idFor(ig);
  try {
    const existing = await getProfile(id);
    if (existing) return res.status(200).json({ profile: existing, created: false });

    const info = await igLookup(ig);
    const name = clean(d.name, 80) || (info && info.name) || "";
    if (!name) return res.status(200).json({ needName: true, ig });

    const photo = info && info.photo ? await storePhoto(info.photo, id).catch(() => "") : "";
    const profile = await saveProfile({
      id, ig, name,
      bio: clean(info && info.bio, 220),
      photo, project: "", country: "", challenge: "", help: "",
      fromIg: !!info, created: new Date().toISOString(), updated: new Date().toISOString()
    });
    return res.status(200).json({ profile, created: true, fromIg: !!info });
  } catch (e) {
    console.error("LOGIN", e);
    return res.status(500).json({ error: "No pudimos entrar. Intenta de nuevo." });
  }
}
