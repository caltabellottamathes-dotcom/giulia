import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import PageHero from "@/components/glass/PageHero";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { Plus, Briefcase, Pencil } from "lucide-react";

const filters = ["Active", "planning", "in_progress", "waiting", "completed", "archived"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Active");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const { data: projects, loading, reload } = useEntityList("Project");

  const filteredProjects = projects.filter((p) => {
    if (filter === "Active") return p.status === "in_progress" || p.status === "planning";
    return p.status === filter;
  });

  const openNew = () => { setEditorProject(null); setEditorOpen(true); };
  const openEdit = (p, e) => { e.stopPropagation(); setEditorProject(p); setEditorOpen(true); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="projects"
        icon={Briefcase}
        eyebrow="Werk"
        title="Projecten"
        subtitle="Jouw editoriale projectbibliotheek"
        actions={
          <GlassButton variant="primary" size="md" onClick={openNew}>
            <Plus className="h-4 w-4" /> Nieuw project
          </GlassButton>
        }
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all capitalize", filter === f ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {loading && [0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />)}
        {!loading && filteredProjects.map((project) => (
          <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={(e) => openEdit(project, e)} className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/50 transition" aria-label="Bewerk"><Pencil className="h-4 w-4" /></button>
            </div>
            <div className="aspect-[4/3] relative">
              <img src={project.image || IMAGES.walkingChairs} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <StatusBadge variant={statusVariantMap[project.status]} className="bg-white/20 border-white/30 text-white">
                  {(project.status || "planning").replace(/_/g, " ")}
                </StatusBadge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {project.category && <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{project.category}</p>}
                <h3 className="text-white font-display font-semibold text-lg mb-2">{project.title}</h3>
                {project.description && <p className="text-xs text-white/70 line-clamp-2 mb-3">{project.description}</p>}
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{project.progress || 0}% voltooid</span>
                  {project.deadline && <span>{new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
                </div>
                <div className="mt-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full transition-all duration-700" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </div>
            </div>
          </div>
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