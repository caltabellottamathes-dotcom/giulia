import React from "react";
import StatusBadge from "@/components/glass/StatusBadge";
import { Pencil, Trash2 } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { projectStatusMeta } from "@/lib/projectStatus";

/**
 * ProjectHeader — sticky hero photo. Clean overlay (status + title) that reads
 * well on small screens. Detailed editable fields live in the content panel.
 * Swipe right on the photo to go back.
 */
export default function ProjectHeader({ project, onEdit, onDelete, onBack }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  let startX = null;
  let startY = null;
  const onTouchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (dx > 90 && Math.abs(dy) < 60) onBack?.();
    startX = null;
    startY = null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative overflow-hidden rounded-[24px] float-shadow sticky top-14 z-0"
    >
      <div className="h-[42vh] lg:h-[52vh] relative">
        <img src={project.image || IMAGES.walkingChairs} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent" />
        <div className="absolute top-5 right-4 flex gap-2 z-10">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition">
            <Pencil className="h-3.5 w-3.5" /> Bewerk
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500/40 transition">
            <Trash2 className="h-3.5 w-3.5" /> Verwijder
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8 pb-6 max-w-4xl">
          <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">{ps.label}</StatusBadge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight drop-shadow-sm mt-2">{project.title}</h1>
        </div>
      </div>
    </div>
  );
}