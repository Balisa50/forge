"use client";

/**
 * PreviewAdminBar, dev-only diagnostics docked at the bottom of a preview week.
 * Shows week meta, total videos, days with zero videos (so the developer can judge
 * whether lesson+swipe+exercise teaches the concept without one), and days whose
 * lesson bodies repeat (the generic scaffold) so they can be spotted and rewritten.
 */

import { useMemo, useState } from "react";
import type { RoadmapWeek } from "@/lib/roadmaps";

function norm(s: string) {
 return (s || "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 400);
}

export default function PreviewAdminBar({
 week, source, liveServesEnriched,
}: {
 week: RoadmapWeek;
 source: string;
 liveServesEnriched: boolean;
}) {
 const [open, setOpen] = useState(true);

 const diag = useMemo(() => {
 const days = week.days ?? [];
 let totalVideos = 0;
 const zeroVideoDays: number[] = [];
 const seen = new Map<string, number>();
 const repetitiveDays: number[] = [];
 for (const d of days) {
 const items = d.items ?? [];
 const vids = items.filter((i) => i.kind === "video").length;
 totalVideos += vids;
 if (vids === 0 && (d.number ?? 1) !== 0) zeroVideoDays.push(d.number);
 for (const it of items) {
 if (it.kind !== "lesson") continue;
 const key = norm(it.body || "");
 if (!key) continue;
 if (seen.has(key)) {
 if (!repetitiveDays.includes(d.number)) repetitiveDays.push(d.number);
 } else {
 seen.set(key, d.number);
 }
 }
 }
 return { totalVideos, zeroVideoDays, repetitiveDays, nDays: days.length, nCC: (week.concept_check ?? []).length };
 }, [week]);

 const chip = (bg: string, color: string, text: string) => (
 <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, marginRight: 8 }}>{text}</span>
 );

 return (
 <div style={{
 position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
 background: "#0b0b0c", borderTop: "2px solid #d4af37", color: "#e7e7ea",
 fontFamily: "ui-monospace,Menlo,Consolas,monospace", fontSize: 12,
 boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", flexWrap: "wrap" }}>
 <strong style={{ color: "#d4af37", letterSpacing: ".08em" }}>DEV PREVIEW</strong>
 <span>W{week.number} · {week.title}</span>
 {chip("#141417", "#9a9aa3", `${diag.nDays} days`)}
 {chip("#141417", "#9a9aa3", `${diag.nCC} concept checks`)}
 {chip(diag.totalVideos ? "#14331f" : "#3a2a14", diag.totalVideos ? "#5ad17f" : "#e0b341", `${diag.totalVideos} videos`)}
 {diag.zeroVideoDays.length > 0 &&
 chip("#3a2a14", "#e0b341", `no-video days: ${diag.zeroVideoDays.join(", ")}`)}
 {diag.repetitiveDays.length > 0 &&
 chip("#3a1414", "#ff8585", `⚠ repetitive lessons: D${diag.repetitiveDays.join(", D")}`)}
 {!liveServesEnriched &&
 chip("#3a1414", "#ff8585", `⚠ LIVE serves ${source.replace("-enriched", "")}, enriched NOT deployed`)}
 {liveServesEnriched &&
 chip("#14331f", "#5ad17f", `live serves enriched`)}
 <button onClick={() => setOpen((o) => !o)} style={{ marginLeft: "auto", background: "none", border: "1px solid #2a2a30", color: "#9a9aa3", borderRadius: 4, padding: "3px 9px", cursor: "pointer", font: "inherit" }}>
 {open ? "hide details" : "details"}
 </button>
 </div>
 {open && (
 <div style={{ padding: "0 14px 10px", color: "#9a9aa3", lineHeight: 1.6 }}>
 <div>Preview source: <span style={{ color: "#e7e7ea" }}>{source}</span></div>
 {diag.zeroVideoDays.length > 0 && (
 <div>Days teaching without a video (judge if lesson + swipe + exercise is enough): <span style={{ color: "#e0b341" }}>{diag.zeroVideoDays.map((d) => `Day ${d}`).join(", ")}</span></div>
 )}
 {diag.repetitiveDays.length > 0 && (
 <div>Days reusing an identical lesson body (rewrite candidates): <span style={{ color: "#ff8585" }}>{diag.repetitiveDays.map((d) => `Day ${d}`).join(", ")}</span></div>
 )}
 {!liveServesEnriched && (
 <div style={{ color: "#ff8585" }}>This track&apos;s enriched content is NOT what the live /learn route serves. Promote {source} → {source.replace("-enriched", "")} (or make loadRoadmap prefer -enriched) to deploy it.</div>
 )}
 </div>
 )}
 </div>
 );
}
