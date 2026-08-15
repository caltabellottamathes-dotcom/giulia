import React, { useState, useCallback } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Play } from "lucide-react";

/**
 * TaskAgentRunner — de zichtbare, real-time task-agent op de taken-pagina.
 * Toont status (klaar/draait/voltooid), de laatste run-samenvatting en een
 * live Activity-feed van manageTasks. De "Run"-knop vuurt de task-agent aan
 * (die op zijn beurt de enkele leider inschakelt — geen superagent-loop).
 */
export default function TaskAgentRunner() {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState(null);

  const { data: feed, reload } = useEntityList("Activity", {
    filter: { source: "manageTasks" },
    sort: "-created_date",
    limit: 4,
    realtime: true,
  });

  const run = useCallback(async () => {
    setRunning(true);
    setSummary(null);
    try {
      const res = await base44.functions.invoke("manageTasks", {});
      setSummary(res);
    } catch (e) {
      setSummary({ error: String(e?.message || e) });
    } finally {
      setRunning(false);
      reload();
    }
  }, [reload]);

  const last = feed[0];
  const done = !running && summary && !summary?.error;

  return (
    <GlassPanel level={3} className="p-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center shrink-0">
          {running
            ? <Loader2 className="h-4 w-4 text-olive animate-spin" />
            : <Sparkles className="h-4 w-4 text-olive" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-olive font-semibold">Giulia · Task-agent</p>
            <StatusBadge variant={running ? "active" : done ? "completed" : "muted"}>
              {running ? "draait" : done ? "voltooid" : "klaar"}
            </StatusBadge>
          </div>
          <p className="text-sm font-medium">
            {running
              ? "Herzien alle taken — de jouwe en Giulia's — in real time."
              : summary?.error
              ? "Laatste run mislukt."
              : last
              ? last.description
              : "Task-agent staat klaar. Run om al je taken te laten herprioriteren."}
          </p>
          {summary && !summary.error && (
            <p className="text-xs text-muted-foreground mt-1">
              {summary.mine ?? 0} eigen · {summary.giulia ?? 0} Giulia · {summary.overdue ?? 0} te laat
            </p>
          )}
          {feed.length > 1 && (
            <div className="mt-3 space-y-1">
              {feed.slice(1, 3).map((f) => (
                <p key={f.id} className="text-[11px] text-muted-foreground/80 truncate">· {f.description}</p>
              ))}
            </div>
          )}
        </div>
        <GlassButton variant="primary" size="sm" onClick={run} disabled={running}>
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Loopt" : "Run"}
        </GlassButton>
      </div>
    </GlassPanel>
  );
}