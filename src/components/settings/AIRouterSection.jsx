import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Cpu, Cloud, RefreshCw, AlertTriangle } from "lucide-react";

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "force_local", label: "Forceer lokaal" },
  { id: "force_cloud", label: "Forceer cloud" },
];

/**
 * AIRouterSection — status + besturing van de aiRouter (lokale Ollama vs.
 * Gemini cloud). Leeft in Settings → AI behavior.
 */
export default function AIRouterSection() {
  const [status, setStatus] = useState(null);
  const [tunnel, setTunnel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("aiRouter", { action: "status" });
      setStatus(res.data);
      setTunnel(res.data?.local_endpoint?.includes("localhost") ? "" : res.data?.local_endpoint || "");
      setError("");
    } catch (e) {
      setError("Kan status niet ophalen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setMode = async (ai_mode) => {
    try {
      const res = await base44.functions.invoke("aiRouter", { action: "set_mode", ai_mode });
      setStatus(res.data);
      toast({ title: "AI-modus bijgewerkt", description: MODES.find((m) => m.id === ai_mode)?.label });
    } catch {
      toast({ title: "Bijwerken mislukt", variant: "destructive" });
    }
  };

  const saveTunnel = async () => {
    try {
      const res = await base44.functions.invoke("aiRouter", { action: "set_tunnel", local_tunnel_endpoint: tunnel });
      setStatus(res.data);
      toast({ title: "Tunnel-endpoint opgeslagen" });
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    }
  };

  const bothDown = status && !status.local_healthy && !status.cloud_configured;

  return (
    <div className="glass-1 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1">AI-provider</p>
          <p className="text-xs text-muted-foreground">Lokaal (Ollama) wanneer bereikbaar, anders Gemini cloud.</p>
        </div>
        <button onClick={load} className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Vernieuw status">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {status && (
        <div className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
          status.active_provider === "local" ? "bg-olive/10 text-olive" : "bg-blue-grey/15 text-foreground"
        )}>
          {status.active_provider === "local" ? <Cpu className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
          Actieve provider: {status.active_provider === "local" ? "Lokaal" : "Cloud"}
          <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {status.local_healthy ? "lokaal bereikbaar" : "lokaal niet bereikbaar"}
          </span>
        </div>
      )}

      {bothDown && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm bg-destructive/10 text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          Geen enkele AI-provider is bereikbaar. Start je lokale Ollama-server of stel GEMINI_API_KEY in.
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AI-modus</label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "p-2.5 rounded-xl text-xs font-medium transition-all",
                status?.ai_mode === m.id ? "bg-foreground text-background" : "glass-1 text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tunnel-endpoint (mobiel/tablet)</label>
        <div className="flex gap-2 mt-1.5">
          <input
            value={tunnel}
            onChange={(e) => setTunnel(e.target.value)}
            placeholder="https://jouw-tunnel.trycloudflare.com/v1"
            className="flex-1 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          />
          <button onClick={saveTunnel} className="rounded-xl bg-foreground text-background px-4 text-sm font-semibold hover:opacity-90 transition">
            Opslaan
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Leeg = gebruik lokaal netwerk-endpoint. Onbereikbaar → automatische fallback naar Gemini.</p>
      </div>
    </div>
  );
}