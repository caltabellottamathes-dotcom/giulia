import React from "react";
import { motion } from "framer-motion";
import { IMAGES } from "@/lib/images";
import { isTaskDone } from "@/lib/projectStatus";

const EASE = [0.16, 1, 0.3, 1];
const PHOTO = IMAGES.focusBuild;

/** ProjectsOverviewTile — vast zwevend fotopaneel boven op de Projects-studio
 *  kaart, flush met de bovenste schermrand, vierkant, iets minder breed. Toont
 *  de aggregate projectstatistiek met echte data. */
export default function ProjectsOverviewTile({ data }) {
  const projects = data?.projects || [];
  const tasks = data?.tasks || [];
  const active = projects.filter((p) => ["in_progress", "planning", "review", "waiting", "afwerking"].includes(p.status));
  const attention = projects.filter((p) => p.health === "attention" || p.health === "critical");
  const open = tasks.filter((t) => !isTaskDone(t)).length;

  return (
    <motion.div
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      className="absolute top-0 inset-x-0 h-[140px] z-30 rounded-none overflow-hidden"
      style={{ boxShadow: "0 28px 56px -20px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
    >
      <img src={PHOTO} alt="Projecten" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/82 via-charcoal/32 to-charcoal/12" />
      <div className="relative h-full flex flex-col justify-between p-4 lg:p-5 text-ivory">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Focus · Projecten</p>
          <span className="text-[10px] font-mono tabular-nums text-ivory/70">{projects.length} projecten</span>
        </div>
        <div>
          <h1 className="text-[28px] lg:text-[34px] font-display font-bold uppercase tracking-[-0.03em] leading-[0.95]">What I'm Building.</h1>
          <div className="flex items-center gap-6 mt-3">
            <HeroStat label="ACTIEF" value={active.length} />
            <HeroStat label="AANDACHT" value={attention.length} />
            <HeroStat label="OPEN TAKEN" value={open} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.22em] font-semibold text-ivory/65">{label}</p>
      <p className="font-display font-bold tabular-nums leading-none mt-0.5 text-2xl text-ivory">{value}</p>
    </div>
  );
}