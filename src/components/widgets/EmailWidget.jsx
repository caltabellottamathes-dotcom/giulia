import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmailWidget — mark mail read/unread and star importance inline.
 */
export default function EmailWidget() {
  const { openModule } = usePanel();
  const { data: emails, loading, reload } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-created_date" });
  const unread = emails.filter((e) => e.status === "unread");
  const visible = emails.slice(0, 4);

  const toggleRead = async (e, em) => {
    e.stopPropagation();
    try { await base44.entities.Email.update(em.id, { status: em.status === "unread" ? "read" : "unread" }); reload(); } catch {}
  };
  const toggleStar = async (e, em) => {
    e.stopPropagation();
    try { await base44.entities.Email.update(em.id, { important: !em.important }); reload(); } catch {}
  };

  return (
    <WidgetShell size="2x2" radius="medium" glass="translucent" interactive onClick={() => openModule("email")} className="min-h-[300px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Mail} label="Email" count={unread.length ? `${unread.length} ongelezen` : "alles gelezen"} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-1.5 overflow-hidden">
            {visible.map((em) => (
              <div key={em.id} className="flex items-center gap-2.5 py-1">
                <button
                  onClick={(e) => toggleRead(e, em)}
                  className="h-4 w-4 rounded-full border border-ivory/25 shrink-0 flex items-center justify-center hover:border-olive transition"
                  aria-label="Gelezen markeren"
                >
                  {em.status === "unread" && <span className="h-2 w-2 rounded-full bg-olive" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm leading-tight truncate", em.status === "unread" ? "font-semibold text-ivory" : "font-medium text-ivory/70")}>
                    {em.sender || "Onbekend"}
                  </p>
                  <p className="text-[11px] text-ivory/55 truncate">{em.subject}</p>
                </div>
                <button
                  onClick={(e) => toggleStar(e, em)}
                  className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-ivory/5 transition"
                  aria-label="Belangrijk"
                >
                  <Star className={cn("h-3.5 w-3.5", em.important ? "fill-olive text-olive" : "text-ivory/30")} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-ivory/45">Inbox is leeg</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}