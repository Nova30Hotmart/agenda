/* Business Discovery (API oficial de Meta).
   Requiere IG_USER_ID (cuenta profesional propia) y IG_TOKEN en Vercel. */
export default async function handler(req, res) {
  const u = String(req.query.u || "").replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, "").slice(0, 30);
  if (!u) return res.status(400).json({ error: "Usuario inválido." });
  const { IG_USER_ID, IG_TOKEN } = process.env;
  if (!IG_USER_ID || !IG_TOKEN) return res.status(503).json({ error: "Instagram aún no está conectado." });
  const fields = `business_discovery.username(${u}){username,name,biography,profile_picture_url}`;
  const url = `https://graph.facebook.com/v23.0/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(IG_TOKEN)}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const b = j.business_discovery;
    if (!r.ok || !b) return res.status(404).json({ error: "Cuenta no disponible." });
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({ username: b.username, name: b.name || "", bio: b.biography || "", photo: b.profile_picture_url || "" });
  } catch (e) {
    console.error("IG", e);
    return res.status(502).json({ error: "No pudimos consultar Instagram." });
  }
}
