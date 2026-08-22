import React, { useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader, URGENT } from "@/system/widgets/primitives";
import { layeredContentPad } from "@/system/widgets/primitives/shellCode";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";

const PHOTO = IMAGES.focusTodo;
const DEEP = "hsl(var(--d-focus-deep))";   // burgundy
const LIGHT = "hsl(var(--d-focus-light))";  // cream
const IVORY = "hsl(var(--ivory))";

const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

/** WhatsAppChatFocusWidget — P·16x9·L·SIDE · "Who's Texting?"
 *  PhotoShell (rechts) = klein chatvenster: header + contactnaam + glazen
 *  bericht-pil + text-entry met verzendknop. GlassCard (links) = 5 laatste
 *  ongelezen berichten met leesbare contactnaam. Tik op een contact opent de
 *  conversatie in het chatvenster; nog eens tikken sluit; dubbelklik verwijdert
 *  hem uit de widget (markeer gelezen) zodat plaats komt voor een nieuw bericht.
 *  Data: WhatsAppMessage (received/unread) + Contact. Focus-kleuren + Urgent. */
export default function WhatsAppChatFocusWidget() {
  const { toast } = useToast();
  const { openModule } = usePanel();
  const { data: msgs, reload: reloadMsgs } = useEntityList("WhatsAppMessage", { sort: "-timestamp", limit: 80, realtime: true });
  const { data: contacts } = useEntityList("Contact", { sort: "-created_date", limit: 80, realtime: true });

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastTap = useRef({ id: null, t: 0 });

  const contactName = useMemo(() => {
    const map = {};
    (contacts || []).forEach((c) => { map[c.id] = c.name || c.phone || "Onbekend"; });
    return map;
  }, [contacts]);

  const received = useMemo(() => (msgs || []).filter((m) => m.direction === "received"), [msgs]);
  const unread = useMemo(() => received.filter((m) => m.status === "unread").slice(0, 5), [received]);
  const totalUnread = received.filter((m) => m.status === "unread").length;

  const selectedContact = (contacts || []).find((c) => c.id === selectedId);
  const conversation = useMemo(() => {
    if (!selectedId) return [];
    return (msgs || [])
      .filter((m) => m.contact_id === selectedId)
      .sort((a, b) => new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date))
      .slice(-4);
  }, [msgs, selectedId]);

  const tap = (row) => {
    const now = Date.now();
    const id = row.id;
    if (lastTap.current.id === id && now - lastTap.current.t < 360) {
      // dubbelklik → verwijder uit widget (markeer gelezen)
      base44.entities.WhatsAppMessage.update(id, { status: "read" }).catch(() => {});
      if (selectedId === row.contact_id) setSelectedId(null);
      reloadMsgs();
      lastTap.current = { id: null, t: 0 };
      return;
    }
    lastTap.current = { id, t: now };
    // enkele tik → toggle chat
    setSelectedId((cur) => (cur === row.contact_id ? null : row.contact_id));
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sending) return;
    setDraft("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendWhatsApp", { contact_id: selectedId, message: text });
      const r = res?.data ?? res;
      if (r?.ok) { reloadMsgs(); toast({ title: "Verzonden" }); }
      else { setDraft(text); toast({ title: "Verzenden mislukt", description: r?.error || "", variant: "destructive" }); }
    } catch {
      setDraft(text);
      toast({ title: "Verzenden mislukt", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget
        shape="16:9"
        photo={PHOTO}
        glassPosition="left"
        glassFraction={0.40}
        overhang={0}
        domain="focus"
        radius="large"
        onClick={() => openModule("whatsapp")}
        overlay="bg-gradient-to-t from-black/55 via-black/28 to-black/14"
        photoChildren={
          <div className="absolute inset-0 flex flex-col" style={layeredContentPad("left", 0.40)}>
            <WidgetHeader type="social" label="Who's Texting?" count={totalUnread ? String(totalUnread) : ""} />
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] truncate" style={{ color: IVORY }}>
              {selectedContact ? (selectedContact.name || selectedContact.phone || "Onbekend") : "WHO'S TEXTING."}
            </h3>

            {/* glazen bericht-pil */}
            <div className="flex-1 min-h-0 mt-2 overflow-hidden rounded-2xl flex flex-col gap-1.5 p-2.5"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)" }}
              onClick={(e) => e.stopPropagation()}>
              {!selectedId ? (
                <p className="text-[11px] text-ivory/55 m-auto text-center">Tik een contact links aan om te antwoorden.</p>
              ) : conversation.length === 0 ? (
                <p className="text-[11px] text-ivory/55 m-auto text-center">Geen berichten.</p>
              ) : conversation.map((m) => (
                <div key={m.id} className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wide" style={{ color: m.direction === "sent" ? "rgba(255,255,255,0.4)" : LIGHT }}>
                    {m.direction === "sent" ? "Ik" : (selectedContact?.name?.split(" ")[0] || "Zij")} · {fmtTime(m.timestamp)}
                  </span>
                  <p className="text-[12px] leading-snug" style={{ color: m.direction === "sent" ? "rgba(255,255,255,0.7)" : IVORY }}>{m.message}</p>
                </div>
              ))}
            </div>

            {/* text-entry + verzendknop */}
            <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={selectedId ? "Typ een reactie..." : "Selecteer een contact…"}
                disabled={!selectedId}
                className="flex-1 min-w-0 rounded-full px-3.5 py-2 text-[12px] text-ivory placeholder:text-ivory/40 focus:outline-none disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY }}
              />
              <button
                onClick={send}
                disabled={!selectedId || !draft.trim() || sending}
                aria-label="Verstuur"
                className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center disabled:opacity-40 transition"
                style={{ background: DEEP, color: IVORY }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        }
      >
        {/* GlassCard — 5 laatste ongelezen berichten met contact */}
        <div className="flex flex-col gap-1 h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-1 pb-1.5 mb-0.5 border-b border-white/12">
            <span className="text-[9px] uppercase tracking-[0.22em] font-bold text-ivory/55">Ongelezen</span>
            {totalUnread > 0 && <span className="text-[9px] font-mono tabular-nums" style={{ color: URGENT }}>{totalUnread} nieuw</span>}
          </div>
          {unread.length === 0 ? (
            <p className="text-[11px] text-ivory/55 px-1 py-1">Geen ongelezen berichten.</p>
          ) : unread.map((m) => {
            const name = (m.contact_id && contactName[m.contact_id]) || "Onbekend";
            const active = selectedId === m.contact_id;
            return (
              <button
                key={m.id}
                onClick={() => tap(m)}
                className="flex items-start gap-2 py-1.5 px-1.5 rounded-lg text-left transition-colors"
                style={{ background: active ? "rgba(255,255,255,0.10)" : "transparent" }}
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: IVORY }}>{name}</p>
                  <p className="text-[11px] leading-tight line-clamp-2 text-ivory/70">{m.message}</p>
                </div>
                {m.timestamp && <span className="text-[9px] text-ivory/40 shrink-0 pt-0.5">{fmtTime(m.timestamp)}</span>}
              </button>
            );
          })}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}