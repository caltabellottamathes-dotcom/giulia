import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusPeople;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";
const URGENT = "hsl(var(--d-focus-urgent))";

const GROUPS = [
  { key: "focus", label: "Focus", color: DEEP },
  { key: "life", label: "Life", color: LIGHT },
  { key: "self", label: "Self", color: NEUT },
];

const RING_COLORS = ["#b08968", "#a3b18a", "#8d99ae", "#cb997e", "#5e8b7e"];
const initials = (name) => (name || "?").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const colorFor = (name) => RING_COLORS[(name || "").charCodeAt(0) % RING_COLORS.length];

/** PeopleFocusWidget — P·2x3·B·SIDE · "People Around Me."
 *  Vergelijking contacten per relatie-domein (Focus/Life/Self) + lijst met
 *  contacten die aan een beurt zijn (overdue) met snelle actie. Klik op een
 *  contact opent People; WhatsApp-icoon opent WhatsApp-module. */
export default function PeopleFocusWidget() {
  const { openModule } = usePanel();
  const { data: contacts } = useEntityList("Contact", { sort: "-created_date", limit: 200, realtime: true });

  const { counts, total, overdue } = useMemo(() => {
    const all = contacts || [];
    const c = { focus: 0, life: 0, self: 0 };
    all.forEach((p) => { if (c[p.relationship_domain] != null) c[p.relationship_domain]++; });
    const now = Date.now();
    const od = all
      .map((p) => {
        const days = p.last_contact_date ? Math.floor((now - new Date(p.last_contact_date).getTime()) / 86400000) : null;
        const freq = p.desired_frequency_days || 30;
        return { ...p, days, overdueBy: days != null ? days - freq : null };
      })
      .filter((p) => p.overdueBy != null && p.overdueBy >= 0)
      .sort((a, b) => (b.overdueBy || 0) - (a.overdueBy || 0));
    return { counts: c, total: all.length, overdue: od };
  }, [contacts]);

  const max = Math.max(1, counts.focus, counts.life, counts.self);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget shape="2:3" photo={PHOTO} glassPosition="bottom" glassFraction={0.48} overhang={0} domain="focus" radius="large" onClick={() => openModule("people")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5">
        <div className="flex items-center justify-between">
          <WidgetHeader type="social" label="People Around Me." count={total ? String(total) : ""} />
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: overdue.length > 0 ? URGENT : LIGHT }}>{overdue.length} aan beurt</span>
        </div>

        {/* domein-vergelijking — compacte balken */}
        <div className="flex flex-col gap-2 mt-3">
          {GROUPS.map((g, i) => {
            const val = counts[g.key];
            const frac = val / max;
            return (
              <motion.button key={g.key} onClick={(e) => { e.stopPropagation(); openModule("people"); }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }} className="text-left">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--ivory))" }}>{g.label}</span>
                  <span className="text-[14px] font-display font-bold tabular-nums leading-none">{val}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }} style={{ backgroundColor: g.color }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* aan beurt — actiebare contacten */}
        <div className="mt-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/55">Aan beurt</span>
            {overdue.length > 0 && <span className="text-[9px] font-mono" style={{ color: URGENT }}>{overdue.length}</span>}
          </div>
          {overdue.length === 0 ? (
            <p className="text-[11px] text-ivory/45 py-1">Iedereen recent contact gehad.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {overdue.slice(0, 4).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                  className="flex items-center gap-2 rounded-xl py-1 px-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <button onClick={(e) => { e.stopPropagation(); openModule("people"); }} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                    <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-display font-bold"
                      style={{ background: "rgba(255,255,255,0.08)", color: "hsl(var(--ivory))", border: `1.5px solid ${colorFor(p.name)}` }}>
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: "hsl(var(--ivory))" }}>{p.name}</p>
                      <p className="text-[9px] uppercase tracking-wide leading-tight" style={{ color: p.overdueBy > 7 ? URGENT : "rgba(255,255,255,0.5)" }}>
                        {p.days} dagen geleden
                      </p>
                    </div>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openModule("whatsapp"); }} aria-label="WhatsApp"
                    className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition" style={{ background: DEEP, color: "hsl(var(--ivory))" }}>
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/50">Totaal</span>
          <CountUp value={total} className="text-[22px] font-display font-bold tabular-nums" />
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}