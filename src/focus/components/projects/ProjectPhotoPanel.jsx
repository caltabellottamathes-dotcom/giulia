import React from "react";
import { motion } from "framer-motion";
import { IMAGES } from "@/lib/images";

const EASE = [0.16, 1, 0.3, 1];

/** ProjectPhotoPanel — een volledig eigen paneel (los van de witte kaart)
 *  dat bovenaan de content-zone zweeft, flush met de schermrand, vierkant.
 *  Toont de projectfoto + algemene info (status, categorie, domein,
 *  voortgang, deadline). Wordt op paginaniveau gerenderd, niet in de kaart. */
export default function ProjectPhotoPanel({ project }) {
  if (!project) return null;
  const photo = project.cover_image || IMAGES.focusBuild;
  const accent = project.color || "hsl(var(--olive))";

  return (
    <motion.div
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="absolute top-0 inset-x-0 h-[140px] z-30 rounded-none overflow-hidden"
      style={{ boxShadow: "0 24px 48px -18px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)" }}
    >
      <img src={photo} alt={project.title} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/32 to-charcoal/10" />
      <div className="relative h-full flex flex-col justify-between p-4 lg:p-5 text-ivory">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Focus · Project</p>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-ivory/75">
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
            {project.status || "—"}{project.health ? ` · ${project.health}` : ""}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="text-[24px] lg:text-[30px] font-display font-bold uppercase tracking-[-0.03em] leading-[0.95] truncate">{project.title}</h1>
          <div className="flex items-center gap-5 mt-2.5 text-ivory/90 overflow-hidden">
            {project.category && <Stat label="Categorie" value={project.category} />}
            {project.domain && <Stat label="Domein" value={project.domain} />}
            <Stat label="Voortgang" value={`${Math.round(project.progress || 0)}%`} />
            {project.deadline && <Stat label="Deadline" value={new Date(project.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 shrink-0">
      <p className="text-[8px] uppercase tracking-[0.22em] font-semibold text-ivory/55 truncate">{label}</p>
      <p className="text-[12px] font-display font-semibold leading-none mt-0.5 truncate">{value}</p>
    </div>
  );
}