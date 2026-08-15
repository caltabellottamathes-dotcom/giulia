import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { timeBlockColor, timeBlockLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";

/** PersonalTimeWidget — "spatial time field". De dag als één doorlopende
 *  visuele structuur: werk/afspraken vullen ruimte, persoonlijke tijd
 *  verschijnt als open gekleurde ruimte. Beschermd = geankerd. */
export default function PersonalTimeWidget() {
  const { openModule } = usePanel();
  const { data: blocks } = useEntityList("PersonalTimeBlock", { realtime: true });
  const { data: events } = useEntityList("CalendarEvent", { realtime: true, sort: "start" });

  const dayMin = 8 * 60, dayMax = 23 * 60;
  const span = dayMax - dayMin;
  const toPct = (m) => Math.max(0, Math.min(100, ((m - dayMin) / span) * 100));
  const today = new Date().toDateString();

  const evBlocks = (events || []).filter((e) => e.start && new Date(e.start).toDateString() === today).map((e) => {
    const s = new Date(e.start); const en = new Date(e.end || e.start);
    return { type: "work", startM: s.getHours() * 60 + s.getMinutes(), endM: en.getHours() * 60 + en.getMinutes() };
  });
  const ptBlocks = (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").map((b) => {
    const s = new Date(b.start); const en = new Date(b.end || b.start);
    return { type: b.type, protected: b.is_protected, startM: s.getHours() * 60 + s.getMinutes(), endM: en.getHours() * 60 + en.getMinutes() };
  });
  const all = [...evBlocks, ...ptBlocks];
  const totalPT = ptBlocks.reduce((s, b) => s + Math.max(0, b.endM - b.startM), 0);
  const hh = Math.floor(totalPT / 60), mm = totalPT % 60;

  return (
    <WidgetShell size="wide" radius="large" interactive onClick={() => openModule("selfpersonaltime")}
      className="sm:col-span-2 lg:col-span-3 min-h-[240px]"
      style={{ background: "linear-gradient(150deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <div className="flex items-end justify-between">
          <div>
            <WidgetHeader label="Personal Time" />
            <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2">PERSONAL TIME</h3>
          </div>
          <div className="text-right">
            <p className="text-[40px] leading-none font-display font-semibold tabular-nums" style={{ color: SAGE }}>{String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1">vandaag over voor jou</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative h-10 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            {all.map((b, i) => {
              const left = toPct(b.startM); const width = Math.max(2, toPct(b.endM) - toPct(b.startM));
              const isPT = b.type !== "work";
              const c = isPT ? timeBlockColor(b.type) : "rgba(255,255,255,0.18)";
              return (
                <motion.div key={i} className="absolute top-0 h-full rounded-full origin-left"
                  style={{ left: `${left}%`, width: `${width}%`, background: c, border: b.protected ? `1px solid ${SAGE}` : "none" }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.05, duration: 0.6 }} />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[9px] uppercase tracking-wider opacity-40">
            <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:00</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] uppercase tracking-wider font-semibold">
          {["rest", "recovery", "free", "protected"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: timeBlockColor(t) }} />{timeBlockLabel(t)}</span>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}