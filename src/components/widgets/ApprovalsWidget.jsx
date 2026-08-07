import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockApprovals } from "@/lib/mockData";

/**
 * ApprovalsWidget — pending drafts awaiting approval, clean readable rows.
 */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const pending = mockApprovals.filter((a) => a.status === "pending");
  const visible = pending.slice(0, 3);

  return (
    <WidgetShell
      size="2x1"
      radius="soft"
      interactive
      onClick={() => openModule("approvals")}
      style={{ animationDelay: "210ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
            Ter goedkeuring
          </h3>
          {pending.length > 0 && (
            <span className="text-[11px] font-semibold text-foreground tabular-nums">
              {pending.length} wachtend
            </span>
          )}
        </div>

        {/* Drafts */}
        {visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight truncate">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-foreground/55 truncate">
                    {item.target} · {item.proposed_action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-foreground/50 font-light">Niets staat open</p>
            <p className="text-[11px] text-foreground/35 mt-1">Alles is afgehandeld</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModule("approvals");
            }}
            className="text-[11px] font-medium text-foreground hover:text-olive transition-colors"
          >
            Openen →
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}