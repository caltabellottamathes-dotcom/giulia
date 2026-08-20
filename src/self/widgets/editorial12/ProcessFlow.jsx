import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

const ITEMS = [
  { label: "Ideëren", sub: "Breed verzamelen", time: "fase 1", milestone: true },
  { label: "Schetsen", sub: "Concept uitwerken", time: "fase 2" },
  { label: "Bouwen", sub: "Productie", time: "fase 3" },
  { label: "Testen", sub: "QA & feedback", time: "fase 4", milestone: true },
  { label: "Live", sub: "Oplevering", time: "fase 5", milestone: true },
];

/** ProcessFlow — glas-op-foto + interactief proces met vloeiende fasen. · 4:3 */
export default function ProcessFlow() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={PHOTOS4.handsMetal} onClick={() => openModule("projects")} aspectRatio="4 / 3" accent={PLUM} orientation="horizontal"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Proces · fasen</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">PROCES</h3></>}
      items={ITEMS} />
  );
}