import React from "react";
import { cn } from "@/lib/utils";
import { Pencil, Clock, Milestone } from "lucide-react";
import StatusBadge from "@/components/glass/StatusBadge";
import DomainChip from "@/components/life/DomainChip";
import { IMAGES } from "@/lib/images";
import { projectStatusMeta } from "@/lib/projectStatus";

// Deterministic rotation of editorial photos so every project card gets its
// own image even when project.image is empty.
const PHOTOS = [
  IMAGES.walkChairsHigh, IMAGES.feetChairs, IMAGES.chairsScattered,
  IMAGES.loungeChairs, IMAGES.twoChairsSand, IMAGES.walkChairsBeach,
  IMAGES.notebookChair, IMAGES.chairWater, IMAGES.notebookStacked,
  IMAGES.walkTowardChair, IMAGES.womanFolder, IMAGES.bagJacket,
  IMAGES.hourglassJacket, IMAGES.capOnTablet, IMAGES.chairsBeach,
];

export default function ProjectCard({ project, index = 0, onOpen, onEdit }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  const photo = project.image || PHOTOS[index % PHOTOS.length];
  return (
    <div
      onClick={() => onOpen(project)}
      className="cursor-pointer group relative overflow-hidden rounded-2xl glass-1 border border-border/30 transition-all duration-500 hover:scale-[1.01] hover:shadow-lg flex flex-col"
    >
      <div className="relative h-32 overflow-hidden">
        <img src={photo} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/15 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">{ps.label}</StatusBadge>
          {project.domain && <DomainChip domain={project.domain} size="xs" />}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(project, e); }}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/50 transition"
          aria-label="Bewerk"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="text-base font-display font-semibold text-foreground line-clamp-1">{project.title}</h3>
          {project.description ? (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{project.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic mt-1">Geen beschrijving</p>
          )}
        </div>
        {project.progress != null && project.progress > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Voortgang</span>
              <span className="text-[10px] tabular-nums text-foreground/70 font-medium">{Math.round(project.progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full bg-olive rounded-full" style={{ width: `${Math.min(100, project.progress)}%` }} />
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-1">
          {project.deadline && (
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
            </span>
          )}
          {project.next_milestone ? (
            <span className="inline-flex items-center gap-1 min-w-0">
              <Milestone className="h-3 w-3 shrink-0" />
              <span className="truncate">{project.next_milestone}</span>
            </span>
          ) : project.category ? (
            <span className="truncate">· {project.category}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}