import React, { useMemo } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function WhatsAppWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const { data: messages } = useEntityList("WhatsAppMessage", { sort: "-created_date" });

  const convos = useMemo(() => {
    const byContact = new Map();
    messages.forEach((m) => {
      const id = m.contact_id;
      if (!id) return;
      if (!byContact.has(id)) byContact.set(id, { contact_id: id, last: m, unread: 0 });
      const cur = byContact.get(id);
      if (!cur.last_ts || (m.timestamp || m.created_date || "") > (cur.last_ts || "")) {
        cur.last = m; cur.last_ts = m.timestamp || m.created_date;
      }
      if (m.direction === "received" && m.status === "unread") cur.unread += 1;
    });
    return Array.from(byContact.values())
      .sort((a, b) => (b.last_ts || "").localeCompare(a.last_ts || ""))
      .slice(0, 3);
  }, [messages]);

  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("whatsapp")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={MessageCircle} label="WhatsApp" count={convos.length ? `${convos.length} chats` : "leeg"} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : convos.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {convos.map((c) => (
              <div key={c.contact_id} className="flex items-start gap-2.5">
                <span className="mt-1 h-7 w-7 rounded-full bg-olive/20 border border-olive/30 flex items-center justify-center text-[10px] font-semibold text-olive shrink-0">
                  {nameOf(c.contact_id).slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{nameOf(c.contact_id)}</p>
                    {c.unread > 0 && <span className="text-[10px] font-semibold text-ivory bg-olive rounded-full px-1.5 py-0.5 shrink-0">{c.unread}</span>}
                  </div>
                  <p className="text-[11px] text-foreground/55 truncate">{c.last.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen berichten</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("whatsapp"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}