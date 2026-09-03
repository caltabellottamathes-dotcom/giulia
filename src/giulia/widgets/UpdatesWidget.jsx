import React, { useEffect, useState, useCallback } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { fetchUnifiedCompleted, DOMAIN_META } from "@/lib/unifiedStream";

/**
 * UpdatesWidget — versmolten "wat er nieuw is": voltooide taken (Focus),
 * routines (Self), sociale plannen + huishouden (Life) en doelen (Self).
 */
export default function UpdatesWidget() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await fetchUnifiedCompleted(6);
    setCompleted(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <WidgetShell size="1x2" radius="medium" interactive onClick={() => navigate("/updates")} className="min-h-[176px]">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Achter de schermen · alles</p>
          <Sparkles className="h-4 w-4" style={{ color: "var(--tile-accent)" }} />
        </div>
        <h3 className="text-lg font-display font-semibold text-current leading-tight mb-2">Meanwhile...</h3>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
          </div>
        ) : completed.length === 0 ? (
          <p className="text-[12px] text-current/55">Nog niets afgerond.</p>
        ) : (
          <ul className="space-y-1.5 flex-1">
            {completed.slice(0, 4).map((t) => {
              const meta = DOMAIN_META[t.domain] || DOMAIN_META.giulia;
              return (
                <li key={t.id + t.domain} className="flex items-center gap-2 glass-1 rounded-lg px-2.5 py-1.5">
                  <Check className="h-3 w-3 shrink-0" style={{ color: meta.color }} />
                  <span className="text-[9px] uppercase tracking-wider font-bold shrink-0" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="text-[11px] truncate text-current/85">{t.title}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </WidgetShell>
  );
}