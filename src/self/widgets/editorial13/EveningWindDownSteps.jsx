import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=70";
const STEPS = [
  { label: "Schermen uit", sub: "21:00" },
  { label: "Dagelijkse reflectie", sub: "3 zinnen" },
  { label: "Klaarzetten morgen", sub: "tas · kleding" },
  { label: "Lezen · 15 min", sub: "rust" },
  { label: "Lichten uit", sub: "22:30" },
];

export default function EveningWindDownSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Avond-afbouw" subtitle="SELF · wind-down" accent="hsl(var(--d-giulia-deep))" ratio="aspect-[4/5]" {...c} />;
}