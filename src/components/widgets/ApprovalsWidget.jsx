import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { ClipboardCheck, Check, X, ArrowRight } from "lucide-react";

/**
 * ApprovalsWidget — interactive: approve / reject inline right from the tile.
 */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const { data: approvals, loading, reload } = useEntityList("Approval", { filter: { status: "pending" } });
  const visible = approvals.slice(0, 3);

  const decide = async (e, id, status) => {
    e.stopPropagation();
    try {
      await base44.entities.Approval.update(id, { status });
      reload();
    } catch (err) {
      /* ignore */
    }
  };

  return (
    <WidgetShell size="2x1" radius="soft" glass="card" interactive onClick={() => openModule("approvals")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={ClipboardCheck} label="Goedkeuringen" count={approvals.length ? `${approvals.length} wacht` : "leeg"} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ivory leading-tight truncate">{item.description}</p>
                  <p className="text-[11px] text-ivory/55 truncate">{item.target}{item.proposed_action ? ` · ${item.proposed_action}` : ""}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => decide(e, item.id, "approved")} className="h-7 w-7 rounded-lg bg-olive/15 border border-olive/25 flex items-center justify-center text-olive hover:bg-olive/25 transition" aria-label="Goedkeuren">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => decide(e, item.id, "rejected")} className="h-7 w-7 rounded-lg bg-ivory/5 border border-ivory/15 flex items-center justify-center text-ivory/60 hover:text-destructive hover:border-destructive/30 transition" aria-label="Afwijzen">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-ivory/50 font-medium">Niets staat open</p>
            <p className="text-[11px] text-ivory/35 mt-1">Alles is afgehandeld</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-ivory/10 flex items-center justify-end">
          <button onClick={(e) => { e.stopPropagation(); openModule("approvals"); }} className="flex items-center gap-1 text-[11px] font-semibold text-ivory hover:text-olive transition">
            Openen <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}