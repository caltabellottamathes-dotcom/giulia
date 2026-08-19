import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Goedkeuringen: aantal wachtend, top-goedkeuring met beschrijving,
 * assignee (voor Giulia / voor jou), één-tik goedkeuren/afwijzen.
 * D2 "Beslis-carousel" (1:1) — één goedkeuring gecentreerd als kaart, blader
 * door de rij, grote ✓/✗. Focus: één beslissing tegelijk, snel oordeel.
 * D3 "Jij vs Giulia" (4:3) — twee kolommen 'Voor jou' en 'Voor Giulia', elk
 * een stapel beslissingen. Focus: wie handelt wat. */

const decide = async (a, action, reload) => { try { await base44.functions.invoke("executeApproval", { approval_id: a.id, action }); } catch {} reload(); };

export function ApprovalsDesign2() {
  const { data: items, reload } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date" });
  const [i, setI] = useState(0);
  const cur = items[i] || items[0];
  const go = (d) => { if (cur) decide(cur, d, reload); setI((p) => Math.min(p + 1, Math.max(0, items.length - 1))); };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 flex flex-col items-center justify-center p-5 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars("olive") }}>
      <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65 mb-1">Waiting on You. · {items.length} wacht</p>
      <AnimatePresence mode="wait">
        {cur ? (
          <motion.div key={cur.id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
          className="glass-1 rounded-2xl p-4 w-full text-center">
          <p className="text-[9px] uppercase tracking-wider opacity-55 mb-1">{cur.category || cur.action_type}</p>
          <p className="text-sm font-semibold leading-snug">{cur.title || cur.description}</p>
          <p className="text-[11px] opacity-60 mt-1.5 line-clamp-3">{cur.description}</p>
          <span className={`inline-block mt-2 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${cur.assignee === "giulia" ? "bg-steel/25 text-ivory/80" : "bg-olive/30 text-ivory"}`}>{cur.assignee === "giulia" ? "Voor Giulia" : "Voor jou"}</span>
        </motion.div>
        ) : <p className="text-2xl font-display opacity-40">0</p>}
      </AnimatePresence>
      {cur && (
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => go("reject")} className="h-14 w-14 rounded-full glass-1 text-ivory text-2xl hover:bg-white/10 transition">✕</button>
          <span className="text-[10px] opacity-50">{i + 1}/{items.length}</span>
          <button onClick={() => go("approve")} className="h-14 w-14 rounded-full text-ivory text-2xl transition hover:-translate-y-0.5" style={{ background: "var(--tile-accent)" }}>✓</button>
        </div>
      )}
    </div>
  );
}

export function ApprovalsDesign3() {
  const { data: items, reload } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date" });
  const you = items.filter((a) => a.assignee !== "giulia");
  const giulia = items.filter((a) => a.assignee === "giulia");
  const Col = ({ name, list, accent }) => (
    <div className="flex-1 flex flex-col min-h-0">
      <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1.5">{name} · {list.length}</p>
      <div className="space-y-1.5 overflow-hidden flex-1">
        {list.slice(0, 4).map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-1 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] font-medium leading-tight line-clamp-2">{a.title || a.description}</p>
            <div className="flex gap-1 mt-1.5">
              <button onClick={(e) => { e.stopPropagation(); decide(a, "approve", reload); }} className="flex-1 rounded-full py-1 text-[9px] font-semibold" style={{ background: accent, color: "#fff" }}>Ja</button>
              <button onClick={(e) => { e.stopPropagation(); decide(a, "reject", reload); }} className="flex-1 rounded-full py-1 text-[9px] font-semibold border border-ivory/25 text-ivory">Nee</button>
            </div>
          </motion.div>
        ))}
        {list.length === 0 && <p className="text-[9px] opacity-35">—</p>}
      </div>
    </div>
  );
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Waiting on You. · wie handelt</p>
        <span className="text-[10px] tabular-nums opacity-50">{items.length}</span>
      </div>
      <div className="flex gap-3 flex-1 min-h-0">
        <Col name="Voor jou" list={you} accent="var(--tile-accent)" />
        <div className="w-px bg-ivory/10" />
        <Col name="Voor Giulia" list={giulia} accent="hsl(var(--steel))" />
      </div>
    </div>
  );
}

export default { Design2: ApprovalsDesign2, Design3: ApprovalsDesign3 };