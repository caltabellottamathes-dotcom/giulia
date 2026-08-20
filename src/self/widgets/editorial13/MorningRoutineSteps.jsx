import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=70";
const STEPS = [
  { label: "Opstaan · water", sub: "07:00" },
  { label: "Wakker-worden routine", sub: "07:10" },
  { label: "Dagintentie noteren", sub: "07:25" },
  { label: "Beweging · 10 min", sub: "07:35" },
  { label: "Briefing lezen", sub: "07:50" },
];

export default function MorningRoutineSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Ochtendroutine" subtitle="Wake · stap voor stap" accent="hsl(var(--ridge))" {...c} />;
}