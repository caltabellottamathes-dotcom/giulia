import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { CountUp, MiniStat } from "@/system/widgets/primitives";
import Avatar from "@/system/components/glass/Avatar";
import { daysSince, ORBIT_TIERS, orbitTier, RELATIONSHIP_LABEL, contactRecentTrend } from "@/lib/domainUtils";

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[176px]";
const IVORY = "hsl(var(--ivory))";

const STATE_ORDER = ["ACTIVE", "CLOSE", "QUIET", "QUIETER_THAN_USUAL", "EMERGING", "RECONNECTING", "CHANGING", "UNKNOWN"];

/** RelationshipsSection — §2 close-circle orbit + relationship states, als bento. */
export default function RelationshipsSection({ d, circle, pulse, attention, onOpenPerson }) {
  const orbit = useMemo(() => [...circle].sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 8).map((c, i) => { const days = daysSince(c.last_contact_date); const tier = orbitTier(days); const a = (i / Math.max(circle.length, 1)) * 360 - 90; return { c, days, r: tier.r, color: tier.color, a }; }), [circle]);
  const states = useMemo(() => { const m = {}; circle.forEach((c) => { const s = c.relationship_state || "UNKNOWN"; m[s] = (m[s] || 0) + 1; }); return STATE_ORDER.filter((s) => m[s]).map((s) => ({ s, n: m[s] })); }, [circle]);
  const changes = useMemo(() => circle.map((c) => ({ c, trend: contactRecentTrend(c.id, d.whatsapps) })).filter((x) => x.trend !== "steady").slice(0, 4), [circle, d.whatsapps]);

  return (
    <div className={GRID}>
      {/* ORBIT — large */}
      <WidgetShell size="2x2" radius="large" domain="life" className="col-span-2 row-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Close Circle" type="social" count={`${circle.length}`} />
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[200px] aspect-square">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {ORBIT_TIERS.map((t, i) => <circle key={i} cx="50" cy="50" r={t.r} fill="none" stroke={IVORY} strokeWidth="0.4" opacity={0.08 + i * 0.018} strokeDasharray="1.4 2.2" />)}
                {orbit.map((o, i) => { const rad = (o.a * Math.PI) / 180; const x = 50 + Math.cos(rad) * o.r; const y = 50 + Math.sin(rad) * o.r; const op = o.days <= 7 ? 0.95 : o.days <= 14 ? 0.6 : o.days <= 30 ? 0.42 : 0.28; return (<g key={i}><line x1="50" y1="50" x2={x} y2={y} stroke={o.color} strokeWidth="0.7" opacity={op} /><circle cx={x} cy={y} r="2.6" fill={o.color} /></g>); })}
              </svg>
              {orbit.map((o, i) => { const rad = (o.a * Math.PI) / 180; const x = 50 + Math.cos(rad) * o.r; const y = 50 + Math.sin(rad) * o.r; return (
                <motion.button key={i} onClick={() => onOpenPerson?.(o.c)} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, color: IVORY }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
                  <span className="text-[10px] font-bold whitespace-nowrap leading-none">{o.c.name.split(" ")[0]}</span>
                  <span className="text-[8px] mt-0.5" style={{ color: o.color }}>{o.days === Infinity ? "—" : `${o.days}d`}</span>
                </motion.button>
              ); })}
            </div>
          </div>
        </div>
      </WidgetShell>

      {/* TOTAL */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="People" type="social" /><div className="mt-auto"><MiniStat label="in circle" value={circle.length} /></div></div>
      </WidgetShell>

      {/* ATTENTION */}
      <WidgetShell size="1x1" radius="medium" domain="life" style={attention.length ? { "--tile-accent": "hsl(var(--giulia-urgent))" } : undefined}>
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Attention" type="pulse" count={attention.length || ""} /><div className="mt-auto">{attention.length ? <p className="text-3xl font-display font-semibold tabular-nums"><CountUp value={attention.length} /></p> : <p className="text-sm opacity-55">In rhythm</p>}</div></div>
      </WidgetShell>

      {/* STATES */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Relationship States" type="social" />
          <div className="mt-2 space-y-2 overflow-hidden">
            {states.length ? states.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wide opacity-55 w-28 truncate">{RELATIONSHIP_LABEL[s] || s}</span>
                <div className="flex-1 h-1.5 rounded-full bg-current/10 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(n / circle.length) * 100}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full" style={{ background: "var(--tile-accent)" }} /></div>
                <span className="text-[11px] tabular-nums opacity-60 w-5 text-right">{n}</span>
              </div>
            )) : <p className="text-sm opacity-45">No states computed</p>}
          </div>
        </div>
      </WidgetShell>

      {/* CHANGES */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Notable Changes" type="pulse" />
          <div className="mt-2 flex flex-wrap gap-2 overflow-hidden">
            {changes.length ? changes.map(({ c, trend }) => (
              <button key={c.id} onClick={() => onOpenPerson?.(c)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px]" style={{ background: "rgba(255,255,255,0.08)" }}>
                <span className={trend === "up" ? "text-olive" : "text-urgent"}>{trend === "up" ? "↑" : "↓"}</span>
                <span className="truncate max-w-[120px]">{c.name}</span>
                <span className="opacity-50">{trend === "up" ? "more active" : "quieter"}</span>
              </button>
            )) : <p className="text-sm opacity-45">Steady across the board</p>}
          </div>
        </div>
      </WidgetShell>
    </div>
  );
}