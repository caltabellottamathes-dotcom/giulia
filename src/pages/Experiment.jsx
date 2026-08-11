import React from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "@/components/glass/PageHero";
import ProgressGauge from "@/components/experiment/ProgressGauge";
import StorageGauge from "@/components/experiment/StorageGauge";
import StatCardSet from "@/components/experiment/StatCardSet";
import TimeTrackerWidget from "@/components/widgets/TimeTrackerWidget";
import AgentActivityWidget from "@/components/widgets/AgentActivityWidget";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { FlaskConical, Share2 } from "lucide-react";

const DONE = ["completed", "done", "klaar"];
const ACTIVE_PROJ = ["in_progress", "planning", "afwerking", "review"];

export default function Experiment() {
  const { data: tasks, loading } = useEntityList("Task");
  const { data: projects } = useEntityList("Project");
  const { data: emails } = useEntityList("Email");
  const navigate = useNavigate();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = (t) => {
    if (t.status === "today") return true;
    if (t.deadline) { const d = new Date(t.deadline); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime(); }
    return false;
  };
  const isDone = (t) => DONE.includes(t.status);
  const isOverdue = (t) => {
    if (isDone(t)) return false;
    if (!t.deadline) return false;
    const d = new Date(t.deadline); d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  const todays = tasks.filter(isToday);
  const completed = todays.filter(isDone).length;
  const total = todays.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const open = Math.max(0, total - completed);

  const emailTotal = emails.length;
  const triaged = emails.filter((e) => e.triaged).length;
  const emailPct = emailTotal ? Math.round((triaged / emailTotal) * 100) : 0;

  const totalTasks = tasks.length;
  const overdue = tasks.filter(isOverdue).length;
  const totalProj = projects.length;
  const activeProj = projects.filter((p) => ACTIVE_PROJ.includes(p.status)).length;
  const planningProj = projects.filter((p) => p.status === "planning").length;

  const cards = [
    {
      chip: "Taken vandaag",
      value: completed,
      unit: "voltooid",
      pct,
      goalStrong: `${pct}%`,
      goal: `van ${total} vandaag`,
      trend: `${open} open`,
      trendUp: open === 0,
    },
    {
      chip: "Projecten",
      value: activeProj,
      unit: "actief",
      pct: totalProj ? Math.round((activeProj / totalProj) * 100) : 0,
      goalStrong: `${totalProj ? Math.round((activeProj / totalProj) * 100) : 0}%`,
      goal: `van ${totalProj} projecten`,
      trend: `${planningProj} in planning`,
      trendUp: activeProj > 0,
    },
    {
      chip: "Te laat",
      value: overdue,
      unit: "taken",
      pct: totalTasks ? Math.round((overdue / totalTasks) * 100) : 0,
      goalStrong: `${totalTasks ? Math.round((overdue / totalTasks) * 100) : 0}%`,
      goal: `van ${totalTasks} taken`,
      trend: overdue > 0 ? "aandacht" : "op schema",
      trendUp: overdue === 0,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      <PageHero
        page="experiment"
        image={IMAGES.feetChair}
        icon={FlaskConical}
        eyebrow="Lab"
        title="Experiment"
        subtitle="Visuele proeven en prototypes"
      />
      <div className="max-w-[820px] mx-auto grid md:grid-cols-2 gap-6 items-start">
        <ProgressGauge
          image={IMAGES.feetChairs}
          label="Vandaag"
          count={loading ? "—" : `${completed}/${total}`}
          percent={loading ? 0 : pct}
          title="Dagvoortgang"
          subtitle={loading ? "Laden…" : (total ? `${completed} / ${total} voltooid` : "Geen taken vandaag")}
          pillLabel={loading ? "—" : `${open} open`}
          onPillClick={() => navigate("/tasks")}
          actionIcon={Share2}
          onAction={() => navigate("/tasks")}
          onClick={() => navigate("/tasks")}
        />
        <StorageGauge
          image={IMAGES.portraitBoot}
          label="Inbox"
          count={loading ? "—" : `${triaged}/${emailTotal}`}
          heading="Inbox gesorteerd"
          percent={emailPct}
          detail={`${triaged} van ${emailTotal} emails`}
          onClick={() => navigate("/email")}
        />
        <TimeTrackerWidget />
        <StatCardSet
          cards={cards}
          image={IMAGES.notebookChair}
          label="Productiviteit"
          count={`${activeProj}`}
          onHeaderClick={() => navigate("/planning")}
        />
      </div>
      <div className="max-w-[820px] mx-auto">
        <AgentActivityWidget />
      </div>
    </div>
  );
}