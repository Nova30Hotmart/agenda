import { latestByFolder, listAll, getJSON } from "./_lib.js";

const csv = rows => {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const q = v => `"${String(Array.isArray(v) ? v.join(" | ") : v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + [keys.join(","), ...rows.map(r => keys.map(k => q(r[k])).join(","))].join("\n");
};

export default async function handler(req, res) {
  if (!process.env.EXPORT_KEY || req.query.key !== process.env.EXPORT_KEY) return res.status(401).send("No autorizado.");
  const what = req.query.t === "evals" ? "evals" : "profiles";
  let rows;
  if (what === "profiles") {
    const { latest } = await latestByFolder("profiles/");
    rows = (await Promise.all(latest.map(b => getJSON(b.url)))).filter(Boolean);
  } else {
    const blobs = await listAll("evals/");
    rows = (await Promise.all(blobs.map(async b => { const j = await getJSON(b.url); return j && { file: b.pathname.split("/")[1].split("-")[0].replace(".json", ""), ...j }; }))).filter(Boolean).sort((a, b) => a.ts.localeCompare(b.ts));
  }
  if (req.query.f === "json") return res.status(200).json({ rows });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="agenda-${what}.csv"`);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(csv(rows));
}
