import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/components/glass/GlassPanel";
import { Activity as ActivityIcon } from "lucide-react";

/**
 * LifeActivityFeed — de gedeelde activiteitsstroom over alle LIFE-modules.
 * Leest Activity-records waarvan source begint met "LIFE" en toont ze
 * samen, met de module van herkomst als chip. Live via realtime subscribe.
 */
const relTime = (d) => {
  if (!d) return "—";
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "zojuist";
  const m = Math.round(s / 60); if (m < 60) return `${m}m geleden`;
  const h = Math.round(m / 60); if (h < 24) return `${h}u geleden`;
  const dd = Math.round(h / 24); return `${dd}d geleden`;
};
const moduleOf = (src) => (src || "").split(" · ")[1] || (src || "") || "LIFE";
const moduleColor = (mod) => ({
  Household: "hsl(var(--life-blue-deep))",
  SocialPlanner: "hsl(var(--life-sand-deep))",
  Admin: "hsl(var(--life-blue-deep))",
  Hobbies: "hsl(var(--life-sand-deep))",
  Social: "hsl(var(--life-blue-deep))",
}[mod] || "hsl(var(--life-blue-deep))");

export default function LifeActivityFeed({ title = "Activity · LIFE", limit = 6 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const all = await base44.entities.Activity.list("-created_date", 80);
      const life = (all || []).filter((a) => (a.source || "").startsWith("LIFE"));
      setItems(life.slice(0, limit));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const unsub = base44.entities.Activity.subscribe(() => load());
    return unsub;
  }, []);

  return (
    <GlassPanel level={2} className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ActivityIcon className="w-3.5 h-3.5" style={{ color: "hsl(var(--life-blue-deep))" }} />
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">{title}</p>
        <span className="flex-1 h-px bg-foreground/8" />
        <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">{items.length}</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6"><div className="h-5 w-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" /></div>
      ) : items.length ? (
        <div className="divide-y divide-foreground/8">
          {items.map((a) => {
            const mod = moduleOf(a.source);
            return (
              <div key={a.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide font-semibold" style={{ background: "hsl(var(--foreground)/0.05)", color: moduleColor(mod) }}>{mod}</span>
                <p className="text-sm flex-1 min-w-0 truncate text-foreground/90">{a.description}</p>
                <span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums shrink-0">{relTime(a.timestamp || a.created_date)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Nog niets gelogd — acties in LIFE verschijnen hier gekoppeld.</p>
      )}
    </GlassPanel>
  );
}