import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&q=70";
const STEPS = [
  { label: "Telefoon weg · notities klaar", sub: "0 min" },
  { label: "Eén taak kiezen", sub: "defineer einddoel" },
  { label: "90 min diep werken", sub: "geen onderbrekingen" },
  { label: "Korte retrofit & log", sub: "wat werkte" },
];

export default function FocusBlockSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Focus-blok" subtitle="Diep werk" accent="hsl(var(--self-accent))" {...c} />;
}