import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM, SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const ITEMS = [
  { label: "Opstaan", sub: "07:00 · licht", time: "1", milestone: true },
  { label: "Ademruimte", sub: "4-7-8 ritueel", time: "2" },
  { label: "Stretch", sub: "5 min beweging", time: "3" },
  { label: "Lezen", sub: "10 min", time: "4" },
  { label: "Ontbijt", sub: "rustig", time: "5", milestone: true },
  { label: "Plannen", sub: "dag intentie", time: "6" },
];

/** RoutineSequence — glas-op-foto + verticale ochtend-routine tijdlijn. · 9:16 */
export default function RoutineSequence() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={SELF_PHOTO.routines} onClick={() => openModule("routines")} aspectRatio="9 / 16" accent={PLUM} orientation="vertical"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Routine · ochtend</p><h3 className="text-[24px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">ROUTINE</h3></>}
      title="Ochtendsequens" items={ITEMS} />
  );
}