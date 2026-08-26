import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedRing } from "@/glass/components/modules/viz";
import { LIFE, DARK } from "./socialColors";
import { CalendarHeart } from "lucide-react";

/** SocialSidebar — pulse-ring, meest urgente relatie-kaart, en de
 *  'What matters right now' / 'Upcoming plans' lijsten (zichtbaar op elke tab). */
export default function SocialSidebar({ mi, attention = [], activePlans = [] }) {
  const navigate = useNavigate();
  const top = attention[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[24px] p-5 flex flex-col items-center" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <AnimatedRing pct={Math.min(100, mi.total * 10)} size={120} color={LIFE.pistachio} label={String(mi.total)} sub="MEANINGFUL" />
      </div>

      {top && (
        <div className="rounded-[24px] p-4" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
          <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: LIFE.morningDew }}>Relationship card</p>
          <button onClick={() => navigate(`/people/${top.contact.id}`)} className="mt-2 flex items-center gap-2 text-left w-full">
            <span className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: LIFE.olive, color: "#141414" }}>{(top.contact.name || "?")[0]}</span>
            <span className="text-white text-sm font-medium truncate">{top.contact.name}</span>
          </button>
          <p className="text-[11px] text-white/45 mt-2">{top.since === Infinity ? "Never contacted" : `${top.since} days quiet`}</p>
        </div>
      )}

      <div className="rounded-[24px] p-4 flex-1" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-2" style={{ color: LIFE.morningDew }}>What matters right now</p>
        <div className="space-y-1.5">
          {attention.length ? attention.slice(0, 4).map((p) => (
            <div key={p.contact.id} className="flex items-center gap-2 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LIFE.urgent }} />
              <span className="text-white/80 truncate">{p.contact.name}</span>
            </div>
          )) : <p className="text-white/35 text-[12px] italic">Nothing urgent right now.</p>}
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] mt-4 mb-2" style={{ color: LIFE.morningDew }}>Upcoming plans</p>
        <div className="space-y-1.5">
          {activePlans.length ? activePlans.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-[12px]">
              <CalendarHeart className="h-3 w-3 shrink-0" style={{ color: LIFE.pistachio }} />
              <span className="text-white/70 truncate">{p.activity}</span>
            </div>
          )) : <p className="text-white/35 text-[12px] italic">No plans yet.</p>}
        </div>
      </div>
    </div>
  );
}