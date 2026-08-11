import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import CountUp from "./CountUp";
import DialGauge from "./DialGauge";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const DONE = ["completed", "done", "klaar"];
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

/**
 * DayWidget — "Je dag": a layered photo floats over the top of the glass (foto
 * boven), then a DialGauge shows the day's progress with a moving knob, and
 * three productivity stats sit at the bottom. Tap → tasks onderdeelpaneel.
 */
export default function DayWidget() {
  const { openModule } = usePanel();
  const { data: tasks, loading } = useEntityList("Task");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = (t) => t.status === "today" || (t.deadline && new Date(t.deadline).setHours(0, 0, 0, 0) === today.getTime());
  const isDone = (t) => DONE.includes(t.status);
  const isOverdue = (t) => !isDone(t) && t.deadline && new Date(t.deadline).setHours(0, 0, 0, 0) < today.getTime();

  const todays = tasks.filter(isToday);
  const completed = todays.filter(isDone).length;
  const total = todays.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const open = Math.max(0, total - completed);
  const overdue = tasks.filter(isOverdue).length;

  const stats = [
    { label: "Voltooid", value: completed },
    { label: "Open", value: open },
    { label: "Te laat", value: overdue },
  ];

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("tasks")} className="min-h-[380px]">
      <div className="flex flex-col h-full">
        <BrandPhoto
          src={IMAGES.feetChairs}
          className="h-28 -mb-8 rounded-b-[24px] z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)]"
          overlay="bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent"
        >
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Giulia · je dag</p>
              <p className="text-lg font-display font-semibold text-ivory mt-0.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{greeting()}.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-ivory tabular-nums leading-none">{loading ? "—" : `${pct}%`}</span>
              <p className="text-[10px] uppercase tracking-wider text-ivory/60 mt-1">voortgang</p>
            </div>
          </div>
        </BrandPhoto>

        <div className="flex-1 p-5 pt-10 flex flex-col text-current min-h-0">
          <WidgetHeader label="Je dag" count={loading ? "—" : `${completed}/${total}`} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="flex justify-center py-2">
                <DialGauge percent={pct} size={150} stroke={14} />
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2">
                {stats.map((s) => (
                  <div key={s.label} className="glass-1 rounded-xl px-2 py-2.5 text-center">
                    <CountUp value={s.value} className="text-2xl font-display font-semibold leading-none" />
                    <p className="text-[9px] uppercase tracking-wider opacity-50 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}