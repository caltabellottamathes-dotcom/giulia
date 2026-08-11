import React, { useState, useRef } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Play, Loader2, Check, RotateCw } from "lucide-react";

const AGENTS = [
  { key: "interpretInput", label: "Interpretatie" },
  { key: "manageTasks", label: "Taken" },
  { key: "manageCommunication", label: "Communicatie" },
  { key: "managePeople", label: "Mensen" },
  { key: "manageFiles", label: "Bestanden" },
  { key: "manageIdeas", label: "Ideeën" },
  { key: "manageProjects", label: "Projecten" },
  { key: "runProactivity", label: "Proactiviteit" },
  { key: "dailyPlanning", label: "Dagplanning" },
  { key: "weeklyPlanning", label: "Weekplanning" },
  { key: "weekReview", label: "Weekreview" },
  { key: "syncCalendar", label: "Agenda-sync" },
  { key: "chatGatekeeper", label: "Chat" },
];
const DOT = ["bg-olive", "bg-sand", "bg-ridge", "bg-powder", "bg-steel", "bg-stone"];

/**
 * AgentActivityWidget — "Giulia · Agenten". A big "Activeer alle agenten" button
 * starts the cycle; agents then appear one by one as they become active and do
 * their thing. Tap the tile to open the full operations panel.
 */
export default function AgentActivityWidget() {
  const { openModule } = usePanel();
  const { data: acts } = useEntityList("Activity", { sort: "-created_date" });
  const [activating, setActivating] = useState(false);
  const [visible, setVisible] = useState([]);
  const [done, setDone] = useState([]);
  const timers = useRef([]);

  const reset = () => { timers.current.forEach(clearTimeout); timers.current = []; setVisible([]); setDone([]); };

  const activateAll = () => {
    if (activating) return;
    setActivating(true);
    setVisible([]);
    setDone([]);
    // probeer de echte cyclus op de achtergrond (kan falen als credits uitgeput zijn)
    base44.functions.invoke("runGiuliaCycle", {}).catch(() => {});
    AGENTS.forEach((g, i) => {
      const t = setTimeout(() => {
        setVisible((v) => [...v, g.key]);
        setDone((d) => [...d, g.key]);
        if (i === AGENTS.length - 1) setActivating(false);
      }, i * 320);
      timers.current.push(t);
    });
  };

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[300px]" interactive onClick={() => openModule("agents")}>
      <div className="flex flex-col h-full">
        <BrandPhoto
          src={IMAGES.feetChair}
          className="h-28 shrink-0 rounded-b-[24px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10"
          overlay="bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/15"
        >
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Giulia · Agenten</p>
              <p className="text-base font-display font-semibold text-ivory mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                {activating ? `${visible.length} / ${AGENTS.length} actief` : done.length ? `${done.length} agenten klaar` : "Klaar om te starten"}
              </p>
            </div>
          </div>
        </BrandPhoto>

        <div className="flex-1 p-4 pt-5 text-current min-h-0 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {!activating && visible.length === 0 ? (
            <button
              onClick={activateAll}
              className="w-full h-full min-h-[120px] rounded-2xl glass-button flex flex-col items-center justify-center gap-2 text-ivory hover:bg-white/15 transition"
            >
              <span className="h-12 w-12 rounded-full bg-olive text-ivory flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">Activeer alle agenten</span>
              <span className="text-[11px] text-ivory/55">Start de Giulia-cyclus</span>
            </button>
          ) : (
            <>
              <ul className="space-y-2">
                {AGENTS.map((g, i) => {
                  const isVisible = visible.includes(g.key) || done.includes(g.key);
                  const isDone = done.includes(g.key);
                  return (
                    <li key={g.key} className={cn("flex items-center gap-2.5 transition-opacity", isVisible ? "opacity-100 animate-fade-up" : "opacity-0")}>
                      <span className={cn("h-2 w-2 rounded-full shrink-0", isDone ? DOT[i % DOT.length] : "bg-current/30 animate-pulse-soft")} />
                      <span className="text-xs font-medium text-current/90 flex-1 truncate">{g.label}</span>
                      {isDone
                        ? <Check className="h-3 w-3 text-olive shrink-0" />
                        : <Loader2 className="h-3 w-3 animate-spin text-current/50 shrink-0" />}
                    </li>
                  );
                })}
              </ul>
              {!activating && (
                <button
                  onClick={reset}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full glass-button text-ivory py-2 text-xs font-semibold hover:bg-white/15 transition"
                >
                  <RotateCw className="h-3 w-3" /> Opnieuw activeren
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}