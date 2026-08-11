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

const filters = ["Alle", "Active", "planning", "in_progress", "waiting", "completed", "archived"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

// Palette-colored category pill — visually clear on the card.
const CATEGORY_PALETTE = ["olive", "powder", "steel"];
const categoryStyle = (cat) => {
  if (!cat) return "";
  const h = cat.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const c = CATEGORY_PALETTE[h % CATEGORY_PALETTE.length];
  return c === "olive" ? "bg-olive text-ivory" : c === "powder" ? "bg-powder text-charcoal" : "bg-steel text-ivory";
};

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Alle");
  const [category, setCategory] = useState("Alle");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const { data: projects, loading, reload } = useEntityList("Project");

  const categories = ["Alle", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filteredProjects = projects.filter((p) => {
    const byStatus = filter === "Alle" ? true : filter === "Active" ? (p.status === "in_progress" || p.status === "planning") : p.status === filter;
    const byCategory = category === "Alle" ? true : p.category === category;
    return byStatus && byCategory;
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

      <div className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-display font-semibold">Alle projecten</h2>
        <p className="text-xs text-muted-foreground tabular-nums">{filteredProjects.length} projecten</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Categorie</span>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", category === c ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Status</span>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all capitalize", filter === f ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />)}
        {!loading && filteredProjects.map((project) => (
          <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={(e) => openEdit(project, e)} className="h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/50 transition" aria-label="Bewerk"><Pencil className="h-4 w-4" /></button>
            </div>
            <div className="aspect-[4/3] relative">
              <img src={project.image || IMAGES.walkingChairs} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent">
                <h3 className="text-white font-display font-semibold text-base line-clamp-2 drop-shadow-sm">{project.title}</h3>
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