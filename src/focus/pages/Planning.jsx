import React from "react";
import PageHero from "@/system/components/glass/PageHero";
import { CalendarDays } from "lucide-react";
import PlanningContent from "@/focus/components/agenda/PlanningContent";

export default function Planning() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="planning"
        icon={CalendarDays}
        eyebrow="Tijd"
        title="Planning"
        subtitle="Giulia organiseert je week automatisch"
      />
      <PlanningContent />
    </div>
  );
}