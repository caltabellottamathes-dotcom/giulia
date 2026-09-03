import React, { useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import GiuliaAdminShell from "@/giulia/components/admin/GiuliaAdminShell";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { IMAGES } from "@/lib/images";
import { Cpu, Play, RefreshCw, Loader2 } from "lucide-react";
import { GIULIA_AGENTS } from "@/lib/giuliaAgents";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";

const DOT = ["bg-olive", "bg-sand", "bg-ridge", "bg-powder", "bg-steel", "bg-stone"];
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Agents — operations & management voor de Giulia-agents, in het Admin
 * LIFE-pagina-ontwerp. Start de cyclus of spreek individuele agents aan.
 */
export default function Agents() {
  const { toast } = useToast();
  const { data: acts, loading, reload } = useEntityList("Activity", { sort: "-created_date" });
  const [running, setRunning] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [msg, setMsg] = useState({});

  const lastByAgent = {};
  (acts || []).forEach((a) => { if (a.source && !lastByAgent[a.source]) lastByAgent[a.source] = a; });
  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todayCount = (acts || []).filter((a) => (a.created_date || "").slice(0, 10) === todayStr).length;
  const when = (a) => { try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); } catch { return "—"; } };

  const addressAgent = async (key) => {
    const m = (msg[key] || "").trim();
    setActiveKey(key);
    try {
      await base44.functions.invoke(key, m ? { message: m } : {});
      toast({ title: `${GIULIA_AGENTS.find((a) => a.key === key)?.label || "Agent"} aangesproken` });
      setMsg((s) => ({ ...s, [key]: "" }));
      reload();
    } catch (e) {
      toast({ title: "Aanspreken mislukt", description: "Mogelijk zijn er geen credits beschikbaar.", variant: "destructive" });
    } finally { setActiveKey(null); }
  };

  const runAll = async () => {
    setRunning(true);
    try {
      await base44.functions.invoke("runGiuliaCycle", {});
      toast({ title: "Cyclus voltooid" });
      reload();
    } catch (e) {
      toast({ title: "Cyclus mislukt", description: "Mogelijk zijn er geen credits beschikbaar.", variant: "destructive" });
    } finally { setRunning(false); }
  };

  const top = (acts || []).slice(0, 3).map((a, i) => ({
    n: pad2(i + 1),
    title: a.description || "Actie",
    desc: `${a.source || "agent"} · ${when(a)}`,
  }));

  return (
    <GiuliaAdminShell
      pageKey="agents"
      eyebrow="GIULIA → AGENTS"
      title="Who's Working"
      related={[{ label: "Activity", to: "/activity" }, { label: "Approvals", to: "/approvals" }, { label: "Chat", to: "/chat" }]}
      hero={IMAGES.dashboardGiulia}
      card={{
        eyebrow: "Who's working | agents_",
        title1: "The staff", title2: "is in.",
        metaLine: `${GIULIA_AGENTS.length} agenten · ${todayCount} acties vandaag`,
        heading1: "Agents", heading2: "on duty",
        itemsLabel: `${pad2(top.length)}_recently_active_`,
        items: top,
      }}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="grid grid-cols-3 gap-3 flex-1">
            <GlassPanel level={2} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Agenten</p>
              <p className="text-2xl font-display font-semibold mt-1">{GIULIA_AGENTS.length}</p>
            </GlassPanel>
            <GlassPanel level={2} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vandaag</p>
              <p className="text-2xl font-display font-semibold mt-1">{loading ? "—" : todayCount}</p>
            </GlassPanel>
            <GlassPanel level={2} className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Actief</p>
              <p className="text-2xl font-display font-semibold mt-1">{Object.keys(lastByAgent).length}</p>
            </GlassPanel>
          </div>
          <GlassButton variant="primary" size="md" onClick={runAll} disabled={running} className="shrink-0">
            <RefreshCw className={cn("h-4 w-4", running && "animate-spin")} /> {running ? "Bezig…" : "Activeer alle"}
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GIULIA_AGENTS.map((g, i) => {
            const last = lastByAgent[g.key];
            const isToday = last && (last.created_date || "").slice(0, 10) === todayStr;
            const isRunning = activeKey === g.key;
            return (
              <GlassPanel key={g.key} level={2} className="p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", isToday ? DOT[i % DOT.length] : "bg-foreground/15")} />
                  <h3 className="text-sm font-display font-semibold flex-1 truncate">{g.label}</h3>
                  {isRunning && <Loader2 className="h-3.5 w-3.5 animate-spin text-olive" />}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{g.role}</p>
                <p className="text-[11px] text-muted-foreground/70 mb-3">{last ? `Laatst: ${when(last)}` : "Nog niet gedraaid"}</p>
                <input
                  value={msg[g.key] || ""}
                  onChange={(e) => setMsg((s) => ({ ...s, [g.key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addressAgent(g.key); }}
                  placeholder={`Spreek ${g.label} aan…`}
                  className="mb-2 w-full rounded-xl border border-border/40 bg-background/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-olive/40"
                />
                <GlassButton variant="outline" size="sm" onClick={() => addressAgent(g.key)} disabled={isRunning || running} className="mt-auto">
                  <Play className="h-3.5 w-3.5" /> {isRunning ? "Bezig…" : "Spreek aan"}
                </GlassButton>
              </GlassPanel>
            );
          })}
        </div>

        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Recente activiteit</p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Laden…</p>
          ) : (acts || []).length ? (
            <div className="divide-y divide-border/30">
              {(acts || []).slice(0, 20).map((a) => (
                <div key={a.id} className="flex items-start justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{a.source || "agent"} · {when(a)}</p>
                  </div>
                  {a.action && <span className="text-[11px] text-muted-foreground shrink-0">{a.action}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nog geen activiteit.</p>
          )}
        </GlassPanel>
      </div>
    </GiuliaAdminShell>
  );
}