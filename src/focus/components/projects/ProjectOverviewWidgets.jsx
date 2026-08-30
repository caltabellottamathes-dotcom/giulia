import React from "react";
import ProjectRenewCard from "@/focus/components/projects/widgets/ProjectRenewCard";
import OnderdeelProgressChart from "@/focus/components/projects/widgets/OnderdeelProgressChart";
import ProjectTrackerCard from "@/focus/components/projects/widgets/ProjectTrackerCard";
import ProjectSubDetailsPills from "@/focus/components/projects/widgets/ProjectSubDetailsPills";
import NewDocumentsCard from "@/life/components/finance/NewDocumentsCard";
import { weightedProgress, giuliaInterpret } from "@/lib/projectEngine";

/** ProjectOverviewWidgets — de project-Overview-bento in Focus-kleuren.
 *  Renew → over het project · wallets → voortgang per onderdeel · financial
 *  health → algemene project-tracker · income allocation → project sub
 *  details. Documents-kaart blijft staan. */
export default function ProjectOverviewWidgets({ project, tasks = [], themes = [] }) {
  const progress = weightedProgress(tasks, themes);
  const giulia = giuliaInterpret(project, tasks, themes);
  const urgent = project?.health === "attention" || project?.health === "critical";

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-[1.2] min-h-0 flex gap-4">
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
          <ProjectRenewCard project={project} tasks={tasks} />
        </div>
        <div className="h-full aspect-[3/2] shrink-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
          <OnderdeelProgressChart tasks={tasks} themes={themes} />
        </div>
      </div>
      <div className="flex-[1.5] flex gap-4 min-h-0">
        <div className="h-full aspect-square shrink-0 overflow-hidden rounded-[20px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.35)" }}>
          <ProjectTrackerCard progress={progress} insight={giulia.insight} urgent={urgent} />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.3)" }}>
          <NewDocumentsCard />
        </div>
      </div>
      <div className="flex-[0.5] min-h-0 overflow-hidden rounded-[18px]" style={{ boxShadow: "-14px 14px 36px -16px rgba(0,0,0,0.32)" }}>
        <ProjectSubDetailsPills tasks={tasks} themes={themes} />
      </div>
    </div>
  );
}