import React, { useMemo } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import CountUp from "../../system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";

const BLUE = "hsl(var(--d-life-deep))";

/** Social Pulse widget — een grote visuele informatiekaart, geen lijstje.
 *  Dynamische headline + centraal getal + 8-weekse activiteitstimeline +
 *  brand photo onderaan. Eén klikbaar object → Social Pulse panel. */
export default function SocialPulseWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: plans } = useEntityList("SocialPlan", { realtime: true, externalTick: learnTick });

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const overdue = pulse.filter((p) => p.overdue);

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const headline = interactions >= 10 ? "A LOT HAPPENING" : overdue.length > 3 ? "QUIETER THAN USUAL" : "CONNECTED";
  const sub = interactions >= 10 ? "Je sociale leven beweegt" : overdue.length > 3 ? "Enkele relaties doven uit" : "Je netwerk voelt warm";
  const topPerson = overdue[0]?.contact;

  const weeks = useMemo(() => {
    const arr = Array.from({ length: 8 }, () => 0);
    const now = Date.now();
    [...(emails || []), ...(whatsapps || [])].forEach((x) => { if (!x.timestamp) return; const w = Math.floor((now - new Date(x.timestamp).getTime()) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w]++; });
    return arr;
  }, [emails, whatsapps]);
  const maxW = Math.max(1, ...weeks);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("social")} className="min-h-[260px]" style={{ "--tile-accent": BLUE }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="What Social Life?" count={overdue.length ? `${overdue.length} wacht` : "bij"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>

        <div className="mt-4 flex items-end gap-4">
          <CountUp value={interactions} className="text-[60px] leading-[0.85] font-display font-semibold tracking-[-0.04em] text-current" />
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3 max-w-[84px] leading-tight">meaningful interactions</p>
        </div>

        <div className="mt-4 flex items-end gap-1.5 h-10">
          {weeks.map((v, i) => (
            <span key={i} className="flex-1 rounded-full transition-all duration-700" style={{ height: `${Math.max(8, (v / maxW) * 100)}%`, background: v ? "var(--tile-accent)" : "currentColor", opacity: v ? 0.9 : 0.12 }} />
          ))}
        </div>

        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.lifeSocialPulse} className="h-20 w-full -mt-6 rounded-t-[24px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.28)]" overlay="bg-gradient-to-t from-charcoal/50 via-transparent to-transparent">
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/60 font-semibold">{activePlans} plannen · {overdue.length} aandacht</p>
            <p className="text-sm font-semibold text-ivory truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{topPerson ? topPerson.name : "Netwerk in balans"}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); openModule("social"); }} className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold border border-ivory/30 text-ivory transition hover:bg-ivory/10 shrink-0">Open</button>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}