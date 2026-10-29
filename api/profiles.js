import { latestByFolder, getJSON } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido." });
  try {
    const { latest } = await latestByFolder("profiles/");
    const all = (await Promise.all(latest.map(b => getJSON(b.url)))).filter(Boolean);
    const profiles = all.map(({ email, ...pub }) => pub);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ profiles });
  } catch (e) {
    console.error("PROFILES", e);
    return res.status(500).json({ error: "No pudimos leer los perfiles." });
  }
}
