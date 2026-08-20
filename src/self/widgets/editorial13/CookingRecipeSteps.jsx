import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=70";
const STEPS = [
  { label: "Voorbereiden & snijden", sub: "10 min" },
  { label: "Basis aanbraden", sub: "5 min" },
  { label: "Saus & smaak", sub: "8 min" },
  { label: "Gaar trekken", sub: "12 min" },
  { label: "Opmaak & serveren", sub: "klaar" },
];

export default function CookingRecipeSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Recept vanavond" subtitle="FOOD · stappenplan" accent="hsl(var(--sand))" {...c} />;
}