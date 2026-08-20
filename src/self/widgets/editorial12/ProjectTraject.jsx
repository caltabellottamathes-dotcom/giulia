import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

const ITEMS = [
  { label: "Start", sub: "Projectkickoff", time: "wk 1", milestone: true },
  { label: "Fase 1", sub: "Onderzoek & scope", time: "wk 2-3" },
  { label: "Fase 2", sub: "Bouw", time: "wk 4-6", milestone: true },
  { label: "Review", sub: "Testen & bijsturen", time: "wk 7" },
  { label: "Oplevering", sub: "Live gang", time: "wk 8", milestone: true },
];

/** ProjectTraject — glas-op-foto + interactieve project-mijlpalen. · 3:2 */
export default function ProjectTraject() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={PHOTOS4.greenTweed} onClick={() => openModule("projects")} aspectRatio="3 / 2" accent={PLUM} orientation="horizontal"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Project · traject</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">TRAJECT</h3></>}
      items={ITEMS} />
  );
}