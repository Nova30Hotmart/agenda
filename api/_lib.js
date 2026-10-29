import { put, list, del } from "@vercel/blob";
import { createHash } from "node:crypto";

export const sha = s => createHash("sha256").update(String(s)).digest("hex").slice(0, 24);
export const clean = (v, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : "");
export const normIg = v => String(v || "").trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/[^a-zA-Z0-9._]/g, "").toLowerCase().slice(0, 30);
export const idFor = ig => sha("ig:" + ig);

export async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { return {}; }
}

export async function listAll(prefix) {
  const out = []; let cursor;
  do { const r = await list({ prefix, cursor, limit: 1000 }); out.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined; } while (cursor);
  return out;
}

export async function latestByFolder(prefix) {
  const blobs = await listAll(prefix);
  const best = new Map();
  for (const b of blobs) {
    const key = b.pathname.split("/")[1];
    if (!best.has(key) || new Date(b.uploadedAt) > new Date(best.get(key).uploadedAt)) best.set(key, b);
  }
  return { blobs, latest: [...best.values()] };
}

export async function getJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  return r.ok ? r.json() : null;
}

export async function putJSON(path, data) {
  return put(path, JSON.stringify(data), { access: "public", addRandomSuffix: true, contentType: "application/json", cacheControlMaxAge: 60 });
}

export async function getProfile(id) {
  const blobs = await listAll(`profiles/${id}/`);
  if (!blobs.length) return null;
  const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
  return getJSON(latest.url);
}

/* Business Discovery de Meta: datos públicos de una cuenta profesional */
export async function igLookup(u) {
  const { IG_USER_ID, IG_TOKEN } = process.env;
  if (!IG_USER_ID || !IG_TOKEN || !u) return null;
  const fields = `business_discovery.username(${u}){username,name,biography,profile_picture_url}`;
  try {
    const r = await fetch(`https://graph.facebook.com/v23.0/${IG_USER_ID}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(IG_TOKEN)}`);
    const j = await r.json();
    const b = j.business_discovery;
    if (!r.ok || !b) return null;
    return { username: b.username, name: b.name || "", bio: b.biography || "", photo: b.profile_picture_url || "" };
  } catch { return null; }
}

const MAX_PHOTO = 1.5 * 1024 * 1024;
export async function storePhoto(photo, id) {
  if (!photo) return "";
  if (/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(photo)) return photo;
  let buf, type = "image/jpeg";
  if (photo.startsWith("data:image/")) {
    const m = photo.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!m) return "";
    type = m[1]; buf = Buffer.from(m[2], "base64");
  } else if (/^https:\/\//i.test(photo)) {
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

/* Guarda el perfil y limpia versiones y fotos viejas */
export async function saveProfile(profile) {
  const old = await listAll(`profiles/${profile.id}/`);
  await putJSON(`profiles/${profile.id}/p.json`, profile);
  const oldPhotos = (await listAll(`photos/${profile.id}`)).filter(b => b.url !== profile.photo);
  const stale = [...old, ...oldPhotos].map(b => b.url);
  if (stale.length) await del(stale).catch(() => {});
  return profile;
}

export { put, del };
