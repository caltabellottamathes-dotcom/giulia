import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Kennisbank: totaal notities, categorieverdeling, filter op
 * categorie, recente notities (titel + content). Focus: gecategoriseerde
 * bibliotheek, bladeren per categorie.
 * D2 "Categorie-constellatie" (1:1) — categorieën als knopen geschaald naar
 * aantal; lijnen naar recente notities; tik filtert. Motion: knopen ademen.
 * D3 "Notitie-flipstapel" (3:4) — stapel notitiekaarten, flip om content te
 * lezen, categorietabs opzij. Motion: 3D-flip. */

const PALETTE = ["hsl(var(--olive))", "hsl(var(--sand))", "hsl(var(--ridge))", "hsl(var(--steel))", "hsl(var(--powder))"];

export function KnowledgeDesign2() {
  const { data: items } = useEntityList("Knowledge", { sort: "-created_date" });
  const cats = Array.from(new Set((items || []).map((i) => i.category || "Overig")));
  const counts = cats.map((c, i) => ({ c, n: items.filter((i) => (i.category || "Overig") === c).length, color: PALETTE[i % PALETTE.length] }));
  const total = counts.reduce((s, x) => s + x.n, 0) || 1;
  const [active, setActive] = useState(null);
  const shown = (items || []).filter((i) => !active || (i.category || "Overig") === active).slice(0, 5);

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Kennis · veld</p>
        <span className="text-[10px] tabular-nums opacity-50">{items?.length || 0}</span>
      </div>
      <div className="relative h-[60%]">
        {counts.map((cat, i) => {
          const ang = (i / counts.length) * 2 * Math.PI - Math.PI / 2;
          const dist = 28 + (cat.n / total) * 12;
          const x = 50 + dist * Math.cos(ang); const y = 50 + dist * Math.sin(ang);
          const size = 24 + (cat.n / total) * 36;
          return (
            <motion.button key={cat.c} onClick={() => setActive(active === cat.c ? null : cat.c)}
              initial={{ scale: 0 }} animate={{ scale: 1, opacity: active && active !== cat.c ? 0.3 : 1 }} transition={{ delay: i * 0.08 }}
              className="absolute rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: active === cat.c ? cat.color : "rgba(255,255,255,0.16)", border: `2px solid ${cat.color}` }}>
              {cat.n}
            </motion.button>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full glass-1" />
        </div>
      </div>
      <div className="mt-1 space-y-1">
        <AnimatePresence>
          {shown.slice(0, 3).map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] truncate glass-1 rounded-lg px-2 py-1">
              <span className="opacity-50">{k.category || "Overig"} · </span>{k.title}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function KnowledgeDesign3() {
  const { data: items } = useEntityList("Knowledge", { sort: "-created_date" });
  const [flip, setFlip] = useState(0);
  const top = (items || []).slice(0, 4);
  const cur = top[flip] || top[0];
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Kennis · flip</p>
        <span className="text-[10px] tabular-nums opacity-50">{items?.length || 0}</span>
      </div>
      <div className="flex-1" style={{ perspective: 1000 }}>
        <AnimatePresence mode="wait">
          <motion.div key={cur?.id} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.4 }}
            onClick={() => setFlip((f) => (f + 1) % Math.max(1, top.length))}
            className="relative h-full rounded-2xl glass-1 p-4 flex flex-col cursor-pointer">
            {cur && (
              <>
                <span className="self-start text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--tile-accent)", color: "#fff" }}>{cur.category || "Overig"}</span>
                <p className="text-sm font-semibold mt-2">{cur.title}</p>
                <p className="text-[11px] opacity-70 mt-1.5 line-clamp-6 leading-snug">{cur.content}</p>
                <p className="mt-auto text-[9px] opacity-40">tik voor volgende ›</p>
              </>
            )}
            {!cur && <p className="m-auto text-xs opacity-40">Nog geen kennis</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default { Design2: KnowledgeDesign2, Design3: KnowledgeDesign3 };