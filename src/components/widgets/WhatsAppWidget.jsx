import React, { useMemo, useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";

/**
 * WhatsAppWidget — conversation as a bespoke chat bubble with the latest
 * message preview and a status dot. Hero is the unread count; reply inline
 * with a sculpted send button. A draft-ready pill surfaces Giulia's concept.
 */
export default function WhatsAppWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const { data: messages, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: drafts } = useEntityList("GiuliaDraft", { filter: { type: "whatsapp" } });
  const [reply, setReply] = useState("");

  const draftsReady = useMemo(() => drafts.filter((d) => d.status === "awaiting_approval"), [drafts]);

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
  const unreadTotal = convos.reduce((s, c) => s + c.unread, 0);
  const draftForTop = top && draftsReady.some((d) => d.contact_id === top.contact_id);

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
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("whatsapp")} className="min-h-[280px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="WhatsApp" count={unreadTotal ? `${unreadTotal} nieuw` : draftsReady.length ? `${draftsReady.length} concept` : convos.length ? `${convos.length} chats` : "leeg"} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : top ? (
          <div className="flex-1 flex flex-col justify-center">
            {unreadTotal > 0 && (
              <div className="flex items-end gap-2 mb-3">
                <CountUp value={unreadTotal} className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-current" />
                <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mb-1.5">ongelezen</p>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <span className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{nameOf(top.contact_id).slice(0, 1).toUpperCase()}</span>
              <div className="relative flex-1 rounded-2xl rounded-tl-sm px-4 py-3 bg-ivory/[0.08]">
                <p className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">{nameOf(top.contact_id)}</p>
                <p className="text-sm text-current leading-snug line-clamp-2">{top.last.message}</p>
                {top.unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{top.unread}</span>
                )}
              </div>
            </div>

            {draftForTop && (
              <button onClick={(e) => { e.stopPropagation(); openModule("whatsapp"); }} className="mt-3 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold border border-ivory/15 text-current transition hover:bg-ivory/5">
                Giulia stelde een concept voor
              </button>
            )}

            <form onSubmit={(e) => { e.preventDefault(); send(e); }} onClick={(e) => e.stopPropagation()} className="mt-3 flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Antwoord aan ${nameOf(top.contact_id)}…`}
                className="flex-1 min-w-0 bg-ivory/5 border border-ivory/15 rounded-full px-4 py-2.5 text-sm text-current placeholder:text-ivory/40 focus:outline-none focus:border-ivory/40"
              />
              <button type="submit" className="h-11 w-11 rounded-full flex items-center justify-center font-semibold transition hover:-translate-y-0.5 active:scale-95 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>→</button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center"><p className="text-xs text-ivory/45">Geen berichten</p></div>
        )}
      </div>
    </WidgetShell>
  );
}