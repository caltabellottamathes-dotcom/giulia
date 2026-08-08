import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Mail, ArrowRight } from "lucide-react";

export default function EmailWidget() {
  const { openModule } = usePanel();
  const { data: emails, loading } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-created_date" });
  const unread = emails.filter((e) => e.status === "unread");
  const visible = emails.slice(0, 3);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("email")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Mail} label="Email" count={unread.length ? `${unread.length} ongelezen` : "gelezen"} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((e) => (
              <div key={e.id} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${e.status === "unread" ? "bg-olive" : "bg-foreground/20"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{e.sender || "Onbekend"}</p>
                  <p className="text-[11px] text-foreground/55 truncate">{e.subject}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Inbox leeg</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("email"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}