import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { projectStatusMeta } from "@/lib/projectStatus";

const PLUM = "#301728";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";

/** ProjectRenewCard — Focus-versie van RenewOverviewCard. Toont het project
 *  (status, open taken, voortgang) en een grote live-knop die het project
 *  ververst via giulia:projects-reload. Focus-kleuren: Plum tekst, Pistachio
 *  dot, Olive ring. */
export default function ProjectRenewCard({ project, tasks = [] }) {
  const [spinKey, setSpinKey] = useState(0);
  const trigger = () => {
    setSpinKey((k) => k + 1);
    window.dispatchEvent(new CustomEvent("giulia:projects-reload"));
  };
  const open = (tasks || []).filter((t) => !["completed", "done", "archived"].includes(t.status)).length;
  const ps = projectStatusMeta[project?.status] || projectStatusMeta.planning;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden flex flex-col justify-between p-5" style={{ background: "rgba(216,218,179,0.55)" }}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: PLUM }}>
          <span className="font-bold">Focus | Project</span> | renew_
        </p>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: OLIVE }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: OLIVE }} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: PLUM, opacity: 0.55 }}>live</span>
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.9]" style={{ color: PLUM, fontSize: "clamp(24px, 2.2vw, 38px)" }}>
          {project?.title ? project.title.split(" ")[0] : "Renew"}<br />project
          <span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full ml-1.5 align-baseline" style={{ background: PISTACHIO, width: "clamp(8px,0.7vw,12px)", height: "clamp(8px,0.7vw,12px)" }} />
        </h2>
        <p className="font-body text-[12px] leading-snug mt-3 max-w-[16rem]" style={{ color: PLUM, opacity: 0.65 }}>
          {ps.label} · {open} open taken · {Math.round(project?.progress || 0)}% voortgang. Eén tik ververst het project.
        </p>
      </div>

      <div className="flex items-end justify-between">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: PLUM, opacity: 0.45 }}>tap to sync</p>
        <button onClick={trigger} className="relative h-16 w-16 rounded-full flex items-center justify-center group" aria-label="Vernieuw project">
          <span className="absolute inset-0 rounded-full opacity-40 renew-ring" style={{ background: `conic-gradient(from 0deg, ${OLIVE}, ${PLUM}, ${OLIVE})` }} />
          <span className="absolute -inset-1 rounded-full animate-pulse-soft" style={{ boxShadow: `0 0 0 2px ${OLIVE}40` }} />
          <span className="absolute inset-[3px] rounded-full" style={{ background: "hsl(var(--warm-white))" }} />
          <RefreshCw key={spinKey} className="relative h-6 w-6 renew-spin transition-transform duration-300 group-hover:scale-110" style={{ color: PLUM }} />
        </button>
      </div>
    </div>
  );
}