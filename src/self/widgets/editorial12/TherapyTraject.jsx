import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM, SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

const ITEMS = [
  { label: "Intake", sub: "Kennismaking", time: "1", milestone: true },
  { label: "Sessie 1", sub: "Doelen stellen", time: "2" },
  { label: "Sessie 5", sub: "Tussenreview", time: "3", milestone: true },
  { label: "Sessie 10", sub: "Diepgaand", time: "4" },
  { label: "Afsluiting", sub: "Evaluatie", time: "5", milestone: true },
];

/** TherapyTraject — glas-op-foto + verticale therapie-mijlpalen. · 3:4 */
export default function TherapyTraject() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={SELF_PHOTO.therapy} onClick={() => openModule("therapy")} aspectRatio="3 / 4" accent={PLUM} orientation="vertical"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Therapie · traject</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TRAJECT</h3></>}
      title="Sessie-mijlpalen" items={ITEMS} />
  );
}