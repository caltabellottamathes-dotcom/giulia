import React from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "@/components/glass/PageHero";
import ProgressGauge from "@/components/experiment/ProgressGauge";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { FlaskConical, Share2 } from "lucide-react";

const DONE = ["completed", "done", "klaar"];

export default function Experiment() {
  const { data: tasks, loading } = useEntityList("Task");
  const navigate = useNavigate();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = (t) => {
    if (t.status === "today") return true;
    if (t.deadline) { const d = new Date(t.deadline); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime(); }
    return false;
  };
  const todays = tasks.filter(isToday);
  const completed = todays.filter((t) => DONE.includes(t.status)).length;
  const total = todays.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const open = Math.max(0, total - completed);

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHero
        page="experiment"
        image={IMAGES.feetChair}
        icon={FlaskConical}
        eyebrow="Lab"
        title="Experiment"
        subtitle="Visuele proeven en prototypes"
      />
      <div className="flex justify-center">
        <ProgressGauge
          image={IMAGES.feetChair}
          label="Vandaag"
          percent={loading ? 0 : pct}
          title="Dagvoortgang"
          subtitle={loading ? "Laden…" : (total ? `${completed} / ${total} voltooid` : "Geen taken vandaag")}
          pillLabel={loading ? "—" : `${open} open`}
          onPillClick={() => navigate("/tasks")}
          actionIcon={Share2}
          onAction={() => navigate("/tasks")}
        />
      </div>
    </div>
  );
}