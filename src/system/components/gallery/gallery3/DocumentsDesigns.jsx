import React from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Documenten: aantal bestanden, aantal nieuw, type-markering,
 * favorieten, recente bestanden, markeer verwerkt. Focus: bestanden bij de
 * hand, nieuw vs verwerkt, favorieten.
 * D2 "Bestand-rooster + nieuw-badge" (4:3) — grid van bestand-tegels met
 * type-merken; nieuwe gloeien; tik opent. Motion: tegels staggern, nieuw pulst.
 * D3 "Recente-bestanden-lade" (3:4) — verticale lade met thumbnail-strook;
 * markeer verwerkt. Focus: recente toegang. */

const MARK = { pdf: "PDF", image: "IMG", doc: "DOC", sheet: "XLS", other: "FILE" };

export function DocumentsDesign2() {
  const { data: docs, reload } = useEntityList("Upload", { sort: "-created_date" });
  const list = (docs || []).slice(0, 6);
  const mark = async (u) => { try { await base44.entities.Upload.update(u.id, { status: "processed" }); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Documenten · rooster</p>
        <span className="text-[10px] tabular-nums opacity-50">{docs?.length || 0} · {list.filter((d) => d.status === "new").length} nieuw</span>
      </div>
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
        {list.map((d, i) => {
          const isNew = d.status === "new";
          return (
            <motion.div key={d.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              onClick={() => isNew && mark(d)} className="relative rounded-xl flex items-center justify-center text-sm font-display font-bold cursor-pointer"
              style={{ background: isNew ? "var(--tile-accent)" : "rgba(255,255,255,0.1)", color: isNew ? "#fff" : "rgba(255,255,255,0.7)" }}>
              {MARK[d.type] || "FILE"}
              {isNew && <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-ivory" />}
            </motion.div>
          );
        })}
        {list.length === 0 && <p className="col-span-full m-auto text-xs opacity-40">Geen bestanden</p>}
      </div>
    </div>
  );
}

export function DocumentsDesign3() {
  const { data: docs, reload } = useEntityList("Upload", { sort: "-created_date" });
  const list = (docs || []).slice(0, 5);
  const mark = async (u) => { try { await base44.entities.Upload.update(u.id, { status: "processed" }); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Documenten · lade</p>
        <span className="text-[10px] tabular-nums opacity-50">{list.filter((d) => d.status === "new").length} nieuw</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden min-h-0">
        {list.map((d, i) => {
          const isNew = d.status === "new";
          return (
            <motion.button key={d.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => isNew && mark(d)} className="w-full flex items-center gap-2.5 glass-1 rounded-xl px-2.5 py-2 text-left hover:bg-white/10 transition">
              <span className="h-8 w-8 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: isNew ? "var(--tile-accent)" : "rgba(255,255,255,0.12)", color: "#fff" }}>{MARK[d.type] || "F"}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium truncate">{d.filename || "Bestand"}</span>
                <span className="block text-[9px] opacity-50">{isNew ? "nieuw · tik om te verwerken" : "verwerkt"}</span>
              </span>
            </motion.button>
          );
        })}
        {list.length === 0 && <p className="m-auto text-xs opacity-40">Geen bestanden</p>}
      </div>
    </div>
  );
}

export default { Design2: DocumentsDesign2, Design3: DocumentsDesign3 };