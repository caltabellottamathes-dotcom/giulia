import React from "react";
import PageHero from "@/components/glass/PageHero";
import DayWidget from "@/components/widgets/DayWidget";
import EmailWidget from "@/components/widgets/EmailWidget";
import AgentActivityWidget from "@/components/widgets/AgentActivityWidget";
import TimeTrackerWidget from "@/components/widgets/TimeTrackerWidget";
import { IMAGES } from "@/lib/images";
import { FlaskConical } from "lucide-react";

export default function Experiment() {
  return (
    <div className="space-y-10 animate-fade-up">
      <PageHero
        page="experiment"
        image={IMAGES.feetChair}
        icon={FlaskConical}
        eyebrow="Lab"
        title="Experiment"
        subtitle="Echte widgets — gelaagd glas, met onderdeelpaneel"
      />
      <div className="max-w-[860px] mx-auto grid md:grid-cols-2 gap-6">
        <DayWidget />
        <EmailWidget />
        <AgentActivityWidget />
        <TimeTrackerWidget />
      </div>
    </div>
  );
}