import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import PageHero from "@/system/components/glass/PageHero";
import ProjectEditorPanel from "@/focus/components/projects/ProjectEditorPanel";
import ProjectCard from "@/focus/components/projects/ProjectCard";
import { useEntityList } from "@/hooks/useEntity";
import { Plus, Briefcase } from "lucide-react";

const filters = ["Alle", "Active", "planning", "in_progress", "waiting", "completed", "archived"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Alle");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const { data: projects, loading, reload } = useEntityList("Project");

  const filteredProjects = projects.filter((p) => {
    return filter === "Alle" ? true : filter === "Active" ? (p.status === "in_progress" || p.status === "planning") : p.status === filter;
  });

  const openNew = () => { setEditorProject(null); setEditorOpen(true); };
  const openEdit = (p, e) => { e.stopPropagation(); setEditorProject(p); setEditorOpen(true); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="projects"
        icon={Briefcase}
        eyebrow="Werk"
        title="What I'm Building."
        subtitle="Jouw editoriale projectbibliotheek"
        actions={
          <GlassButton variant="primary" size="md" onClick={openNew}>
            <Plus className="h-4 w-4" /> Nieuw project
          </GlassButton>
        }
      />

      <div className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-display font-semibold">Alle projecten</h2>
        <p className="text-xs text-muted-foreground tabular-nums">{filteredProjects.length} projecten</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Status</span>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all capitalize", filter === f ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && [0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl shimmer" />)}
        {!loading && filteredProjects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} onOpen={(p) => navigate(`/projects/${p.id}`)} onEdit={openEdit} />
        ))}
      </div>

      {!loading && filteredProjects.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <p className="text-lg font-display font-medium text-muted-foreground">Geen projecten nog</p>
          <p className="text-sm text-muted-foreground mt-1">Jouw werkruimte wacht op het eerste project.</p>
          <GlassButton variant="primary" size="md" className="mt-4" onClick={openNew}><Plus className="h-4 w-4" /> Start een project</GlassButton>
        </GlassPanel>
      )}

      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={editorProject} onSaved={() => reload()} />
    </div>
  );
}