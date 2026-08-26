import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import ProjectEditorPanel from "@/focus/components/projects/ProjectEditorPanel";
import ProjectHeader from "@/focus/components/projects/ProjectHeader";
import ProjectNav from "@/focus/components/projects/ProjectNav";
import OverviewSection from "@/focus/components/projects/sections/OverviewSection";
import TasksSection from "@/focus/components/projects/sections/TasksSection";
import TimelineSection from "@/focus/components/projects/sections/TimelineSection";
import MilestonesSection from "@/focus/components/projects/sections/MilestonesSection";
import FilesSection from "@/focus/components/projects/sections/FilesSection";
import NotesSection from "@/focus/components/projects/sections/NotesSection";
import PeopleSection from "@/focus/components/projects/sections/PeopleSection";
import CommunicationSection from "@/focus/components/projects/sections/CommunicationSection";
import DecisionsSection from "@/focus/components/projects/sections/DecisionsSection";
import ActivitySection from "@/focus/components/projects/sections/ActivitySection";
import GiuliaSection from "@/focus/components/projects/sections/GiuliaSection";
import TimeSection from "@/focus/components/projects/sections/TimeSection";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("Overview");
  const [editorOpen, setEditorOpen] = useState(false);

  const load = async () => {
    try {
      const p = await base44.entities.Project.get(id);
      setProject(p);
      const [allTasks, allThemes] = await Promise.all([
        base44.entities.Task.list(),
        base44.entities.ProjectTheme.list(),
      ]);
      setTasks(allTasks.filter((t) => t.project_id === id));
      setThemes(allThemes.filter((t) => t.project_id === id).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch {
      /* not found */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  // Live-updates: herlaad het project + gekoppelde data zodra er iets
  // verandert (nieuwe email/whatsapp/document/notitie gekoppeld aan dit
  // project, taakwijzigingen, of het project zelf). Zo staat de projectpagina
  // altijd up-to-date zonder handmatig te vernieuwen.
  useEffect(() => {
    const unsubs = [];
    const reload = () => load();
    try { unsubs.push(base44.entities.Project.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Task.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.ProjectTheme.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Milestone.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Decision.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Email.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.WhatsAppMessage.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Document.subscribe(reload)); } catch { /* */ }
    try { unsubs.push(base44.entities.Note.subscribe(reload)); } catch { /* */ }
    return () => unsubs.forEach((u) => { try { u && u(); } catch { /* */ } });
  }, [id]);

  const updateProject = async (patch) => {
    await base44.entities.Project.update(id, patch);
    setProject((p) => ({ ...p, ...patch }));
  };
  const delProject = async () => {
    if (!window.confirm("Project verwijderen?")) return;
    await base44.entities.Project.delete(id);
    navigate("/");
  };

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;
  if (!project) return (
    <GlassPanel level={2} className="p-12 text-center">
      <p className="text-sm text-muted-foreground">Project niet gevonden</p>
      <GlassButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/")}>Terug</GlassButton>
    </GlassPanel>
  );

  return (
    <div className="-mt-6 lg:-mt-8">
      <ProjectHeader project={project} onUpdate={updateProject} onEdit={() => setEditorOpen(true)} onDelete={delProject} onBack={() => navigate("/")} />
      <div className="relative z-10 rounded-t-[28px] mt-[calc(50vh-4.5rem)] lg:mt-[calc(52vh-4.5rem)] px-4 lg:px-6 pt-4 pb-28 space-y-6 min-h-[60vh]">
        <div className="hidden lg:block">
          <ProjectNav active={section} onChange={setSection} variant="top" />
        </div>

        {section === "Overview" && <OverviewSection project={project} tasks={tasks} themes={themes} onNavigate={setSection} reload={load} />}
        {section === "Tasks" && <TasksSection project={project} tasks={tasks} themes={themes} reload={load} />}
        {section === "Timeline" && <TimelineSection project={project} tasks={tasks} />}
        {section === "Milestones" && <MilestonesSection project={project} themes={themes} />}
        {section === "Files" && <FilesSection project={project} tasks={tasks} />}
        {section === "Notes" && <NotesSection project={project} themes={themes} />}
        {section === "People" && <PeopleSection project={project} />}
        {section === "Communication" && <CommunicationSection project={project} />}
        {section === "Decisions" && <DecisionsSection project={project} themes={themes} />}
        {section === "Activity" && <ActivitySection project={project} />}
        {section === "Time" && <TimeSection project={project} tasks={tasks} />}
        {section === "Giulia" && <GiuliaSection project={project} tasks={tasks} reload={load} />}

        <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={project} onSaved={load} />
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40">
        <ProjectNav active={section} onChange={setSection} variant="bottom" />
      </div>
    </div>
  );
}