import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", MID = "#94925d";
const initials = (name) => (name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function WhatsAppPreview({ onOpen }) {
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const load = async () => {
    try {
      const data = await base44.entities.WhatsAppMessage.filter({}, "-timestamp", 50);
      const grouped = {};
      (data || []).forEach(m => {
        const name = m.sender || m.from || "Onbekend";
        if (!grouped[name]) grouped[name] = { id: name, name, msgs: [], unread: 0, last: "", time: "" };
        grouped[name].msgs.push(m);
        if (m.status === "unread" || m.status === "incoming") grouped[name].unread++;
        grouped[name].last = m.message || m.body || "";
        grouped[name].time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—";
      });
      const arr = Object.values(grouped);
      setChats(arr);
      if (arr.length && !active) setActive(arr[0].id);
      if (active) setMsgs(grouped[active]?.msgs || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setMsgs(chats.find(c => c.id === active)?.msgs || []); }, [active, chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const activeChat = chats.find(c => c.id === active) || { name: "—", msgs: [] };

  return (
    <PreviewShell index="13" section="WHATSAPP" statement="CHATS" kicker={`${chats.length} CONVERSATIONS`} accent={URG}
      context={[
        { label: "UNREAD", text: `${chats.reduce((s, c) => s + c.unread, 0)} ongelezen berichten.` },
        { label: "CHATS", text: `${chats.length} actieve conversaties.` },
        { label: "ACTIEF", text: activeChat ? activeChat.name : "Selecteer een chat." },
      ]}
      actions={[{ label: "New Chat", primary: true, to: "/whatsapp" }, { label: "Archive", to: "/whatsapp" }, { label: "Settings", to: "/whatsapp" }, { label: "Open WhatsApp", to: "/whatsapp" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] h-full overflow-hidden rounded-2xl border border-marble/20 bg-marble/5">
        <div className="flex flex-col border-r border-marble/15 overflow-hidden">
          <div className="p-3 border-b border-marble/15"><p className="text-storm/50 text-[10px] tracking-[0.25em]">CONVERSATIONS</p></div>
          <div className="flex-1 overflow-auto">
            {loading ? <p className="text-storm/40 text-sm p-4">Laden…</p> : chats.length === 0 ? <p className="text-storm/40 text-sm p-4">Geen chats.</p> : chats.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active === c.id ? "bg-marble/15" : "hover:bg-marble/8"}`}>
                <span className="relative shrink-0">
                  <span className="w-9 h-9 rounded-full bg-plum/40 text-storm text-[10px] font-semibold flex items-center justify-center">{initials(c.name)}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm truncate">{c.name}</p>
                  <p className="text-[11px] text-storm/50 truncate">{c.last}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[9px] text-storm/40">{c.time}</span>
                  {c.unread > 0 && <span className="text-[9px] px-1.5 rounded-full bg-urgent text-plum font-semibold">{c.unread}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-marble/15">
            <span className="w-8 h-8 rounded-full bg-plum/40 text-storm text-[10px] font-semibold flex items-center justify-center shrink-0">{initials(activeChat.name)}</span>
            <div><p className="text-sm text-storm">{activeChat.name}</p><p className="text-[10px] text-storm/50">WhatsApp</p></div>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4 space-y-2">
            <AnimatePresence>
              {msgs.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.direction === "outgoing" || m.status === "sent" ? "bg-sand text-storm ml-auto rounded-br-sm" : "bg-plum/50 text-storm rounded-bl-sm"}`}>
                  {m.message || m.body}
                  <span className="block text-[8px] text-storm/50 mt-0.5 text-right">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {msgs.length === 0 && <p className="text-storm/40 text-sm">Selecteer een conversatie.</p>}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-marble/15">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Bericht..." className="flex-1 rounded-full border border-marble/30 bg-marble/5 px-4 py-2.5 text-sm text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand" />
            <button onClick={() => setText("")} className="px-4 py-2.5 rounded-full bg-urgent text-plum text-xs font-semibold tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all">Send</button>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}