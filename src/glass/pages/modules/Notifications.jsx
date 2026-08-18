import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { BarGrow, PulseWave } from "@/glass/components/modules/viz";

const PLUM = "#301728", URG = "#d5e24a", OLIVE = "#d8dab3";

const TYPES = {
  info: { c: PLUM, l: "INFO" },
  warn: { c: OLIVE, l: "WARN" },
  urgent: { c: URG, l: "URGENT" },
  sys: { c: "rgba(255,255,255,0.4)", l: "SYSTEM" },
};

const POOL = [
  { type: "info", text: "Nieuwe taak toegevoegd aan Concept Brons" },
  { type: "urgent", text: "Afspraak met Giulia verplaatst naar 15:00" },
  { type: "warn", text: "Marktanalyse rapport deadline nadert" },
  { type: "sys", text: "Back-up voltooid om 03:00" },
  { type: "info", text: "Notitieblok gesynchroniseerd" },
  { type: "urgent", text: "3 goedkeuringen wachten op je" },
  { type: "warn", text: "Capaciteit daalt — overweeg rust" },
  { type: "info", text: "Nieuw contact toegevoegd: F. de Boer" },
  { type: "sys", text: "Systeem-update geïnstalleerd" },
  { type: "info", text: "Weekplanning bijgewerkt" },
];

const SEED = [
  { id: 1, type: "urgent", text: "Afspraak met Giulia verplaatst naar 15:00", time: "14:02" },
  { id: 2, type: "warn", text: "Marktanalyse rapport deadline nadert", time: "11:30" },
  { id: 3, type: "info", text: "Nieuwe taak toegevoegd aan Concept Brons", time: "10:15" },
  { id: 4, type: "sys", text: "Back-up voltooid om 03:00", time: "03:00" },
];

export default function Notifications() {
  const [items, setItems] = useState(SEED);
  const [readIds, setReadIds] = useState(new Set());
  const idRef = useRef(100);

  useEffect(() => {
    const id = setInterval(() => {
      const tpl = POOL[Math.floor(Math.random() * POOL.length)];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setItems(prev => [{ id: ++idRef.current, ...tpl, time }, ...prev].slice(0, 9));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const unread = items.filter(i => !readIds.has(i.id)).length;
  const counts = { info: 0, warn: 0, urgent: 0, sys: 0 };
  items.forEach(i => counts[i.type]++);
  const markAll = () => setReadIds(new Set(items.map(i => i.id)));

  return (
    <ModuleShell
      index="03" section="NOTIFICATIONS" statement={`${unread} NIEUW`} kicker="ACTIVITY · LIVE"
      context={[
        { label: "UNREAD", text: `${unread} ongelezen notificaties.` },
        { label: "URGENT", text: `${counts.urgent} vereisen directe aandacht.` },
        { label: "FEED", text: "Live stream — nieuwe items verschijnen automatisch." },
      ]}
      actions={[{ label: "Mark All Read", primary: true }, { label: "Mute" }, { label: "Settings" }, { label: "Open Notifications" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">SIGNAL · LIVE</p>
            <PulseWave color={URG} bars={20} height={40} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">BY TYPE</p>
            {Object.keys(TYPES).map((k, i) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-storm/70">{TYPES[k].l}</span>
                  <span className="text-storm tabular-nums">{counts[k]}</span>
                </div>
                <BarGrow value={counts[k]} max={Math.max(...Object.values(counts), 1)} color={TYPES[k].c} delay={i * 0.12} />
              </div>
            ))}
          </div>
          <button onClick={markAll} className="px-4 py-2.5 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-xs tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">Mark All Read</button>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">FEED · {items.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence initial={false}>
              {items.map(it => {
                const isRead = readIds.has(it.id);
                return (
                  <motion.div key={it.id} layout
                    initial={{ opacity: 0, x: -16, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setReadIds(s => new Set([...s, it.id]))}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ${isRead ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/10 hover:bg-marble/15"}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPES[it.type].c, opacity: isRead ? 0.4 : 1 }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isRead ? "text-storm/50" : "text-storm"}`}>{it.text}</p>
                      <p className="text-[10px] text-storm/40 mt-0.5">{TYPES[it.type].l} · {it.time}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${TYPES[it.type].c}22`, color: TYPES[it.type].c }}>{TYPES[it.type].l}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}