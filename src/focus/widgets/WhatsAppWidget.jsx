import React, { useMemo, useState } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import CountUp from "../../system/widgets/CountUp";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/** WhatsAppWidget — photo floats over the glass (unread count on the photo). */
export default function WhatsAppWidget() {
  const { openModule } = usePanel();
  const { data: contacts, loading } = useEntityList("Contact");
  const { data: messages, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: drafts } = useEntityList("Approval", { filter: { type: "whatsapp", status: "pending" } });
  const [reply, setReply] = useState("");

  const draftsReady = useMemo(() => drafts.filter((d) => d.status === "pending"), [drafts]);
  const convos = useMemo(() => {
    const byContact = new Map();
    messages.forEach((m) => {
      const id = m.contact_id; if (!id) return;
      if (!byContact.has(id)) byContact.set(id, { contact_id: id, last: m, unread: 0, last_ts: "" });
      const cur = byContact.get(id);
      if (!cur.last_ts || (m.timestamp || m.created_date || "") > (cur.last_ts || "")) { cur.last = m; cur.last_ts = m.timestamp || m.created_date; }
      if (m.direction === "received" && m.status === "unread") cur.unread += 1;
    });
    return Array.from(byContact.values()).sort((a, b) => (b.last_ts || "").localeCompare(a.last_ts || "")).slice(0, 3);
  }, [messages]);

  const nameOf = (id) => contacts.find((c) => c.id === id)?.name || "Onbekend";
  const top = convos[0];
  const unreadTotal = convos.reduce((s, c) => s + c.unread, 0);
  const draftForTop = top && draftsReady.some((d) => d.thread_id === top.contact_id);
  const send = async (e) => { e.stopPropagation(); if (!reply.trim() || !top) return; try { await base44.entities.WhatsAppMessage.create({ contact_id: top.contact_id, message: reply.trim(), direction: "sent", status: "delivered" }); setReply(""); reload(); } catch {} };

  return (
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("whatsapp")} className="min-h-[240px]">
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.stilettoHead} className="h-24 -mb-8 rounded-b-[24px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10" overlay="bg-gradient-to-t from-charcoal/85 to-charcoal/30">
          <div className="absolute inset-0 px-5 flex items-end justify-between pb-3">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80 mb-1">Who's Texting?</h3>
              {unreadTotal > 0 && (
                <div className="flex items-end gap-2">
                  <CountUp value={unreadTotal} className="text-3xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/75 mb-1">ongelezen</p>
                </div>
              )}
            </div>
            {draftsReady.length > 0 && <span className="text-[10px] uppercase tracking-wider text-ivory/70">{draftsReady.length} concept</span>}
          </div>
        </BrandPhoto>

        <div className="p-5 pt-10 flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : top ? (
            <>
              <div className="flex items-start gap-2.5">
                <span className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{nameOf(top.contact_id).slice(0, 1).toUpperCase()}</span>
                <div className="relative flex-1 rounded-2xl rounded-tl-sm px-4 py-3 bg-current/[0.08]">
                  <p className="text-[10px] uppercase tracking-wider opacity-50 mb-0.5">{nameOf(top.contact_id)}</p>
                  <p className="text-sm text-current leading-snug line-clamp-2">{top.last.message}</p>
                  {top.unread > 0 && <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{top.unread}</span>}
                </div>
              </div>
              {draftForTop && (
                <button onClick={(e) => { e.stopPropagation(); openModule("whatsapp"); }} className="mt-3 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold border border-current/15 text-current transition hover:bg-current/5">Giulia stelde een concept voor</button>
              )}
              <form onSubmit={(e) => { e.preventDefault(); send(e); }} onClick={(e) => e.stopPropagation()} className="mt-auto pt-3 flex items-center gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Antwoord aan ${nameOf(top.contact_id)}…`} className="flex-1 min-w-0 bg-current/5 border border-current/15 rounded-full px-4 py-2.5 text-sm text-current placeholder:text-current/40 focus:outline-none focus:border-current/40" />
                <button type="submit" className="h-11 w-11 rounded-full flex items-center justify-center font-semibold transition hover:-translate-y-0.5 active:scale-95 shrink-0" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>→</button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Geen berichten</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}