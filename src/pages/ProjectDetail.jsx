import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    <div className="-mt-6 lg:-mt-8">
      <ProjectHeader project={project} onUpdate={updateProject} onEdit={() => setEditorOpen(true)} onDelete={delProject} onBack={() => navigate("/projects")} />
      <div className="px-4 lg:px-6 pt-6 pb-28 space-y-6">
        <div className="hidden lg:block">
          <ProjectNav active={section} onChange={setSection} variant="top" />
        </div>

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

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40">
        <ProjectNav active={section} onChange={setSection} variant="bottom" />
      </div>
    </div>
  );
}