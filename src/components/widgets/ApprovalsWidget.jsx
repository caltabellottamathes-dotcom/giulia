import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

/**
 * ApprovalsWidget — pending approvals from real Approval records.
 */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const { data: approvals, loading } = useEntityList("Approval", {
    filter: { status: "pending" },
  });
  const visible = approvals.slice(0, 3);

  return (
    <WidgetShell
      size="2x1"
      radius="soft"
      interactive
      onClick={() => openModule("approvals")}
      style={{ animationDelay: "210ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
            Ter goedkeuring
          </h3>
          {approvals.length > 0 && (
            <span className="text-[11px] font-semibold text-foreground tabular-nums">
              {approvals.length} wachtend
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 rounded-lg shimmer" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-foreground/55 truncate">
                    {item.target}
                    {item.proposed_action ? ` · ${item.proposed_action}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-foreground/50 font-medium">Niets staat open</p>
            <p className="text-[11px] text-foreground/35 mt-1">Alles is afgehandeld</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModule("approvals");
            }}
            className="text-[11px] font-semibold text-foreground hover:text-olive transition-colors"
          >
            Openen →
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}