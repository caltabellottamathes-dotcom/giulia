import React from "react";
import StatusBadge from "@/components/glass/StatusBadge";
import { Image } from "@/components/ui/image";
import { Pencil, Trash2 } from "lucide-react";
import { projectStatusMeta } from "@/lib/projectStatus";
import { InlineText, InlineDate } from "@/components/projects/InlineEdit";
import { PROJECT_PHOTOS, projectMoodPhoto } from "@/lib/projectPhotos";

// Status → a palette accent bar (my colours) running up the photo panel.
const statusBarColor = {
  in_progress: "bg-olive",
  afwerking: "bg-sand",
  waiting: "bg-amber-500",
  planning: "bg-blue-grey",
  completed: "bg-emerald-500",
  archived: "bg-foreground/40",
};

/**
 * ProjectHeader — editorial split hero. The photograph is a framed design
 * element (left panel), the charcoal panel (right) carries the title and
 * inline-editable metadata. One glance: status, title, where it stands.
 */
export default function ProjectHeader({ project, onUpdate, onEdit, onDelete }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  const heroSrc = project.image || projectMoodPhoto(project.id) || PROJECT_PHOTOS.walkingChair;
  const bar = statusBarColor[project.status] || "bg-blue-grey";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] rounded-[24px] overflow-hidden float-shadow glass">
      {/* Photo panel — the design element */}
      <div className="relative min-h-[240px] lg:min-h-[380px]">
        <span className={`absolute top-0 left-0 bottom-0 w-1.5 z-20 ${bar}`} />
        <Image
          src={heroSrc}
          fittingType="fill"
          focalPointY={0.42}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent lg:bg-gradient-to-r lg:from-charcoal/45 lg:to-transparent" />
        <div className="absolute top-4 left-5">
          <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">
            {ps.label}
          </StatusBadge>
        </div>
      </div>

      {/* Text panel — charcoal solid, my palette */}
      <div className="bg-charcoal text-ivory p-6 lg:p-8 flex flex-col justify-between min-h-[240px] lg:min-h-[380px]">
        <div className="flex items-start justify-between gap-3">
          <InlineText
            value={project.category}
            placeholder="Categorie"
            onCommit={(v) => onUpdate({ category: v })}
            className="text-[11px] uppercase tracking-[0.2em] text-ivory/55 hover:bg-white/10"
            inputClassName="text-ivory text-[11px] uppercase tracking-[0.2em]"
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-white/20 transition"
            >
              <Pencil className="h-3.5 w-3.5" /> Bewerk
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-red-500/40 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Verwijder
            </button>
          </div>
        </div>

        <div className="py-4 lg:py-2">
          <h1 className="text-3xl lg:text-[40px] font-display font-bold text-ivory mb-2 tracking-tight leading-[1.05]">
            {project.title}
          </h1>
          <InlineText
            multiline
            value={project.description}
            placeholder="Voeg een korte projectbeschrijving toe…"
            onCommit={(v) => onUpdate({ description: v })}
            className="block text-sm text-ivory/80 hover:bg-white/10 max-w-xl leading-relaxed"
            inputClassName="text-ivory/90 text-sm leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ivory/70">
          <span className="inline-flex items-center gap-2">
            <span className="uppercase tracking-[0.18em] text-ivory/40">Deadline</span>
            <InlineDate
              value={project.deadline}
              onCommit={(v) => onUpdate({ deadline: v })}
              className="text-ivory/90 border-white/20"
            />
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="uppercase tracking-[0.18em] text-ivory/40">Volgende</span>
            <InlineText
              value={project.next_milestone}
              placeholder="Volgende stap"
              onCommit={(v) => onUpdate({ next_milestone: v })}
              className="text-ivory/90 hover:bg-white/10"
              inputClassName="text-ivory text-xs"
            />
          </span>
        </div>
      </div>
    </div>
  );
}