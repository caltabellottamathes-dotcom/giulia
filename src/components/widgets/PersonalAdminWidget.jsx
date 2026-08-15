import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import AdminRadar from "@/components/life/AdminRadar";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { adminWeather, radarEvents, accentFor } from "@/lib/adminUtils";

/** Personal Admin widget — een administratief weerbericht. Lange portretvorm:
 *  poster-headline, centrale geanimeerde radar, drie grote cijfers onderaan.
 *  Kleur life-blue → life-sand (nadert) → urgent #d5e24a (te laat). */
export default function PersonalAdminWidget() {
  const { openModule } = usePanel();
  const { data: obs } = useEntityList("AdminObligation");
  const w = useMemo(() => adminWeather(obs || []), [obs]);
  const events = useMemo(() => radarEvents(obs || []), [obs]);
  const accent = w.counts.overdue > 0 ? "hsl(var(--urgent))" : w.counts.coming > 0 ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))";

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("personaladmin")} className="min-h-[320px]" style={{ "--tile-accent": accent }}>
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Personal Admin" count={w.counts.coming ? `${w.counts.coming} op komst` : "oké"} />
        <h3 className="text-[22px] leading-[1.04] font-display font-semibold tracking-[-0.02em] text-current">{w.headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{w.sub}</p>

        <div className="flex-1 flex items-center justify-center my-3">
          <AdminRadar events={events} size={150} tone="dark" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
          <Stat n={w.counts.coming} l="aandacht" c={accentFor(w.counts.overdue > 0 ? "urgent" : w.counts.coming > 0 ? "soon" : "later")} />
          <Stat n={`€${Math.round(w.counts.money)}`} l="op komst" c="hsl(var(--life-blue))" />
          <Stat n={w.counts.overdue} l="te laat" c={w.counts.overdue > 0 ? "hsl(var(--urgent))" : "hsl(var(--life-blue))"} />
        </div>
      </div>
    </WidgetShell>
  );
}

function Stat({ n, l, c }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-display font-semibold tabular-nums leading-none" style={{ color: c }}>{n}</p>
      <p className="text-[9px] uppercase tracking-wide opacity-50 mt-1">{l}</p>
    </div>
  );
}