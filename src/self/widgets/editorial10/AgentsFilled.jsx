import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtAgo } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/6c337f5c6_An_emotionally_ambiguous_wide_shot_2026062622311.jpeg";

/** AgentsFilled — glas-groot + foto-klein: actieve agents + recente acties. · 1:1 */
export default function AgentsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Activity", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const agentActs = useMemo(() => (data || []).filter((a) => a.agent_source || a.domain === "giulia"), [data]);
  const agents = useMemo(() => Array.from(new Set(agentActs.map((a) => a.agent_source).filter(Boolean))), [agentActs]);
  const recent = agentActs.slice(0, 4);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("agents")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Who's Working?</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">AGENTS</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[40px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{agents.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">actief</p>
        <div className="flex gap-1 ml-auto">
          {agents.slice(0, 3).map((a, i) => <span key={a} className="text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full truncate max-w-16" style={{ background: i % 2 ? SAGE_SOFT : "rgba(45,45,45,0.08)", color: i % 2 ? "#fff" : INK }}>{a}</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {recent.map((a, i) => (
          <motion.div key={a.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: SAGE_SOFT }} />
            <span className="text-[12px] truncate flex-1">{a.description}</span>
            <span className="text-[9px] opacity-50">{fmtAgo(a.timestamp)}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Geen agent-acties.</p>}
      </div>
    </FilledGlassCard>
  );
}