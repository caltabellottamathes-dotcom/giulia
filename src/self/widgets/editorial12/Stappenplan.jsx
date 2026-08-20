import React from "react";
import TimelineCard from "./TimelineCard";
import { usePanel } from "@/lib/PanelContext";
import { PLUM } from "@/self/widgets/editorial/selfEditorial";
import { PHOTOS4 } from "@/self/widgets/editorial3/editorial3Data";

const ITEMS = [
  { label: "Onderzoek", sub: "Verzamel input", time: "1", milestone: true },
  { label: "Concept", sub: "Definieer richting", time: "2" },
  { label: "Goedkeuring", sub: "Klant akkoord", time: "3", milestone: true },
  { label: "Productie", sub: "Bouw het uit", time: "4" },
  { label: "Oplevering", sub: "In gebruik", time: "5", milestone: true },
];

/** Stappenplan — glas-op-foto + verticale interactieve stap-tijdlijn. · 3:4 */
export default function Stappenplan() {
  const { openModule } = usePanel();
  return (
    <TimelineCard photo={PHOTOS4.legsLacing} onClick={() => openModule("tasks")} aspectRatio="3 / 4" accent={PLUM} orientation="vertical"
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Stappenplan</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">STAPPEN</h3></>}
      title="Van idee naar oplevering" items={ITEMS} />
  );
}