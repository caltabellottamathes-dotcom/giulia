import React from "react";
import CheckableShell, { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70";

/** Briefing met planning voor vandaag — geladen uit echte Task-records, afvinkbaar & sluitbaar. */
export default function DailyPlanSteps() {
  const c = useTaskChecklist();
  return <CheckableShell photo={PHOTO} title="Vandaag" subtitle="Briefing · planning" accent="hsl(var(--d-focus-light))" ratio="aspect-[4/5]" {...c} />;
}