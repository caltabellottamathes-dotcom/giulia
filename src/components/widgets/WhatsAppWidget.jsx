import React, { useMemo, useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WhatsAppWidget — quick-reply to your most recent chat, right from the tile.
 */
export default function WhatsAppWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const { data: messages, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: drafts } = useEntityList("GiuliaDraft", { filter: { type: "whatsapp" } });
  const [reply, setReply] = useState("");

  const draftsReady = useMemo(() => drafts.filter((d) => d.status === "awaiting_approval"), [drafts]);
  const draftFor = (id) => draftsReady.some((d) => d.contact_id === id);

  const convos = useMemo(() => {
    const byContact = new Map();
    messages.forEach((m) => {
      const id = m.contact_id;
      if (!id) return;
      if (!byContact.has(id)) byContact.set(id, { contact_id: id, last: m, unread: 0, last_ts: "" });
      const cur = byContact.get(id);
      if (!cur.last_ts || (m.timestamp || m.created_date || "") > (cur.last_ts || "")) {
        cur.last = m; cur.last_ts = m.timestamp || m.created_date;
      }
      if (m.direction === "received" && m.status === "unread") cur.unread += 1;
    });
    return Array.from(byContact.values()).sort((a, b) => (b.last_ts || "").localeCompare(a.last_ts || "")).slice(0, 3);
  }, [messages]);

  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";
  const top = convos[0];

  const send = async (e) => {
    e.stopPropagation();
    if (!reply.trim() || !top) return;
    try {
      await base44.entities.WhatsAppMessage.create({ contact_id: top.contact_id, message: reply.trim(), direction: "sent", status: "delivered" });
      setReply("");
      reload();
    } catch {}
  };

  return (
    <WidgetShell size="2x2" radius="medium" glass="translucent" interactive onClick={() => openModule("whatsapp")} className="min-h-[280px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={MessageCircle} label="WhatsApp" count={draftsReady.length ? `${draftsReady.length} klaar` : convos.length ? `${convos.length} chats` : "leeg"} />

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-9 rounded-lg shimmer" />)}
          </div>
        ) : convos.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {convos.map((c, i) => (
              <div key={c.contact_id} className={cn("flex items-start gap-2.5", i === 0 && "bg-olive/[0.06] -mx-2 px-2 py-1.5 rounded-lg")}>
                <span className="mt-1 h-7 w-7 rounded-full bg-olive/20 border border-olive/30 flex items-center justify-center text-[10px] font-semibold text-olive shrink-0">
                  {nameOf(c.contact_id).slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{nameOf(c.contact_id)}</p>
                    {draftFor(c.contact_id) && <Sparkles className="h-3 w-3 text-sand shrink-0" />}
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

        {top && (
          <form onSubmit={(e) => { e.preventDefault(); send(e); }} onClick={(e) => e.stopPropagation()} className="mt-3 pt-3 border-t border-foreground/10 flex items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={`Antwoord aan ${nameOf(top.contact_id)}…`}
              className="flex-1 min-w-0 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-olive/40"
            />
            <button type="submit" className="h-8 w-8 rounded-full bg-olive text-ivory flex items-center justify-center shrink-0 hover:bg-olive/90 transition" aria-label="Verstuur">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </WidgetShell>
  );
}