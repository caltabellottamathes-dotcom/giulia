import React, { useMemo } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";

const DOW = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const SAND = "hsl(var(--d-life-light))";
const BLUE = "hsl(var(--d-life-deep))";

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
};

/** Social Planner widget — grote visuele kaart die antwoordt op:
 *  "Wat gebeurt er met mijn sociale plannen?" Dynamische headline + centrale
 *  week-visual (plannen als blocks, vrije dagen als negative space) + footer. */
export default function SocialPlannerWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: plans } = useEntityList("SocialPlan", { realtime: true, externalTick: learnTick });
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", realtime: true, externalTick: learnTick });

  const week = useMemo(() => {
    const start = startOfWeek();
    return DOW.map((label, i) => {
      const d = new Date(start.getTime() + i * 86400000);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d.getTime() + 86400000);
      const dayPlans = (plans || []).filter((p) => {
        const t = new Date(p.suggested_date || 0).getTime();
        return t >= d.getTime() && t < next && p.status !== "cancelled";
      });
      const busy = (events || []).some((e) => {
        const s = new Date(e.start).getTime();
        const en = new Date(e.end || e.start).getTime();
        return s < next && en > d.getTime() && e.domain !== "life";
      });
      return { label, date: d, plans: dayPlans, busy, open: !busy && dayPlans.length === 0 };
    });
  }, [plans, events]);

  const weekPlans = week.flatMap((d) => d.plans);
  const openInvites = weekPlans.filter((p) => p.status === "planned").length;
  const freeEvenings = week.filter((d) => d.open).length;
  const weekendOpen = week[5].open && week[6].open;

  const headline = weekendOpen ? "JOUW WEEKEND IS OPEN" : weekPlans.length >= 3 ? `${weekPlans.length} SOCIALE PLANNEN` : weekPlans.length > 0 ? "JE ZIET MENSEN" : "RUIMTE VOOR SOCIAAL";
  const sub = weekendOpen ? "Twee lege dagen wachten" : weekPlans.length > 0 ? "Deze week staat klaar" : "Nog niets gepland";
  const nextPlan = weekPlans.find((p) => p.status === "planned" || p.status === "confirmed");

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("social")} className="min-h-[260px]" style={{ "--tile-accent": BLUE }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="What Social Life?" count={weekPlans.length ? `${weekPlans.length} deze week` : "open"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>

        {/* Centrale week-visual */}
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {week.map((d, i) => {
            const hasPlan = d.plans.length > 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[8px] uppercase tracking-wider opacity-45 font-semibold">{d.label}</span>
                <div
                  className="relative w-full h-14 rounded-md flex flex-col items-center justify-center overflow-hidden"
                  style={hasPlan ? { background: SAND } : { border: `1px ${d.open ? "dashed" : "solid"} currentColor` }}
                >
                  {hasPlan ? (
                    <span className="text-charcoal text-[9px] font-semibold uppercase tracking-wide leading-tight text-center px-0.5 line-clamp-3">{d.plans[0].activity}</span>
                  ) : d.open ? (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "currentColor" }} />
                  ) : (
                    <span className="text-[8px] opacity-60">·</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.lifeSocialPlanner} className="h-20 w-full -mt-6 rounded-t-[24px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.28)]" overlay="bg-gradient-to-t from-charcoal/50 via-transparent to-transparent">
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/60 font-semibold">{weekPlans.length} plannen · {openInvites} open · {freeEvenings} vrij</p>
            <p className="text-sm font-semibold text-ivory truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              {nextPlan ? `${nextPlan.activity} · ${new Date(nextPlan.suggested_date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}` : "Geen plan deze week"}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); openModule("social"); }} className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold border border-ivory/30 text-ivory transition hover:bg-ivory/10 shrink-0">Open</button>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}