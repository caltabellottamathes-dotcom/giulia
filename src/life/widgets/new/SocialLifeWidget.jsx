import React, { useMemo } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
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

/** SocialLifeWidget — skelet OVERGENOMEN van RemindersForHome (P·9x16·B·SIDE):
 *  PhotoShell (boven): header + headline + sub + interactie-telling.
 *  GlassShell (onder): 2×2 rooster van wachtende relaties. Data: Contact/Email/
 *  WhatsApp/SocialPlan. */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: plans } = useEntityList("SocialPlan", { realtime: true, externalTick: learnTick });

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const overdue = pulse.filter((p) => p.overdue).slice(0, 4);
  const overdueCount = pulse.filter((p) => p.overdue).length;

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const headline = interactions >= 10 ? "A LOT HAPPENING" : overdueCount > 3 ? "QUIETER THAN USUAL" : "CONNECTED";
  const sub = interactions >= 10 ? "Je sociale leven beweegt" : overdueCount > 3 ? "Enkele relaties doven uit" : "Je netwerk voelt warm";

  return (
    <div className="relative w-full h-[480px] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "56%", background: "linear-gradient(to bottom, rgba(0,0,0,0.36), rgba(0,0,0,0))" }}>
        <WidgetHeader type="social" label="What Social Life?" count={overdueCount ? `${overdueCount} wacht` : "bij"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{sub}</p>
        <div className="flex items-end gap-3 mt-auto">
          <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: overdueCount ? URGENT : LIGHT }}>{interactions}</span>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-55 mb-1 leading-tight">interacties<br />30 dagen</p>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[44%] bg-gradient-to-t from-black/45 via-black/18 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Relaties</span>
          <span className="text-[8px] uppercase tracking-[0.14em] text-right max-w-[55%] leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>{activePlans} plannen eraan</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {overdue.length === 0 ? (
            <div className="col-span-2 rounded-xl px-3 py-2.5 flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: LIGHT }} />
              <span className="text-[10px]" style={{ color: IVORY }}>Netwerk in balans</span>
            </div>
          ) : overdue.map((p) => (
            <div key={p.contact.id} className="rounded-xl px-3 py-2.5 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${URGENT}55` }}>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: URGENT }} />
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold truncate" style={{ color: IVORY }}>{p.contact.name}</span>
              </div>
              <span className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>{p.since}d wacht</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}