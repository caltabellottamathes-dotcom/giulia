import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70";
const STEPS = [
  { label: "Kickoff & scope", sub: "fase 1" },
  { label: "Onderzoek af", sub: "fase 2" },
  { label: "Bouw compleet", sub: "fase 3" },
  { label: "Testen doorlopen", sub: "fase 4" },
  { label: "Oplevering", sub: "mijlpaal" },
];

export default function ProjectMilestonesSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Mijlpalen" subtitle="Project · traject" accent="hsl(var(--olive))" ratio="aspect-[4/5]" {...c} />;
}