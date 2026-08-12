import React from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Inzichten: aantal nieuw, gem. vertrouwen-ring + sparkline, laatste
 * inzicht met categorie, laat Giulia onderzoeken. Focus: signalen/kansen/risico
 * met vertrouwen-trend + onderzoek-actie.
 * D2 "Signaal-kolommen" (4:3) — kolommen per categorie (Kans/Risico/etc.);
 * kaarten eronder; vertrouwenspunt. Motion: kaarten vallen per kolom.
 * D3 "Vertrouwens-golf + top-inzicht" (16:7) — area-grafiek van vertrouwen;
 * top-inzicht eroverheen; onderzoek-knop. Motion: golf tekent in. */

const CAT_COLOR = { Opportunity: "var(--tile-accent)", Risk: "hsl(var(--destructive))", Suggestion: "hsl(var(--sand))", Research: "hsl(var(--ridge))", "Follow-up": "hsl(var(--steel))", Trend: "hsl(var(--powder))" };

export function InsightsDesign2() {
  const { data: insights } = useEntityList("Insight", { filter: { status: "new" }, sort: "-created_date" });
  const cats = ["Opportunity", "Risk", "Suggestion", "Follow-up"];
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("sand") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Inzichten · signalen</p>
        <span className="text-[10px] tabular-nums opacity-50">{insights?.length || 0} nieuw</span>
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        {cats.map((cat, ci) => {
          const list = (insights || []).filter((i) => i.category === cat).slice(0, 3);
          return (
            <div key={cat} className="flex flex-col min-h-0">
              <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1.5 truncate">{cat} · {list.length}</p>
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {list.map((it, i) => (
                  <motion.div key={it.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 + i * 0.05 }} className="glass-1 rounded-lg px-2 py-1.5">
                    <span className="block h-1.5 w-1.5 rounded-full mb-1" style={{ background: CAT_COLOR[cat] }} />
                    <p className="text-[10px] font-medium leading-tight line-clamp-2">{it.title}</p>
                    <span className="text-[8px] opacity-50">{Math.round((it.confidence || 0.5) * 100)}%</span>
                  </motion.div>
                ))}
                {list.length === 0 && <p className="text-[9px] opacity-30">—</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InsightsDesign3() {
  const { data: insights, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [busy, setBusy] = React.useState(false);
  const list = (insights || []).slice(0, 8).reverse();
  const top = (insights || []).find((i) => i.status === "new") || insights?.[0];
  const pts = list.map((it, i) => `${(i / Math.max(1, list.length - 1)) * 100},${30 - (it.confidence || 0.5) * 28}`).join(" ");
  const research = async () => { setBusy(true); try { await base44.functions.invoke("researchInsights", { count: 1 }); reload(); } catch {} setBusy(false); };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars("sand") }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Inzichten · vertrouwen</p>
        <button onClick={research} disabled={busy} className="rounded-full px-3 py-1 text-[10px] font-semibold transition hover:-translate-y-0.5 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "#fff" }}>{busy ? "…" : "Onderzoek"}</button>
      </div>
      <div className="relative flex-1 min-h-0">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <motion.polyline points={pts} fill="none" stroke="var(--tile-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
        </svg>
        {top && (
          <div className="absolute bottom-1 left-1 right-1 glass-1 rounded-xl px-3 py-2">
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: CAT_COLOR[top.category] || "var(--tile-accent)", color: "#fff" }}>{top.category}</span>
            <p className="text-[11px] font-semibold mt-1 truncate">{top.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default { Design2: InsightsDesign2, Design3: InsightsDesign3 };