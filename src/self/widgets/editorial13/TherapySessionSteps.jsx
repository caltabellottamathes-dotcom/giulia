import React from "react";
import CheckableShell, { useChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&q=70";
const STEPS = [
  { label: "Aankomen · ademen", sub: "5 min着陆" },
  { label: "Sessiedoel benoemen", sub: "wat staat centraal" },
  { label: "Verhaal & oefening", sub: "kern van de sessie" },
  { label: "Terugblik & huiswerk", sub: "afspraak volgende" },
];

export default function TherapySessionSteps() {
  const c = useChecklist(STEPS);
  return <CheckableShell photo={PHOTO} title="Therapie-sessie" subtitle="SELF · traject" accent="hsl(var(--self-burgundy))" {...c} />;
}