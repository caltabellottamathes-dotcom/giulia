import React, { useMemo } from "react";
import { WidgetHeader, CountUp, BarPulse } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { socialPulse } from "@/lib/domainUtils";

const PHOTO = IMAGES.lifeW1Social;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

/** SocialLifeWidget — G·16x9·R·SIDE · "What Social Life?"
 *  GlassCard (links): 8-weekse activiteitspuls + telling. PhotoCard (rechts):
 *  top wachtende relaties met dagen-sinds. Data: Contact/Email/WhatsApp/SocialPlan. */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: plans } = useEntityList("SocialPlan", { realtime: true, externalTick: learnTick });

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const overdue = pulse.filter((p) => p.overdue).slice(0, 3);
  const overdueCount = pulse.filter((p) => p.overdue).length;

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const weeks = useMemo(() => {
    const arr = Array.from({ length: 8 }, () => 0);
    const now = Date.now();
    [...(emails || []), ...(whatsapps || [])].forEach((x) => { if (!x.timestamp) return; const w = Math.floor((now - new Date(x.timestamp).getTime()) / (7 * 86400000)); if (w >= 0 && w < 8) arr[7 - w]++; });
    return arr;
  }, [emails, whatsapps]);

  const headline = interactions >= 10 ? "A LOT HAPPENING" : overdueCount > 3 ? "QUIETER THAN USUAL" : "CONNECTED";
  const sub = interactions >= 10 ? "Je sociale leven beweegt" : overdueCount > 3 ? "Enkele relaties doven uit" : "Je netwerk voelt warm";

  return (
    <div className="relative w-full h-[320px] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ "--tile-accent": DEEP, color: IVORY, cursor: "pointer" }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-4 z-10">
        <WidgetHeader type="social" label="What Social Life?" count={overdueCount ? `${overdueCount} wacht` : "bij"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{sub}</p>
        <div className="flex items-end gap-3 mt-3">
          <CountUp value={interactions} className="text-[52px] leading-[0.8] font-display font-semibold tabular-nums" />
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5 leading-tight">interacties<br />30 dagen</p>
        </div>
        <div className="flex-1" />
        <BarPulse values={weeks} height={34} />
        <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">8 weken activiteit</p>
      </div>

      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-black/30" />
        <span className="pointer-events-none absolute -bottom-5 -right-6 text-[110px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, opacity: 0.5 }}>{overdueCount}</span>
        <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ opacity: 0.8 }}>wacht op je</p>
          <div className="mt-1.5 space-y-1.5">
            {overdue.length === 0 ? (
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.65)" }}>Netwerk in balans</p>
            ) : overdue.map((p) => (
              <div key={p.contact.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />
                <span className="text-[12px] truncate flex-1">{p.contact.name}</span>
                <span className="text-[9px] tabular-nums" style={{ color: LIGHT }}>{p.since}d</span>
              </div>
            ))}
          </div>
          <p className="text-[8px] uppercase tracking-[0.18em] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>{activePlans} plannen eraan</p>
        </div>
      </div>
    </div>
  );
}