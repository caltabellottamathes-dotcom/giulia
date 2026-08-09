import React from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { formatDistanceToNowStrict } from "date-fns";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

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
  visibilityTest: "Test",
};

/**
 * AgentActivityWidget — glanceable view of GIULIA's background agents.
 * Branded banner carries today's run count; a bespoke route-line holds a dot
 * per agent that ran (latest pulses); the most recent agent action is shown.
 */
export default function AgentActivityWidget() {
  const { openModule } = usePanel();
  const { data: msgs, loading } = useEntityList("Message", { sort: "-created_date" });
  const agentMsgs = (msgs || []).filter((m) => m.role === "giulia" && m.agent_source);
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const today = agentMsgs.filter((m) => (m.created_date || "").slice(0, 10) === todayStr);
  const agents = [...new Set(agentMsgs.slice(0, 40).map((m) => m.agent_source))];
  const latest = agentMsgs[0];
  const when = (m) => { try { return formatDistanceToNowStrict(new Date(m.created_date), { addSuffix: true }); } catch { return ""; } };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("activity")} className="min-h-[176px]">
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.feetChair} className="h-16" overlay="bg-gradient-to-t from-charcoal/85 to-transparent">
          <div className="absolute inset-0 px-5 flex items-end justify-between pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Giulia · Agenten</h3>
            <span className="text-2xl font-display font-semibold text-ivory tabular-nums">{today.length}</span>
          </div>
        </BrandPhoto>
        <div className="p-5 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : agentMsgs.length > 0 ? (
            <>
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-0.5 rounded-full bg-current/10" />
                <div className="relative flex justify-between w-full">
                  {agents.slice(0, 8).map((a, i) => (
                    <span
                      key={a}
                      className={cn("h-3 w-3 rounded-full border-2 border-current/20", i === 0 && "animate-pulse-soft")}
                      style={i === 0 ? { background: "var(--tile-accent)" } : { background: "currentColor", opacity: 0.35 }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[11px] opacity-50">{agents.length} agenten actief</span>
                <span className="text-[11px] opacity-40">·</span>
                <span className="text-[11px] opacity-50">{when(latest)}</span>
              </div>
              {latest && (
                <p className="text-sm opacity-70 truncate mt-1">
                  <span className="font-semibold">{AGENT_LABEL[latest.agent_source] || latest.agent_source}</span>: {latest.content}
                </p>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Agenten draaien op de achtergrond</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}