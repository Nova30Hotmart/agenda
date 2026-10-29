import { put, list, del } from "@vercel/blob";
import { createHash } from "node:crypto";

export const sha = s => createHash("sha256").update(String(s)).digest("hex").slice(0, 24);
export const clean = (v, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : "");
export const COMMUNITIES = ["Titanium", "NOVA 30", "Invitado", "Equipo Hotmart"];

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

/* Lee el JSON más reciente por carpeta (profiles/<id>/<archivo>.json) */
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

export { put, del };
