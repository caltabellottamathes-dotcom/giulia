import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Mensen: aantal contacten, avatar-cluster, recent gesproken,
 * bel top-contact, alfabetisch bladeren. Focus: relaties, wie bereiken,
 * bel-actie.
 * D2 "Relatie-ring" (1:1) — contacten in een ring op recency; centrum toont
 * wie het langst niet is gesproken. Motion: ring draait; overdue pulst.
 * D3 "Recente-tijdlijn" (16:7) — horizontale tijdlijn van recente interacties
 * (avatars op een tijdlint). Focus: wie sprak je en wanneer. */

export function PeopleDesign2() {
  const { data: contacts } = useEntityList("Contact");
  const sorted = useMemo(() => [...(contacts || [])].sort((a, b) => new Date(a.last_contact_date || 0) - new Date(b.last_contact_date || 0)), [contacts]);
  const ring = sorted.slice(0, 10);
  const overdue = sorted[0];
  const days = (d) => d ? Math.floor((Date.now() - new Date(d)) / 86400000) : null;
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars("ridge") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">People Around Me. · ring</p>
        <span className="text-[10px] tabular-nums opacity-50">{contacts?.length || 0}</span>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-[12%] rounded-full border border-ivory/10" />
        {ring.map((c, i) => {
          const ang = (i / Math.max(1, ring.length)) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 40 * Math.cos(ang); const y = 50 + 40 * Math.sin(ang);
          const isOver = i === 0;
          return (
            <motion.div key={c.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06 }}
              className="absolute h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              style={{ left: `${x}%`, top: `${y}%`, marginLeft: -18, marginTop: -18, background: isOver ? "var(--tile-accent)" : "rgba(255,255,255,0.16)", borderColor: isOver ? "var(--tile-accent)" : "rgba(255,255,255,0.25)", color: isOver ? "#fff" : undefined }}>
              {c.name?.slice(0, 1).toUpperCase()}
              {isOver && <motion.span animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full" style={{ background: "var(--tile-accent)" }} />}
            </motion.div>
          );
        })}
        <div className="relative z-10 text-center">
          <p className="text-[9px] uppercase tracking-wider opacity-50">bel</p>
          <p className="text-sm font-semibold max-w-[7rem] truncate">{overdue?.name || "—"}</p>
          <p className="text-[9px] opacity-50">{days(overdue?.last_contact_date) == null ? "" : `${days(overdue?.last_contact_date)}d geleden`}</p>
        </div>
      </div>
    </div>
  );
}

export function PeopleDesign3() {
  const { data: contacts } = useEntityList("Contact");
  const recent = useMemo(() => [...(contacts || [])].filter((c) => c.last_contact_date).sort((a, b) => new Date(b.last_contact_date) - new Date(a.last_contact_date)).slice(0, 7), [contacts]);
  const max = recent.length ? new Date(recent[0].last_contact_date).getTime() : 0;
  const min = recent.length ? new Date(recent[recent.length - 1].last_contact_date).getTime() : 0;
  const pos = (d) => min === max ? 50 : 100 - ((new Date(d).getTime() - min) / (max - min)) * 90 - 5;
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars("ridge") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">People Around Me. · recent</p>
        <span className="text-[10px] tabular-nums opacity-50">{contacts?.length || 0} contacten</span>
      </div>
      <div className="relative flex-1 flex items-center">
        <div className="absolute inset-x-0 top-1/2 h-px bg-ivory/12" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] opacity-40">nu</div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] opacity-40">ouder</div>
        {recent.map((c, i) => (
          <motion.button key={c.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
            style={{ left: `${pos(c.last_contact_date)}%` }}>
            <span className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--tile-accent)", color: "#fff" }}>{c.name?.slice(0, 1).toUpperCase()}</span>
            <span className="text-[8px] truncate max-w-[3.5rem] opacity-65">{c.name?.split(" ")[0]}</span>
          </motion.button>
        ))}
        {recent.length === 0 && <p className="m-auto text-xs opacity-40">Nog geen contacten</p>}
      </div>
    </div>
  );
}

export default { Design2: PeopleDesign2, Design3: PeopleDesign3 };