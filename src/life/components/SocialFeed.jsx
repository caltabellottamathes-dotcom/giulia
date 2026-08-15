import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Sparkles, RefreshCw } from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "zojuist";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} u`;
  return `${Math.floor(s / 86400)} d`;
}

/**
 * SocialFeed — "Achter de schermen": alleen afgeronde, betekenisvolle acties
 * (voltooide taken). Openstaande taken beheer je op /tasks, goedkeuringen op
 * /approvals — die pagina's (en hun widgets) zijn de enige plek waar je erop
 * kunt acteren, zodat er geen dubbel systeem ontstaat.
 */
export default function SocialFeed() {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const done = await base44.entities.Task.filter({ status: "completed" }, "-updated_date", 12).catch(() => []);
    setCompleted(done || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    let unsub;
    try { unsub = base44.entities.Task?.subscribe?.(() => load()); } catch { /* ignore */ }
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, [load]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-olive font-semibold">Achter de schermen</p>
          <h2 className="text-lg font-display font-semibold">Wat er nieuw is</h2>
        </div>
        <button onClick={load} className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition" aria-label="Vernieuw">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="glass-2 rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">Laden…</p>
        </div>
      ) : completed.length === 0 ? (
        <div className="glass-2 rounded-2xl p-10 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nog niets afgerond.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {completed.map((t) => (
            <div key={t.id} className="flex items-center gap-3 glass-1 rounded-xl px-3 py-2">
              <Check className="h-3.5 w-3.5 text-olive shrink-0" />
              <p className="text-sm line-through truncate flex-1 text-muted-foreground">{t.title}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(t.updated_date || t.created_date)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}