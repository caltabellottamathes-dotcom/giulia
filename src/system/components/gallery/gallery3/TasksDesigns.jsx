import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Taken: focusaantal vandaag, verdeling (te laat/vandaag/straks/
 * wacht), prioriteitslijst met snelle acties (voltooi/wacht/voor Giulia).
 * D2 "Energiebord" (4:3) — drie kolommen Nu / Wacht / Voor Giulia; taakkaart
 * per kolom, één tik voltooien. Focus: status-workflow + delegeren.
 * D3 "Deadline-lint" (3:4) — verticale stapel op prioriteit; elke rij een
 * deadline-lint dat krimpt, te-laat gloeit. Focus: deadline-druk + volgorde. */

export function TasksDesign2() {
  const { data: tasks, reload } = useEntityList("Task");
  const open = (tasks || []).filter((t) => ["today", "overdue", "upcoming", "waiting", "todo", "in_progress", "delegated"].includes(t.status));
  const cols = {
    Nu: open.filter((t) => ["today", "overdue", "todo", "in_progress"].includes(t.status)),
    Wacht: open.filter((t) => t.status === "waiting"),
    Giulia: open.filter((t) => t.status === "delegated" || t.delegated_to_giulia),
  };
  const done = async (t) => { try { await base44.entities.Task.update(t.id, { status: "completed" }); reload(); } catch {} };

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">To Do! · energiebord</p>
        <span className="text-[10px] tabular-nums opacity-50">{open.length} open</span>
      </div>
      <div className="grid grid-cols-3 gap-2 h-[calc(100%-2rem)]">
        {Object.entries(cols).map(([name, list], ci) => (
          <div key={name} className="glass-1 rounded-xl p-2 flex flex-col min-h-0">
            <p className="text-[9px] uppercase tracking-wider opacity-55 mb-1.5 px-1">{name} · {list.length}</p>
            <div className="flex-1 space-y-1.5 overflow-hidden">
              <AnimatePresence>
                {list.slice(0, 4).map((t, i) => (
                  <motion.button key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                    onClick={(e) => { e.stopPropagation(); done(t); }}
                    className="w-full text-left rounded-lg px-2 py-1.5 glass-2 hover:bg-white/10 transition">
                    <p className="text-[10px] font-medium leading-tight line-clamp-2">{t.title}</p>
                  </motion.button>
                ))}
              </AnimatePresence>
              {list.length === 0 && <p className="text-[9px] opacity-35 px-1">—</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksDesign3() {
  const { data: tasks, reload } = useEntityList("Task");
  const today = new Date();
  const ordered = (tasks || [])
    .filter((t) => ["overdue", "today", "todo", "in_progress"].includes(t.status))
    .sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1) || new Date(a.deadline || 0) - new Date(b.deadline || 0))
    .slice(0, 5);
  const daysLeft = (d) => d ? Math.ceil((new Date(d) - today) / 86400000) : null;

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("charcoal") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">To Do! · op deadline</p>
        <span className="text-[10px] tabular-nums opacity-50">{ordered.length} focus</span>
      </div>
      <div className="space-y-2">
        {ordered.map((t, i) => {
          const dl = daysLeft(t.deadline);
          const over = dl != null && dl < 0;
          const pct = dl == null ? 60 : Math.max(8, Math.min(100, 100 - (dl + 3) * 12));
          return (
            <motion.div key={t.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="relative glass-1 rounded-xl px-3 py-2 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0" style={{ width: `${pct}%`, background: over ? "hsl(var(--destructive)/0.25)" : "var(--tile-accent)", opacity: 0.3 }} />
              <div className="relative flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: over ? "hsl(var(--destructive))" : "var(--tile-accent)" }} />
                <p className="text-[11px] font-medium truncate flex-1">{t.title}</p>
                <span className={`text-[9px] tabular-nums font-semibold ${over ? "text-destructive" : "opacity-60"}`}>{dl == null ? "—" : over ? `${Math.abs(dl)}d te laat` : `${dl}d`}</span>
              </div>
            </motion.div>
          );
        })}
        {ordered.length === 0 && <p className="text-xs opacity-45 text-center mt-8">Alles gerond.</p>}
      </div>
    </div>
  );
}

export default { Design2: TasksDesign2, Design3: TasksDesign3 };