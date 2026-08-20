import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=70";
const STEPS = [
  { label: "Weekdoel stellen", sub: "maandag" },
  { label: "3 prioriteiten kiezen", sub: "focus" },
  { label: "Agenda blokken", sub: "plannen" },
  { label: "Eén moment vrij", sub: "herstel" },
  { label: "Terugblik zondag", sub: "review" },
];

export default function WeeklyGoalsSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Weekdoelen" subtitle="LIFE · plan" accent="hsl(var(--d-life-deep))" {...c} />;
}