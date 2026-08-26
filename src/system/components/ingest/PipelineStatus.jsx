import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STAGES = [
  { key: "received", label: "Receiving" },
  { key: "reading", label: "Reading" },
  { key: "understanding", label: "Understanding" },
  { key: "structuring", label: "Structuring" },
  { key: "matching", label: "Matching" },
  { key: "reconciling", label: "Reconciling" },
  { key: "validating", label: "Validating" },
  { key: "pending_approval", label: "Ready for approval" },
  { key: "complete", label: "Complete" },
];

export default function PipelineStatus({ status, history = [] }) {
  const currentIdx = STAGES.findIndex((s) => s.key === status);
  const failed = status === "failed";
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-1">
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx && !failed && status !== "complete";
          const complete = status === "complete" && i === STAGES.length - 1;
          const failedStage = failed && i === currentIdx;
          return (
            <motion.div key={s.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${done || complete ? "bg-olive text-white" : active ? "bg-olive/20 text-olive" : failedStage ? "bg-destructive/20 text-destructive" : "bg-foreground/[0.06] text-muted-foreground"}`}>
                {done || complete ? <Check className="w-3.5 h-3.5" /> : active || failedStage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[10px] tabular-nums">{i + 1}</span>}
              </div>
              <span className={`text-sm ${active || complete ? "text-foreground font-medium" : done ? "text-foreground/70" : "text-muted-foreground"}`}>{s.label}</span>
              {active && <span className="text-[10px] text-olive uppercase tracking-wide">processing…</span>}
              {failedStage && <span className="text-[10px] text-destructive uppercase tracking-wide">failed</span>}
            </motion.div>
          );
        })}
      </div>
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/40 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">Processing log</p>
          {history.slice(-8).map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="tabular-nums">{h.at ? new Date(h.at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}</span>
              <span className="capitalize">{h.stage}</span>
              {!h.ok && <span className="text-destructive">· error</span>}
              {h.note && <span className="truncate">· {h.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}