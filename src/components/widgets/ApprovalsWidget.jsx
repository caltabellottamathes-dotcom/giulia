import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockApprovals } from "@/lib/mockData";
import { ArrowUpRight, Mail, MessageCircle, Calendar, ListChecks } from "lucide-react";

const categoryIcon = {
  email: Mail,
  whatsapp: MessageCircle,
  calendar: Calendar,
  tasks: ListChecks,
};

const categoryChip = {
  email: "bg-cobalt/85 text-ivory",
  whatsapp: "bg-olive text-ivory",
  calendar: "bg-sienna text-ivory",
  tasks: "bg-ink text-ivory",
};

/**
 * ApprovalsWidget — pending drafts with color category chips + row hover.
 */
export default function ApprovalsWidget() {
  const { openModule } = usePanel();
  const pending = mockApprovals.filter((a) => a.status === "pending");
  const visible = pending.slice(0, 3);

  return (
    <WidgetShell
      size="2x1"
      radius="soft"
      depth={2}
      interactive
      onClick={() => openModule("approvals")}
      style={{ animationDelay: "320ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Ter goedkeuring
          </h3>
          {pending.length > 0 && (
            <span className="h-6 min-w-6 px-2 rounded-full bg-sienna text-ivory text-[11px] font-medium flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </div>

        {visible.length > 0 ? (
          <div className="flex-1 space-y-2.5">
            {visible.map((item) => {
              const Icon = categoryIcon[item.category] || ListChecks;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-all duration-300 hover:bg-foreground/[0.03] hover:translate-x-1"
                >
                  <span
                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                      categoryChip[item.category] || "bg-ink text-ivory"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-tight truncate">{item.description}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.target} · {item.proposed_action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <p className="text-sm text-muted-foreground/70 font-light">Niets staat open</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-end">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </div>
    </WidgetShell>
  );
}