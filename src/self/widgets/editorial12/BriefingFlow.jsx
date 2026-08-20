import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM, SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const ITEMS = [
  { label: "Weer", sub: "Vandaag zonnig", time: "1", milestone: true },
  { label: "Agenda", sub: "3 afspraken", time: "2" },
  { label: "Taken", sub: "5 prioriteiten", time: "3", milestone: true },
  { label: "Post", sub: "2 ongelezen", time: "4" },
  { label: "Doel", sub: "Dagintentie", time: "5", milestone: true },
];

/** BriefingFlow — glas-op-foto + interactieve ochtend-briefing tijdlijn. · 16:9 */
export default function BriefingFlow() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={SELF_PHOTO.wake} onClick={() => openModule("briefing")} aspectRatio="16 / 9" accent={PLUM} orientation="horizontal"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Briefing · ochtend</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BRIEFING</h3></>}
      items={ITEMS} />
  );
}