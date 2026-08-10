import React from "react";
import StatusBadge from "@/components/glass/StatusBadge";
import { Pencil, Trash2 } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { projectStatusMeta, projectStatusOptions } from "@/lib/projectStatus";
import { InlineText, InlineSelect, InlineDate } from "@/components/projects/InlineEdit";

/**
 * ProjectHeader — full-bleed hero with inline-editable status, category,
 * description, deadline and next milestone. Image/title edited via panel.
 */
export default function ProjectHeader({ project, onUpdate, onEdit, onDelete }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long" }) : "");

  return (
    <div className="relative overflow-hidden rounded-[24px] float-shadow sticky top-0 z-0">
      <div className="aspect-[21/8] relative">
        <img src={project.image || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/62 to-charcoal/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
        <div className="absolute top-20 right-4 flex gap-2 z-10">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition">
            <Pencil className="h-3.5 w-3.5" /> Bewerk
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500/40 transition">
            <Trash2 className="h-3.5 w-3.5" /> Verwijder
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 pb-24 lg:pb-28 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">{ps.label}</StatusBadge>
            <span className="text-[11px] uppercase tracking-wider text-white/40">·</span>
            <InlineText
              value={project.category}
              placeholder="Categorie"
              onCommit={(v) => onUpdate({ category: v })}
              className="text-[11px] uppercase tracking-wider text-white/80 hover:bg-white/10"
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2 tracking-tight">{project.title}</h1>
          <InlineText
            multiline
            value={project.description}
            placeholder="Voeg een korte projectbeschrijving toe…"
            onCommit={(v) => onUpdate({ description: v })}
            className="block text-sm text-white/85 hover:bg-white/10 max-w-2xl leading-relaxed"
            inputClassName="text-white/90 text-sm leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-xs text-white/70">
            <span className="inline-flex items-center gap-2">
              <span className="uppercase tracking-wider text-white/45">Deadline</span>
              <InlineDate value={project.deadline} onCommit={(v) => onUpdate({ deadline: v })} className="text-white/90 border-white/25" />
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="uppercase tracking-wider text-white/45">Volgende</span>
              <InlineText
                value={project.next_milestone}
                placeholder="Volgende stap"
                onCommit={(v) => onUpdate({ next_milestone: v })}
                className="text-white/90 hover:bg-white/10"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}