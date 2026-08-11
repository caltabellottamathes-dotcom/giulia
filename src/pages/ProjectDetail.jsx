import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectNav from "@/components/projects/ProjectNav";
import OverviewSection from "@/components/projects/sections/OverviewSection";
import TasksSection from "@/components/projects/sections/TasksSection";
import TimelineSection from "@/components/projects/sections/TimelineSection";
import MilestonesSection from "@/components/projects/sections/MilestonesSection";
import FilesSection from "@/components/projects/sections/FilesSection";
import NotesSection from "@/components/projects/sections/NotesSection";
import PeopleSection from "@/components/projects/sections/PeopleSection";
import CommunicationSection from "@/components/projects/sections/CommunicationSection";
import DecisionsSection from "@/components/projects/sections/DecisionsSection";
import ActivitySection from "@/components/projects/sections/ActivitySection";
import GiuliaSection from "@/components/projects/sections/GiuliaSection";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("Overview");
  const [editorOpen, setEditorOpen] = useState(false);

  const load = async () => {
    try {
      const p = await base44.entities.Project.get(id);
      setProject(p);
      const allTasks = await base44.entities.Task.list();
      setTasks(allTasks.filter((t) => t.project_id === id));
    } catch {
      /* not found */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const updateProject = async (patch) => {
    await base44.entities.Project.update(id, patch);
    setProject((p) => ({ ...p, ...patch }));
  };
  const delProject = async () => {
    if (!window.confirm("Project verwijderen?")) return;
    await base44.entities.Project.delete(id);
    navigate("/projects");
  };

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;
  if (!project) return (
    <GlassPanel level={2} className="p-12 text-center">
      <p className="text-sm text-muted-foreground">Project niet gevonden</p>
      <GlassButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/projects")}>Terug</GlassButton>
    </GlassPanel>
  );

  return (
    <div className="animate-fade-up">
      <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar projecten
      </button>

      <ProjectHeader project={project} onUpdate={updateProject} onEdit={() => setEditorOpen(true)} onDelete={delProject} />
      <div className="relative z-10 rounded-t-[28px] -mt-4 px-4 lg:px-6 pt-7 pb-28 space-y-6 min-h-[60vh] bg-background/45 backdrop-blur-2xl">
        {section === "Overview" && <OverviewSection project={project} tasks={tasks} onNavigate={setSection} reload={load} />}
        {section === "Tasks" && <TasksSection project={project} tasks={tasks} reload={load} />}
        {section === "Timeline" && <TimelineSection project={project} tasks={tasks} />}
        {section === "Milestones" && <MilestonesSection project={project} />}
        {section === "Files" && <FilesSection project={project} tasks={tasks} />}
        {section === "Notes" && <NotesSection project={project} />}
        {section === "People" && <PeopleSection project={project} />}
        {section === "Communication" && <CommunicationSection project={project} />}
        {section === "Decisions" && <DecisionsSection project={project} />}
        {section === "Activity" && <ActivitySection project={project} />}
        {section === "Giulia" && <GiuliaSection project={project} tasks={tasks} reload={load} />}

        <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={project} onSaved={load} />
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40">
        <ProjectNav active={section} onChange={setSection} variant="bottom" />
      </div>
    </div>
  );
}