import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import PageHero from "@/components/glass/PageHero";
import ProjectEditorPanel from "@/components/projects/ProjectEditorPanel";
import ProjectStatusRing from "@/components/projects/ProjectStatusRing";
import { useEntityList } from "@/hooks/useEntity";
import { Plus, Briefcase, Pencil } from "lucide-react";

// One clear status identity per project state — colour is the signal.
const statusTheme = {
  in_progress: { ring: "hsl(var(--olive))", block: "bg-olive", label: "Actief" },
  afwerking: { ring: "hsl(var(--sand))", block: "bg-sand", label: "Afwerving" },
  waiting: { ring: "#f59e0b", block: "bg-amber-500", label: "Wacht op klant" },
  planning: { ring: "hsl(var(--ridge))", block: "bg-ridge", label: "Planning" },
  completed: { ring: "#10b981", block: "bg-emerald-500", label: "Klaar" },
  archived: { ring: "hsl(var(--muted-foreground))", block: "bg-muted-foreground/50", label: "Gearchiveerd" },
};

const filters = [
  { key: "all", label: "Alle" },
  { key: "in_progress", label: "Actief" },
  { key: "afwerking", label: "Afwerving" },
  { key: "waiting", label: "Wacht" },
  { key: "completed", label: "Klaar" },
  { key: "planning", label: "Planning" },
];

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState(null);

  const { data: projects, loading, reload } = useEntityList("Project");

  const theme = (p) => statusTheme[p.status] || statusTheme.planning;

  const counts = projects.reduce((acc, p) => {
    const k = p.status || "planning";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const shown = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const openNew = () => { setEditorProject(null); setEditorOpen(true); };
  const openEdit = (p, e) => { e.stopPropagation(); setEditorProject(p); setEditorOpen(true); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="projects"
        icon={Briefcase}
        eyebrow="Werk"
        title="Projecten"
        subtitle="Alle projecten, hun status in één oogopslag"
        actions={<GlassButton variant="primary" size="md" onClick={openNew}><Plus className="h-4 w-4" /> Nieuw project</GlassButton>}
      />

      {/* Status summary — glanceable overview of the whole portfolio */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filters.slice(1).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(filter === f.key ? "all" : f.key)}
            className={cn("glass rounded-2xl p-4 text-left transition-all hover:glass-2", filter === f.key && "ring-2 ring-olive/40")}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("h-3 w-3 rounded-[3px]", statusTheme[f.key]?.block)} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
            </div>
            <p className="text-3xl font-display font-bold tabular-nums leading-none">{counts[f.key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Filters — secondary, after the overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn("px-3.5 py-1.5 text-xs rounded-full whitespace-nowrap transition-all", filter === f.key ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-60">{f.key === "all" ? projects.length : counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* All projects as glanceable widgets */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        {!loading && shown.map((project, i) => {
          const t = theme(project);
          return (
            <motion.button
              key={project.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.05, 0.4) }}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group relative glass rounded-2xl p-5 text-left overflow-hidden hover:glass-2 transition-shadow hover:shadow-xl hover:shadow-black/5"
            >
              {/* Status signal — colour block as category, full-width top edge */}
              <span className={cn("absolute top-0 left-0 right-0 h-1", t.block)} />
              {/* Edit control */}
              <span
                onClick={(e) => openEdit(project, e)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </span>

              <div className="flex items-start gap-4 pt-2">
                <ProjectStatusRing progress={project.progress || 0} color={t.ring} />
                <div className="min-w-0 flex-1 pt-1">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white", t.block)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />{t.label}
                  </span>
                  {project.category && <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3">{project.category}</p>}
                </div>
              </div>

              <h3 className="text-lg font-display font-semibold mt-4 leading-tight line-clamp-2">{project.title}</h3>
              {project.next_milestone && (
                <p className="text-xs text-muted-foreground mt-1.5 truncate">Volgende: {project.next_milestone}</p>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {!loading && shown.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <p className="text-lg font-display font-medium text-muted-foreground">Geen projecten in deze weergave</p>
          <p className="text-sm text-muted-foreground mt-1">Probeer een ander filter, of start een nieuw project.</p>
          <GlassButton variant="primary" size="md" className="mt-4" onClick={openNew}><Plus className="h-4 w-4" /> Start een project</GlassButton>
        </GlassPanel>
      )}

      <ProjectEditorPanel open={editorOpen} onClose={() => setEditorOpen(false)} project={editorProject} onSaved={() => reload()} />
    </div>
  );
}