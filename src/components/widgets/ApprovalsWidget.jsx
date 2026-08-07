import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockApprovals } from "@/lib/mockData";
import { ClipboardCheck, ArrowUpRight, Mail, MessageCircle, Calendar } from "lucide-react";

const categoryIcon = {
  email: Mail,
  whatsapp: MessageCircle,
  calendar: Calendar,
  tasks: ClipboardCheck,
};

const categoryAccent = {
  email: "text-[#2D2D23]",
  whatsapp: "text-[#868564]",
  calendar: "text-[#B1BEC6]",
  tasks: "text-[#2D2D23]/70",
};

/**
 * ApprovalsWidget — pending drafts awaiting approval.
 * Count + short description; tap opens Approvals module.
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center">
              <ClipboardCheck className="h-3.5 w-3.5 text-[#2D2D23]" />
            </div>
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#2D2D23]/55">
              Ter goedkeuring
            </h3>
          </div>
          {pending.length > 0 && (
            <span className="h-6 min-w-6 px-2 rounded-full bg-[#2D2D23] text-[#F2F2F0] text-[11px] font-medium flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </div>

        {/* Drafts */}
        {visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((item) => {
              const Icon = categoryIcon[item.category] || ClipboardCheck;
              return (
                <div key={item.id} className="flex items-start gap-2.5">
                  <Icon
                    className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                      categoryAccent[item.category] || "text-[#2D2D23]/70"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2D2D23] leading-tight truncate">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-[#2D2D23]/50 truncate">
                      {item.target} · {item.proposed_action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <p className="text-sm text-[#2D2D23]/45 font-light">Niets staat open</p>
            <p className="text-[11px] text-[#2D2D23]/30 mt-1">Alles is afgehandeld</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[#868564]/15 flex items-center justify-end">
          <ArrowUpRight className="h-4 w-4 text-[#2D2D23]/40" />
        </div>
      </div>
    </WidgetShell>
  );
}