import React from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

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
 * AgentActivityWidget — "Giulia · Agenten". Shows the state of every agent at a
 * glance: a photo+glass tile with a hero count of today's runs and a compact
 * list of all agents, each with a coloured status dot and its last-run time.
 */
export default function AgentActivityWidget() {
  const { openModule } = usePanel();
  const { data: acts, loading } = useEntityList("Activity", { sort: "-created_date" });
  const agentActs = (acts || []).filter((a) => a.source && AGENTS.some((g) => g.key === a.source));
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const today = agentActs.filter((a) => (a.created_date || "").slice(0, 10) === todayStr);

  const lastByAgent = {};
  agentActs.forEach((a) => { if (!lastByAgent[a.source]) lastByAgent[a.source] = a; });
  const activeCount = Object.keys(lastByAgent).length;
  const when = (a) => { try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); } catch { return ""; } };

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
              <p className="text-base font-display font-semibold text-ivory mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{loading ? "–" : `${activeCount} actief`}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-ivory tabular-nums leading-none">{loading ? "–" : today.length}</span>
              <p className="text-[10px] uppercase tracking-wider text-ivory/65 mt-1">runs vandaag</p>
            </div>
          </div>
        </BrandPhoto>

        <div className="flex-1 p-4 pt-5 text-current min-h-0 overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-7 w-7 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : (
            <ul className="space-y-2">
              {AGENTS.map((g, i) => {
                const last = lastByAgent[g.key];
                const isToday = last && (last.created_date || "").slice(0, 10) === todayStr;
                return (
                  <li key={g.key} className="flex items-center gap-2.5">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", isToday ? DOT[i % DOT.length] : "bg-current/20")} />
                    <span className="text-xs font-medium text-current/90 flex-1 truncate">{g.label}</span>
                    <span className="text-[10px] tabular-nums text-current/50 shrink-0">{last ? when(last) : "rust"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}