import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PreviewShell from "@/system/panels/PreviewShell";
import { BarGrow, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3";
const TYPES = {
  info: { c: DEEP, l: "INFO" },
  warn: { c: LIGHT, l: "WARN" },
  urgent: { c: URG, l: "URGENT" },
  sys: { c: "rgba(255,255,255,0.4)", l: "SYSTEM" },
};

export default function NotificationsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Notification.filter({}, "-created_date", 12); setItems((data || []).map(n => ({ id: n.id, type: n.type || "info", text: n.title || n.message || "", time: n.created_date ? new Date(n.created_date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—" }))); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); const unsub = base44.entities.Notification.subscribe(() => load()); return unsub; }, []);

  const unread = items.filter(i => !readIds.has(i.id)).length;
  const counts = { info: 0, warn: 0, urgent: 0, sys: 0 };
  items.forEach(i => { if (counts[i.type] !== undefined) counts[i.type]++; });
  const markAll = () => setReadIds(new Set(items.map(i => i.id)));

  return (
    <PreviewShell index="03" section="NOTIFICATIONS" statement={`${unread} NIEUW`} kicker="ACTIVITY · LIVE" accent={URG}
      context={[
        { label: "UNREAD", text: `${unread} ongelezen notificaties.` },
        { label: "URGENT", text: `${counts.urgent} vereisen directe aandacht.` },
        { label: "FEED", text: "Live stream — nieuwe items verschijnen automatisch." },
      ]}
      actions={[{ label: "Mark All Read", primary: true, onClick: markAll }, { label: "Mute", to: "/notifications" }, { label: "Settings", to: "/settings" }, { label: "Open Notifications", to: "/notifications" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">SIGNAL · LIVE</p>
            <PulseWave color={URG} bars={18} height={36} />
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
          <button onClick={markAll} className="px-4 py-2 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-[10px] tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">Mark All Read</button>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">FEED · {items.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence initial={false}>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-sm">Geen notificaties.</p> : items.map(it => {
                const isRead = readIds.has(it.id);
                return (
                  <motion.div key={it.id} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setReadIds(s => new Set([...s, it.id]))}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ${isRead ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/10 hover:bg-marble/15"}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: (TYPES[it.type] || TYPES.info).c, opacity: isRead ? 0.4 : 1 }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isRead ? "text-storm/50" : "text-storm"}`}>{it.text}</p>
                      <p className="text-[10px] text-storm/40 mt-0.5">{(TYPES[it.type] || TYPES.info).l} · {it.time}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${(TYPES[it.type] || TYPES.info).c}22`, color: (TYPES[it.type] || TYPES.info).c }}>{(TYPES[it.type] || TYPES.info).l}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}