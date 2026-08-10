import React from "react";
import WidgetShell from "./WidgetShell";
import { useEntityList } from "@/hooks/useEntity";
import { formatDistanceToNowStrict } from "date-fns";
import { IMAGES } from "@/lib/images";
import { Cpu } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";

const AGENT_LABEL = {
  interpretInput: "Interpretatie",
  manageTasks: "Taken",
  manageCommunication: "Communicatie",
  managePeople: "Mensen",
  manageFiles: "Bestanden",
  manageIdeas: "Ideeën",
  manageProjects: "Projecten",
  runProactivity: "Proactiviteit",
  dailyPlanning: "Dagplanning",
  weeklyPlanning: "Weekplanning",
  weekReview: "Weekreview",
  syncCalendar: "Agenda-sync",
  chatGatekeeper: "Chat",
  visibilityTest: "Test",
};
const AGENT_SOURCES = new Set(Object.keys(AGENT_LABEL));

/**
 * AgentActivityWidget — bold graphic edition. Full-bleed editorial photo,
 * a giant hero number of today's agent runs, an iconographic header, and the
 * most recent agent action in large type. Reads the Activity feed (agent
 * sources only) — agents now log here instead of flooding chat.
 */
export default function AgentActivityWidget() {
  const { openModule } = usePanel();
  const { data: acts, loading } = useEntityList("Activity", { sort: "-created_date" });
  const agentActs = (acts || []).filter((a) => a.source && AGENT_SOURCES.has(a.source));
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const today = agentActs.filter((a) => (a.created_date || "").slice(0, 10) === todayStr);
  const agents = [...new Set(agentActs.slice(0, 40).map((a) => a.source))];
  const latest = agentActs[0];
  const when = (a) => { try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); } catch { return ""; } };

  return (
    <WidgetShell size="2x2" radius="large" className="min-h-[300px]" onClick={() => openModule("agents")} interactive>
      <div className="relative h-full overflow-hidden">
        <img src={IMAGES.feetChair} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/92 via-charcoal/45 to-charcoal/15" />

        <div className="relative h-full p-5 flex flex-col justify-between text-ivory">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl glass-1 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-ivory" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/75">Giulia</p>
                <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/75">Agenten</p>
              </div>
            </div>
            <span className="text-[11px] text-ivory/65 mt-1">{agents.length} actief</span>
          </div>

          <div>
            <p className="text-[64px] leading-none font-display font-bold text-ivory tabular-nums">{loading ? "–" : today.length}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/60 mt-1.5 font-semibold">runs vandaag</p>
          </div>

          <div>
            <div className="flex gap-1.5 mb-3">
              {agents.slice(0, 8).map((a, i) => (
                <span key={a} className="h-2.5 w-2.5 rounded-full" style={{ background: i === 0 ? "var(--tile-accent)" : "rgba(255,255,255,0.42)" }} />
              ))}
            </div>
            {latest ? (
              <>
                <p className="text-lg font-display font-semibold text-ivory leading-tight">{AGENT_LABEL[latest.source] || latest.source}</p>
                <p className="text-sm text-ivory/70 leading-snug line-clamp-2 mt-0.5">{latest.description}</p>
                <p className="text-[11px] text-ivory/50 mt-1.5">{when(latest)}</p>
              </>
            ) : (
              <p className="text-sm text-ivory/60">Agenten draaien op de achtergrond</p>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}