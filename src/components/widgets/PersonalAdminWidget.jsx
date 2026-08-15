import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import AdminTimeline from "@/components/life/AdminTimeline";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { adminWeather, radarEvents, accentFor } from "@/lib/adminUtils";

/** Personal Admin widget — lang portret: foto-header (admin finance), poster-
 *  status, heldere deadline-tijdlijn (i.p.v. abstracte radar) en drie grote
 *  cijfers. Kleur life-blue → life-sand → urgent #d5e24a. */
export default function PersonalAdminWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });
  const w = useMemo(() => adminWeather(obs || []), [obs]);
  const events = useMemo(() => radarEvents(obs || []), [obs]);
  const accent = w.counts.overdue > 0 ? "hsl(var(--urgent))" : w.counts.coming > 0 ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))";

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("personaladmin")} className="min-h-[340px]" style={{ "--tile-accent": accent }}>
      <div className="flex flex-col h-full">
        <div className="relative h-16 shrink-0 overflow-hidden rounded-t-[28px]">
          <img src={IMAGES.lifePersonalAdmin} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
          <div className="absolute inset-0 px-5 flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/85">Personal Admin</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] tabular-nums font-semibold" style={{ color: accent }}>{w.counts.coming ? `${w.counts.coming} op komst` : "oké"}</span>
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col">
          <h3 className="text-[22px] leading-[1.02] font-display font-semibold tracking-[-0.02em] text-current">{w.headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">{w.sub}</p>
          <div className="flex-1 my-3">
            <AdminTimeline events={events} max={4} tone="dark" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <Stat n={w.counts.coming} l="aandacht" c={accentFor(w.counts.overdue > 0 ? "urgent" : w.counts.coming > 0 ? "soon" : "later")} />
            <Stat n={`€${Math.round(w.counts.money)}`} l="op komst" c="hsl(var(--life-blue))" />
            <Stat n={w.counts.overdue} l="te laat" c={w.counts.overdue > 0 ? "hsl(var(--urgent))" : "hsl(var(--life-blue))"} />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

function Stat({ n, l, c }) {
  return (
    <div className="text-center">
      <p className="text-xl font-display font-semibold tabular-nums leading-none" style={{ color: c }}>{n}</p>
      <p className="text-[9px] uppercase tracking-wide opacity-50 mt-1">{l}</p>
    </div>
  );
}