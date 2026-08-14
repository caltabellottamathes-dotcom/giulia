import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";

const BLUE = "hsl(var(--life-blue))";
const BLUE_SOFT = "hsl(var(--life-blue-soft))";

const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; };
const endOfWeek = () => { const d = startOfWeek(); d.setDate(d.getDate() + 7); return d; };

/** Social Planner widget — sociale plannen deze week + open weekend + suggestie. */
export default function SocialPlannerWidget() {
  const { openModule } = usePanel();
  const { data: plans, loading } = useEntityList("SocialPlan");
  const { data: contacts } = useEntityList("Contact");

  const weekPlans = useMemo(() => {
    const s = startOfWeek().getTime(), e = endOfWeek().getTime();
    return (plans || []).filter((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= s && t < e && p.status !== "cancelled"; });
  }, [plans]);

  const suggestion = useMemo(() => {
    const top = socialPulse(contacts).find((p) => p.overdue);
    if (!top) return null;
    const weeks = Math.round(top.since / 7);
    return { name: top.contact.name, weeks };
  }, [contacts]);

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("socialplanner")} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.twoChairsSand} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/80 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Social Planner</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums" style={{ color: BLUE_SOFT }}>{weekPlans.length} deze week</span>
          </div>
        </div>
        <div className="flex-1 -mt-8 rounded-t-[24px] glass-3 p-5 relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : (
            <div className="flex-1 flex flex-col gap-3">
              {weekPlans.length ? (
                weekPlans.slice(0, 2).map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BLUE }} />
                    <p className="text-sm font-medium truncate flex-1">{p.activity}</p>
                    <span className="text-[10px] text-ivory/45">{p.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-ivory/55">Nog geen plannen deze week</p>
              )}
              {suggestion && (
                <p className="mt-auto text-[12px] leading-snug pt-3 border-t border-ivory/10" style={{ color: BLUE_SOFT }}>
                  Giulia: je hebt <span className="font-semibold">{suggestion.name}</span> al {suggestion.weeks > 0 ? `${suggestion.weeks} week${suggestion.weeks !== 1 ? "en" : ""}` : "even"} niet gezien.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}