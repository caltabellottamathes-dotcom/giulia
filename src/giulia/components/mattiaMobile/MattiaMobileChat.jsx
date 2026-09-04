import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useMattiaChat } from "@/lib/useMattiaChat";

const BLUE = "#b1bfc7";

/** Mobiele Mattia-draad — jij rechts als charcoal-bubble, Mattia links als
 *  editorial-tekst op het ruitjespapier. "Mattia typt" rechts uitgelijnd. */
export default function MattiaMobileChat() {
  const { messages, send, sending } = useMattiaChat();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, sending]);

  const submit = () => {
    if (!text.trim() || sending) return;
    send(text.trim());
    setText("");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && !sending && (
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase pt-6" style={{ color: BLUE }}>
            Niets dringends. Zeg wat — Mattia antwoordt zoals hij is.
          </p>
        )}
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className={m.role === "user" ? "flex justify-end" : "flex flex-col"}>
            {m.role === "user" ? (
              <p className="max-w-[78%] rounded-2xl rounded-br-md bg-charcoal text-ivory px-4 py-2.5 text-[15px] leading-snug font-medium tracking-[-0.01em]">
                {m.content}
              </p>
            ) : (
              <>
                <p className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1" style={{ color: BLUE }}>Mattia</p>
                <p className="max-w-[86%] font-body text-[16px] leading-[1.45] text-black whitespace-pre-wrap">{m.content}</p>
              </>
            )}
          </motion.div>
        ))}
        {sending && (
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase flex items-center justify-end gap-1.5" style={{ color: BLUE }}>
            Mattia typt
            {[0, 1, 2].map((i) => (
              <span key={i} className="ontwerp-dot-bounce inline-block h-1 w-1 rounded-full bg-current" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </p>
        )}
      </div>

      <div className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t" style={{ borderColor: "#CCCCCC" }}>
        <div className="flex items-end gap-2.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Typ aan Mattia…"
            className="flex-1 h-12 rounded-full border border-charcoal/25 bg-transparent px-5 text-[15px] text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/60"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            aria-label="Verstuur"
            className="h-12 w-12 shrink-0 rounded-full bg-charcoal text-ivory flex items-center justify-center disabled:opacity-30 transition"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}