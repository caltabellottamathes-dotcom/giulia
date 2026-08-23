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
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";

const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

const initials = (name) => (name || "?").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

/** WhatsAppChatFocusWidget — P·16x9·L·SIDE · "Who's Texting?"
 *  GlassCard (links) = 5 laatste contacten die gestuurd hebben, in focus-kleuren
 *  (pistachio namen, plum initialen-rondjes, urgent-geel bij ongelezen).
 *  PhotoShell (rechts) = chatvenster, enkel zichtbaar als een contact is
 *  aangeklikt — anders enkel de achtergrond. */
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
  const totalUnread = received.filter((m) => m.status === "unread").length;

  const recentSenders = useMemo(() => {
    const byContact = new Map();
    received.forEach((m) => {
      if (!m.contact_id) return;
      const prev = byContact.get(m.contact_id);
      if (!prev || new Date(m.timestamp || m.created_date) > new Date(prev.timestamp || prev.created_date)) {
        byContact.set(m.contact_id, m);
      }
    });
    return [...byContact.values()]
      .sort((a, b) => new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date))
      .slice(0, 5);
  }, [received]);

  const selectedContact = (contacts || []).find((c) => c.id === selectedId);
  const conversation = useMemo(() => {
    if (!selectedId) return [];
    return (msgs || [])
      .filter((m) => m.contact_id === selectedId)
      .sort((a, b) => new Date(a.timestamp || a.created_date) - new Date(b.timestamp || b.created_date))
      .slice(-3);
  }, [msgs, selectedId]);

  const tap = (row) => {
    const now = Date.now();
    const id = row.id;
    if (lastTap.current.id === id && now - lastTap.current.t < 360) {
      base44.entities.WhatsAppMessage.update(id, { status: "read" }).catch(() => {});
      if (selectedId === row.contact_id) setSelectedId(null);
      reloadMsgs();
      lastTap.current = { id: null, t: 0 };
      return;
    }
    lastTap.current = { id, t: now };
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
        overlay="bg-gradient-to-t from-black/30 via-black/12 to-black/5"
        photoChildren={
          <div className="absolute inset-0 flex flex-col" style={layeredContentPad("left", 0.40)}>
            <WidgetHeader type="social" label="Who's Texting?" count="" />
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] truncate" style={{ color: DEEP }}>
              {selectedContact ? (selectedContact.name || selectedContact.phone || "Onbekend") : "UNREAD MESSAGES."}
            </h3>

            {selectedId && (
              <>
                <div className="flex-1 min-h-0 mt-2 overflow-hidden rounded-2xl flex flex-col gap-1.5 p-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
                  onClick={(e) => e.stopPropagation()}>
                  {conversation.length === 0 ? (
                    <p className="text-[11px] text-ivory/55 m-auto text-center">Geen berichten.</p>
                  ) : conversation.map((m) => (
                    <div key={m.id} className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wide" style={{ color: DEEP }}>
                        {m.direction === "sent" ? "Ik" : (selectedContact?.name?.split(" ")[0] || "Zij")} · {fmtTime(m.timestamp)}
                      </span>
                      <p className="text-[12px] leading-snug" style={{ color: m.direction === "sent" ? "rgba(255,255,255,0.7)" : IVORY }}>{m.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                    placeholder="Typ een reactie..."
                    className="flex-1 min-w-0 rounded-full px-3.5 py-2 text-[12px] text-ivory placeholder:text-ivory/40 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.22)", color: IVORY }}
                  />
                  <button
                    onClick={send}
                    disabled={!draft.trim() || sending}
                    aria-label="Verstuur"
                    className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center disabled:opacity-40 transition"
                    style={{ background: DEEP, color: IVORY }}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
            <div className="mt-auto flex items-end justify-end pt-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-[44px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>{totalUnread}</span>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-2 h-full overflow-hidden -mx-1 px-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-1 pb-1.5 mb-0.5 border-b border-white/12">
            <span className="text-[9px] uppercase tracking-[0.22em] font-bold text-ivory/55">Laatste afzenders</span>
            {totalUnread > 0 && <span className="text-[9px] font-mono tabular-nums" style={{ color: URGENT }}>{totalUnread} nieuw</span>}
          </div>
          {recentSenders.length === 0 ? (
            <p className="text-[11px] text-ivory/55 px-1 py-1">Nog geen berichten.</p>
          ) : recentSenders.map((m) => {
            const name = contactName[m.contact_id] || "Onbekend";
            const active = selectedId === m.contact_id;
            const unread = m.status === "unread";
            return (
              <button
                key={m.id}
                onClick={() => tap(m)}
                className="group flex items-center gap-2.5 py-1.5 pl-2.5 pr-1.5 rounded-xl text-left transition-colors hover:bg-white/8"
                style={{ background: active ? "rgba(255,255,255,0.10)" : "transparent" }}
              >
                <span className="h-7 w-[3px] rounded-full shrink-0 transition-colors" style={{ background: unread ? URGENT : LIGHT, opacity: unread ? 1 : 0.55 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: DEEP }}>{name}</p>
                  <p className="text-[9px] uppercase tracking-wide leading-tight" style={{ color: unread ? URGENT : "rgba(255,255,255,0.45)" }}>
                    {unread ? "Nieuw bericht" : "Gelezen"} · {fmtTime(m.timestamp)}
                  </p>
                </div>
                {unread && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: URGENT }} />}
              </button>
            );
          })}
          <div className="mt-auto pt-2 flex items-end gap-1 h-7" onClick={(e) => e.stopPropagation()}>
            {recentSenders.length === 0
              ? [0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="flex-1 rounded-sm" style={{ height: `${24 + ((i * 7) % 60)}%`, background: LIGHT, opacity: 0.3 }} />
                ))
              : recentSenders.slice(0, 6).map((m) => {
                  const cnt = received.filter((r) => r.contact_id === m.contact_id).length;
                  const h = Math.min(100, 25 + cnt * 14);
                  return <span key={m.id} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: m.status === "unread" ? URGENT : LIGHT, opacity: 0.85 }} />;
                })}
          </div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}