import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import { mockProjects } from "@/lib/mockData";
import { Plus, ArrowRight, Filter } from "lucide-react";

const filters = ["Active", "Planning", "In progress", "Waiting", "Completed", "Archived"];

const statusVariantMap = {
  planning: "waiting", in_progress: "active", waiting: "waiting",
  completed: "completed", archived: "muted",
};

export default function Projects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Active");

  const filteredProjects = mockProjects.filter((p) => {
    if (filter === "Active") return p.status === "in_progress" || p.status === "planning";
    if (filter === "In progress") return p.status === "in_progress";
    return p.status === filter.toLowerCase().replace(" ", "_");
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw editoriale projectbibliotheek</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Plus className="h-4 w-4" /> Nieuw project
        </GlassButton>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all",
              filter === f
                ? "bg-foreground text-background font-medium"
                : "glass-1 text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Project grid — editorial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filteredProjects.map((project, idx) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className={cn(
              "cursor-pointer group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01]",
              idx === 0 && "md:col-span-2 lg:col-span-1"
            )}
          >
            <div className="aspect-[4/3] relative">
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <StatusBadge
                  variant={statusVariantMap[project.status]}
                  className="bg-white/20 border-white/30 text-white"
                >
                  {project.status.replace("_", " ")}
                </StatusBadge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{project.category}</p>
                <h3 className="text-white font-heading font-medium text-lg mb-2">{project.title}</h3>
                <p className="text-xs text-white/70 line-clamp-2 mb-3">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{project.progress}% voltooid</span>
                  <span>{new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                </div>
                <div className="mt-2 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full transition-all duration-700"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <GlassPanel level={2} className="p-12 text-center">
          <p className="text-lg font-heading font-light text-muted-foreground">Geen projecten nog</p>
          <p className="text-sm text-muted-foreground mt-1">Jouw werkruimte wacht op het eerste project.</p>
          <GlassButton variant="primary" size="md" className="mt-4">
            <Plus className="h-4 w-4" /> Start een project
          </GlassButton>
        </GlassPanel>
      )}
    </div>
  );
}