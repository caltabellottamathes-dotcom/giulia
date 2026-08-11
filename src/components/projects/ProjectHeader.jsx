import React, { useRef } from "react";
import StatusBadge from "@/components/glass/StatusBadge";
import { Pencil, Trash2 } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { projectStatusMeta } from "@/lib/projectStatus";
import { InlineText, InlineDate } from "@/components/projects/InlineEdit";

/**
 * ProjectHeader — sticky hero photo. Info lives on the photo: full on desktop,
 * limited (status + title + deadline) on mobile. Swipe right to go back.
 */
export default function ProjectHeader({ project, onUpdate, onEdit, onDelete, onBack }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  const start = useRef({ x: null, y: null });
  const onTouchStart = (e) => { start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (start.current.x == null) return;
    const dx = e.changedTouches[0].clientX - start.current.x;
    const dy = e.changedTouches[0].clientY - start.current.y;
    if (dx > 90 && Math.abs(dy) < 60) onBack?.();
    start.current = { x: null, y: null };
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative overflow-hidden rounded-[24px] float-shadow sticky top-14 z-0 lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-0 lg:rounded-none lg:shadow-none"
    >
      <div className="h-[42vh] lg:h-[52vh] relative">
        <img src={project.image || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent" />
        <div className="absolute top-5 right-4 lg:top-20 flex gap-2 z-10">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition">
            <Pencil className="h-3.5 w-3.5" /> Bewerk
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500/40 transition">
            <Trash2 className="h-3.5 w-3.5" /> Verwijder
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8 pb-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">{ps.label}</StatusBadge>
            <span className="hidden lg:inline text-[11px] uppercase tracking-wider text-white/40">·</span>
            <InlineText value={project.category} placeholder="Categorie" onCommit={(v) => onUpdate({ category: v })} className="hidden lg:inline-block text-[11px] uppercase tracking-wider text-white/80 hover:bg-white/10" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight drop-shadow-sm">{project.title}</h1>
          <InlineText multiline value={project.description} placeholder="Voeg een korte projectbeschrijving toe…" onCommit={(v) => onUpdate({ description: v })} className="hidden lg:block text-sm text-white/85 hover:bg-white/10 max-w-2xl leading-relaxed mt-2" inputClassName="text-white/90 text-sm leading-relaxed" />
          {/* Mobile — limited info */}
          <div className="lg:hidden flex items-center gap-2 mt-3 text-xs text-white/80">
            <span className="uppercase tracking-wider text-white/50">Deadline</span>
            <InlineDate value={project.deadline} onCommit={(v) => onUpdate({ deadline: v })} className="text-white/90 border-white/25" />
          </div>
          {/* Desktop — full meta */}
          <div className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-xs text-white/70">
            <span className="inline-flex items-center gap-2">
              <span className="uppercase tracking-wider text-white/45">Deadline</span>
              <InlineDate value={project.deadline} onCommit={(v) => onUpdate({ deadline: v })} className="text-white/90 border-white/25" />
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="uppercase tracking-wider text-white/45">Volgende</span>
              <InlineText value={project.next_milestone} placeholder="Volgende stap" onCommit={(v) => onUpdate({ next_milestone: v })} className="text-white/90 hover:bg-white/10" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}