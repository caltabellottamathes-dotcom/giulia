import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModuleShell from "@/glass/components/modules/ModuleShell";

const SAND = "#94925d", URG = "#d5e24a";
const CHATS = [
  { id: 1, name: "Giulia Visser", last: "Update Marktanalyse", time: "14:32", unread: 2, online: true },
  { id: 2, name: "F. de Boer", last: "Concept Brons feedback", time: "11:48", unread: 0, online: false },
  { id: 3, name: "Centrum West", last: "Ruimte bevestigd", time: "09:20", unread: 1, online: true },
  { id: 4, name: "T. Bakker", last: "Tot morgen!", time: "gisteren", unread: 0, online: false },
  { id: 5, name: "S. Kaya", last: "Design draft klaar", time: "gisteren", unread: 3, online: true },
];
const SEED = [
  { id: 1, me: false, text: "Heb je het rapport al?", time: "14:30" },
  { id: 2, me: true, text: "Bijna klaar, stuur het vandaag", time: "14:31" },
  { id: 3, me: false, text: "Top, ik wacht 👍", time: "14:32" },
];
const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function WhatsAppPreview() {
  const [active, setActive] = useState(1);
  const [msgs, setMsgs] = useState(SEED);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  const activeChat = CHATS.find(c => c.id === active);
  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMsgs(m => [...m, { id: Date.now(), me: true, text, time }]);
    setText("");
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { id: Date.now() + 1, me: false, text: "Begrepen, ik pak het op 👍", time }]);
      }, 1800);
    }, 600);
  };
  return (
    <ModuleShell index="13" section="WHATSAPP" statement="CHATS" kicker="5 CONVERSATIONS"
      context={[
        { label: "ONLINE", text: `${CHATS.filter(c => c.online).length} contacten nu online.` },
        { label: "UNREAD", text: `${CHATS.reduce((s, c) => s + c.unread, 0)} ongelezen berichten.` },
        { label: "ACTIEF", text: "Type een bericht — je krijgt een live reactie." },
      ]}
      actions={[{ label: "New Chat", primary: true }, { label: "Archive" }, { label: "Settings" }, { label: "Open WhatsApp" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] h-full overflow-hidden rounded-2xl border border-marble/20 bg-marble/5">
        <div className="flex flex-col border-r border-marble/15 overflow-hidden">
          <div className="p-3 border-b border-marble/15"><p className="text-storm/50 text-[10px] tracking-[0.25em]">CONVERSATIONS</p></div>
          <div className="flex-1 overflow-auto">
            {CHATS.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active === c.id ? "bg-marble/15" : "hover:bg-marble/8"}`}>
                <span className="relative shrink-0">
                  <span className="w-9 h-9 rounded-full bg-plum/40 text-storm text-[10px] font-semibold flex items-center justify-center">{initials(c.name)}</span>
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-urgent border-2 border-metal" />}
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
            <span className="relative shrink-0">
              <span className="w-8 h-8 rounded-full bg-plum/40 text-storm text-[10px] font-semibold flex items-center justify-center">{initials(activeChat.name)}</span>
              {activeChat.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-urgent border-2 border-metal" />}
            </span>
            <div><p className="text-sm text-storm">{activeChat.name}</p><p className="text-[10px] text-storm/50">{activeChat.online ? "online" : "offline"}</p></div>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4 space-y-2">
            <AnimatePresence>
              {msgs.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.me ? "bg-sand text-storm ml-auto rounded-br-sm" : "bg-plum/50 text-storm rounded-bl-sm"}`}>
                  {m.text}
                  <span className="block text-[8px] text-storm/50 mt-0.5 text-right">{m.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-3 py-2 w-fit rounded-2xl bg-plum/50 rounded-bl-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-storm/60 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-storm/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-storm/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
              </motion.div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-marble/15">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Bericht..." className="flex-1 rounded-full border border-marble/30 bg-marble/5 px-4 py-2.5 text-sm text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand" />
            <button onClick={send} className="px-5 py-2.5 rounded-full bg-urgent text-plum text-xs font-semibold tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all">Send</button>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}