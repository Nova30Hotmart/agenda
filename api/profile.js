import { readBody, clean, sha, putJSON, put, del, listAll, COMMUNITIES } from "./_lib.js";

const MAX_PHOTO = 1.5 * 1024 * 1024;

async function storePhoto(photo, id) {
  if (!photo) return "";
  // Ya guardada en nuestro Blob
  if (/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(photo)) return photo;
  let buf, type = "image/jpeg";
  if (photo.startsWith("data:image/")) {
    const m = photo.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!m) return "";
    type = m[1]; buf = Buffer.from(m[2], "base64");
  } else if (/^https:\/\//i.test(photo)) {
    // Foto remota (Instagram / respaldo): la copiamos porque esos links caducan
    const r = await fetch(photo, { redirect: "follow" });
    if (!r.ok) return "";
    type = r.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return "";
    buf = Buffer.from(await r.arrayBuffer());
  } else return "";
  if (buf.length > MAX_PHOTO) return "";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const b = await put(`photos/${id}.${ext}`, buf, { access: "public", addRandomSuffix: true, contentType: type });
  return b.url;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  const d = await readBody(req);
  const email = clean(d.email, 254).toLowerCase();
  const name = clean(d.name, 80);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Correo inválido." });
  if (!name) return res.status(400).json({ error: "Falta el nombre." });

  const id = sha(email);
  try {
    const photo = await storePhoto(typeof d.photo === "string" ? d.photo : "", id).catch(() => "");
    const profile = {
      id, email, name,
      ig: clean(d.ig, 40).replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""),
      project: clean(d.project, 80),
      country: clean(d.country, 40),
      community: COMMUNITIES.includes(d.community) ? d.community : "",
      bio: clean(d.bio, 220),
      help: clean(d.help, 140),
      photo,
      updated: new Date().toISOString()
    };
    const old = await listAll(`profiles/${id}/`);
    await putJSON(`profiles/${id}/p.json`, profile);
    if (old.length) await del(old.map(b => b.url)).catch(() => {});
    const { email: _e, ...pub } = profile;
    return res.status(200).json({ ok: true, profile: pub });
  } catch (e) {
    console.error("PROFILE", e);
    return res.status(500).json({ error: "No pudimos guardar el perfil." });
  }
}
