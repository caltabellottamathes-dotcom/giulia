import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

const ITEMS = [
  { label: "09:00", sub: "Standup team", time: "30m" },
  { label: "10:30", sub: "Focus-blok schrijven", time: "2u", milestone: true },
  { label: "12:30", sub: "Lunchpauze", time: "45m" },
  { label: "14:00", sub: "Belafspraak Johan", time: "1u", milestone: true },
  { label: "16:00", sub: "Review & afsluiten", time: "30m" },
];

/** AgendaDag — glas-op-foto + interactieve dag-tijdlijn. · 3:2 */
export default function AgendaDag() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={PHOTOS4.suitChairs} onClick={() => openModule("agenda")} aspectRatio="3 / 2" accent={PLUM} orientation="horizontal"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Agenda · vandaag</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">VANDAAG</h3></>}
      items={ITEMS} />
  );
}