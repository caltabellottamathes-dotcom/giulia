import React, { useEffect, useState, useCallback } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { Check, Sparkles } from "lucide-react";

/**
 * UpdatesWidget — teaser for "Achter de schermen · Wat er nieuw is", moved
 * off the home dashboard body into its own widget/module/page.
 */
export default function UpdatesWidget() {
  const { openModule } = usePanel();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const done = await base44.entities.Task.filter({ status: "completed" }, "-updated_date", 4).catch(() => []);
    setCompleted(done || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <WidgetShell size="1x2" radius="medium" interactive onClick={() => openModule("updates")} className="min-h-[176px]">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Achter de schermen</p>
          <Sparkles className="h-4 w-4" style={{ color: "var(--tile-accent)" }} />
        </div>
        <h3 className="text-lg font-display font-semibold text-current leading-tight mb-2">Wat er nieuw is</h3>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
          </div>
        ) : completed.length === 0 ? (
          <p className="text-[12px] text-current/55">Nog niets afgerond.</p>
        ) : (
          <ul className="space-y-1.5 flex-1">
            {completed.slice(0, 3).map((t) => (
              <li key={t.id} className="flex items-center gap-2 glass-1 rounded-lg px-2.5 py-1.5">
                <Check className="h-3 w-3 text-olive shrink-0" />
                <span className="text-[11px] truncate text-current/85">{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WidgetShell>
  );
}