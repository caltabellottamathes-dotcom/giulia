import React from "react";
import { motion } from "framer-motion";
import { Pencil, Clock, Milestone, ListChecks, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/system/components/glass/StatusBadge";
import { IMAGES } from "@/lib/images";
import { projectStatusMeta, isTaskDone } from "@/lib/projectStatus";

const EASE = [0.16, 1, 0.3, 1];

const PHOTOS = [
  IMAGES.focusBuild, IMAGES.focusPillar, IMAGES.focusCarrels,
  IMAGES.focusConcreteHand, IMAGES.focusMoodboard, IMAGES.focusLeanPanel,
  IMAGES.focusCorridor, IMAGES.focusAlcove,
];

/** ProjectHeaderTile — een vast zwevend fotopaneel dat van boven op de
 *  detail-kaart schuift. Toont de uitgebreide projectinfo: status, categorie,
 *  domein, titel, beschrijving, deadline, volgende milestone, voortgang en
 *  taakstatus. */
export default function ProjectHeaderTile({ project, tasks = [], onEdit }) {
  const ps = projectStatusMeta[project.status] || projectStatusMeta.planning;
  const idx = (project.title || "").length % PHOTOS.length;
  const photo = project.image || PHOTOS[idx];
  const open = tasks.filter((t) => !isTaskDone(t)).length;
  const done = tasks.filter(isTaskDone).length;
  const total = tasks.length;
  const progress = Math.round(project.progress || 0);

  return (
    <motion.div
      initial={{ y: -168, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="absolute top-0 inset-x-0 h-[176px] z-30 rounded-b-[18px] overflow-hidden"
      style={{ boxShadow: "0 26px 48px -18px rgba(0,0,0,0.45)" }}
    >
      <img src={photo} alt={project.title} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-charcoal/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/12" />

      <div className="relative h-full flex flex-col justify-between p-4 lg:p-5 text-ivory">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <StatusBadge variant={ps.variant} className="bg-white/20 border-white/30 text-white">{ps.label}</StatusBadge>
            {project.category && <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/75 font-semibold truncate">{project.category}</span>}
            {project.domain && <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/55">· {project.domain}</span>}
          </div>
          {onEdit && (
            <button onClick={onEdit} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-white/25 transition">
              <Pencil className="h-3 w-3" /> Bewerk
            </button>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl lg:text-[30px] font-display font-bold tracking-[-0.02em] leading-[1.02] truncate">{project.title}</h1>
          {project.description && <p className="text-[12px] text-ivory/80 leading-relaxed line-clamp-1 mt-1 max-w-3xl">{project.description}</p>}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 text-[11px] text-ivory/80">
            {project.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-ivory/60" />
                <span className="uppercase tracking-wider text-ivory/50">Deadline</span>
                <span className="font-medium text-ivory">{new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
              </span>
            )}
            {project.next_milestone && (
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Milestone className="h-3.5 w-3.5 text-ivory/60 shrink-0" />
                <span className="uppercase tracking-wider text-ivory/50">Volgende</span>
                <span className="font-medium text-ivory truncate max-w-[180px]">{project.next_milestone}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5 text-ivory/60" />
              <span className="font-medium text-ivory tabular-nums">{open}</span>
              <span className="text-ivory/50">open</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-ivory/60 ml-1" />
              <span className="font-medium text-ivory tabular-nums">{done}</span>
              <span className="text-ivory/50">/{total} klaar</span>
            </span>
          </div>

          {progress > 0 && (
            <div className="flex items-center gap-3 mt-2 max-w-xs">
              <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-ivory" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <span className="text-[10px] font-display font-bold tabular-nums text-ivory">{progress}%</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}