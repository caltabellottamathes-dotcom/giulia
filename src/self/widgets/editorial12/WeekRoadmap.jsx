import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

const ITEMS = [
  { label: "MA", sub: "Kickoff", time: "start", milestone: true },
  { label: "DI", sub: "Design ronde 1", time: "concept" },
  { label: "WO", sub: "Review", time: "checkpoint", milestone: true },
  { label: "DO", sub: "Testen", time: "QA" },
  { label: "VR", sub: "Oplevering", time: "ship", milestone: true },
  { label: "ZA", sub: "Rust", time: "vrij" },
];

/** WeekRoadmap — glas-op-foto + interactieve week-roadmap met mijlpalen. · 16:9 */
export default function WeekRoadmap() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={PHOTOS4.galleryWalk} onClick={() => openModule("planning")} aspectRatio="16 / 9" accent={PLUM} orientation="horizontal"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Week · roadmap</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WEEK</h3></>}
      items={ITEMS} />
  );
}