import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";
import { IMAGES } from "@/lib/images";

/* ANALYSE — WhatsApp: totaal ongelezen, Giulia-concepten, top-gesprek met
 * bubbel, inline antwoorden, concept goedkeuren/afkeuren. Focus: gesprek +
 * Giulia-concepten naast elkaar, inline reageren.
 * D2 "Inkomend vs Giulia-concept" (4:3) — links laatste bericht-bubbel, rechts
 * Giulia's concept met goedkeuren. Motion: concept typt in.
 * D3 "Ongelezen-draden stapel" (3:4) — stapel gesprekskaarten (avatar+laatste+
 * badge), bovenste uitgeklapt met snel-antwoord. Motion: kaarten stapelen. */

export function WhatsAppDesign2() {
  const { data: msgs, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: drafts } = useEntityList("Approval", { filter: { type: "whatsapp", status: "pending" } });
  const { data: contacts } = useEntityList("Contact");
  const [typed, setTyped] = useState("");
  const last = (msgs || []).find((m) => m.direction === "received") || msgs?.[0];
  const draft = drafts?.[0];
  const name = (id) => contacts?.find((c) => c.id === id)?.name || "?";
  const approve = async (d) => { try { await base44.entities.Approval.update(d.id, { status: "executed" }); reload(); } catch {} };

  React.useEffect(() => {
    if (!draft?.content) { setTyped(""); return; }
    let i = 0; setTyped("");
    const t = setInterval(() => { i += 2; setTyped(draft.content.slice(0, i)); if (i >= draft.content.length) clearInterval(t); }, 28);
    return () => clearInterval(t);
  }, [draft?.id]);

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Who's Texting? · concept</p>
        <span className="text-[10px] tabular-nums opacity-50">{(msgs || []).filter((m) => m.status === "unread").length} ongelezen</span>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2.5 min-h-0">
        <div className="flex flex-col justify-end">
          <p className="text-[9px] uppercase tracking-wider opacity-50 mb-1.5">Inkomend</p>
          {last ? (
            <div className="glass-1 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[90%]">
              <p className="text-[9px] uppercase tracking-wider opacity-50 mb-0.5">{name(last.contact_id)}</p>
              <p className="text-[11px] leading-snug line-clamp-3">{last.message}</p>
            </div>
          ) : <p className="text-xs opacity-40">—</p>}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-[9px] uppercase tracking-wider opacity-50 mb-1.5">Giulia stelde voor</p>
          {draft ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl rounded-br-sm px-3 py-2" style={{ background: "var(--tile-accent)", color: "#fff" }}>
              <p className="text-[11px] leading-snug min-h-[2.5rem]">{typed}<span className="opacity-60 animate-pulse-soft">▍</span></p>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => approve(draft)} className="flex-1 rounded-full bg-ivory/20 py-1 text-[9px] font-semibold">Verstuur</button>
                <button onClick={() => approve(draft)} className="flex-1 rounded-full bg-ivory/10 py-1 text-[9px] font-semibold">Bewerk</button>
              </div>
            </motion.div>
          ) : <p className="text-xs opacity-40">Geen concept</p>}
        </div>
      </div>
    </div>
  );
}

export function WhatsAppDesign3() {
  const { data: msgs, reload } = useEntityList("WhatsAppMessage", { sort: "-created_date" });
  const { data: contacts } = useEntityList("Contact");
  const [reply, setReply] = useState("");
  const convos = useMemo(() => {
    const m = new Map();
    (msgs || []).forEach((msg) => {
      if (!msg.contact_id) return;
      const c = m.get(msg.contact_id) || { contact_id: msg.contact_id, last: msg, unread: 0, ts: "" };
      if (!c.ts || (msg.timestamp || msg.created_date || "") > c.ts) { c.last = msg; c.ts = msg.timestamp || msg.created_date; }
      if (msg.direction === "received" && msg.status === "unread") c.unread += 1;
      m.set(msg.contact_id, c);
    });
    return Array.from(m.values()).sort((a, b) => (b.ts || "").localeCompare(a.ts || "")).slice(0, 4);
  }, [msgs]);
  const name = (id) => contacts?.find((c) => c.id === id)?.name || "?";
  const send = async (c) => { if (!reply.trim()) return; try { await base44.entities.WhatsAppMessage.create({ contact_id: c.contact_id, message: reply.trim(), direction: "sent", status: "delivered" }); setReply(""); reload(); } catch {} };

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Who's Texting? · draden</p>
        <span className="text-[10px] tabular-nums opacity-50">{convos.reduce((s, c) => s + c.unread, 0)} ongelezen</span>
      </div>
      <div className="flex-1 space-y-1.5 min-h-0">
        {convos.map((c, i) => (
          <motion.div key={c.contact_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-1 rounded-xl px-2.5 py-2">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "var(--tile-accent)", color: "#fff" }}>{name(c.contact_id).slice(0, 1)}</span>
              <p className="text-[11px] font-semibold truncate flex-1">{name(c.contact_id)}</p>
              {c.unread > 0 && <span className="h-4 min-w-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "var(--tile-accent)", color: "#fff" }}>{c.unread}</span>}
            </div>
            {i === 0 && (<div className="mt-2 flex gap-1.5"><input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Snel antwoord…" className="flex-1 min-w-0 bg-ivory/8 border border-ivory/15 rounded-full px-2.5 py-1 text-[10px] focus:outline-none" /><button onClick={() => send(c)} className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: "var(--tile-accent)", color: "#fff" }}>→</button></div>)}
          </motion.div>
        ))}
        {convos.length === 0 && <p className="text-xs opacity-40 text-center mt-8">Geen berichten</p>}
      </div>
    </div>
  );
}

export default { Design2: WhatsAppDesign2, Design3: WhatsAppDesign3 };