import React, { useRef, useState, useEffect } from "react";
import { useGiuliaChat } from "@/lib/useGiuliaChat";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { X, ArrowUp, Phone, Paperclip, Image as ImageIcon, Film, Music, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";
import { useActiveDomain } from "@/lib/useActiveDomain";
import { cn } from "@/lib/utils";
import { useMediaViewer } from "@/lib/MediaViewerContext";

/**
 * ChatStage — de chat-view van het multi-functionele GlassPanel.
 * Same shared gesprek als de /chat-pagina (useGiuliaChat). Vult het paneel;
 * sluiten/overlay/Escape worden door het FloatingPanel geregeld.
 */
const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Stel een concept-email op",
  "Zijn er agendabotsingen deze week?",
  "Maak een taak aan: review concurrenten",
];

function BouncingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ivory/60"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function ChatStage() {
  const { pendingMessage, setPendingMessage } = usePanel();
  const { messages, send, sending, ready } = useGiuliaChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const { openMedia } = useMediaViewer();
  const { accent, bubbleText } = useActiveDomain();

  const scrollToBottom = (behavior = "smooth") =>
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  useEffect(() => { scrollToBottom("auto"); }, [messages, sending]);

  const doSend = async (text) => {
    const content = (text ?? input).trim();
    if ((!content && attachments.length === 0) || sending) return;
    const atts = attachments;
    setInput("");
    setAttachments([]);
    scrollToBottom();
    try {
      await send(content, { attachments: atts, file_urls: atts.map((a) => a.url) });
    } catch { /* hook toont de fout in het gesprek */ }
  };

  // Berichten uit de interaction-bar worden hier bij openen doorgesluisd.
  useEffect(() => {
    if (pendingMessage && ready) {
      const msg = pendingMessage;
      setPendingMessage(null);
      doSend(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage, ready]);

  const onPickFile = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const uploaded = [];
    for (const f of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        const type = ["png","jpg","jpeg","gif","webp"].includes(ext) ? "image" : ["mp4","mov","webm","mkv"].includes(ext) ? "video" : ["mp3","wav","m4a","flac","aac","ogg"].includes(ext) ? "audio" : "doc";
        uploaded.push({ url: file_url, name: f.name, type });
      } catch { /* ignore */ }
    }
    if (uploaded.length) setAttachments((prev) => [...prev, ...uploaded]);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-44" style={{ background: "radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.07), transparent 72%)" }} />

      <div className="shrink-0 px-7 pt-7 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full animate-pulse-soft" style={{ background: accent }} />
          <div>
            <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">GIULIA-GIULIA</p>
            <p className="text-[11px] text-ivory/50 mt-1.5 tracking-wide">De drijvende motor · altijd actief</p>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("giulia:ontwerp-stage", { detail: "voice" }))}
          className="flex items-center gap-2 rounded-full pl-3 pr-4 py-2 bg-ivory/10 border border-ivory/15 text-ivory/80 text-[12px] font-medium hover:bg-ivory/15 transition-all"
          title="Bel Giulia (ElevenLabs voice agent)"
        >
          <Phone className="h-3.5 w-3.5" /> Bel
        </button>
      </div>

      <div className="px-7 pb-1"><div className="h-px" style={{ background: accent, opacity: 0.6 }} /></div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-7 py-4 space-y-4">
        {messages.length === 0 && !sending && ready && (
          <div className="flex flex-col items-center text-center py-14 px-4">
            <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">Hier is GIULIA-GIULIA.</p>
            <p className="text-[13px] text-ivory/55 max-w-[18rem] leading-relaxed">
              De drijvende motor achter je OS. Ik beheer alles — agenda, taken, mail, projecten — autonoom. Vraag me anything.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} accent={accent} bubbleText={bubbleText} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-ivory/60 text-xs ml-1">
            <BouncingDots />
            <span>Aan het typen…</span>
          </div>
        )}
      </div>

      {messages.length === 0 && ready && (
        <div className="px-7 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => doSend(s)} className="chat-bubble px-4 py-2 text-[12px] text-ivory/70 hover:text-ivory transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="shrink-0 px-7 pb-7 pt-4">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full bg-ivory/10 border border-ivory/15 pl-2.5 pr-1.5 py-1">
                <span className="text-ivory/70">{a.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : a.type === "video" ? <Film className="h-3.5 w-3.5" /> : a.type === "audio" ? <Music className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}</span>
                <span className="text-[11px] text-ivory/80 max-w-[140px] truncate">{a.name}</span>
                <button onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-ivory/50 hover:text-ivory"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <button onClick={() => fileRef.current?.click()} className="h-12 w-12 shrink-0 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-ivory/15 transition-colors" aria-label="Bijlage toevoegen">
            <Paperclip className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onPickFile} />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
            placeholder="Vraag Giulia anything…  (Enter = verstuur · Shift+Enter = nieuwe regel)"
            rows={1}
            className="flex-1 chat-bubble px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none resize-none max-h-40"
            style={{ minHeight: "48px" }}
          />
          <button onClick={() => doSend()} disabled={(!input.trim() && attachments.length === 0) || sending} className="h-12 w-12 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100" aria-label="Verstuur">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, accent, bubbleText }) {
  const isUser = message.role === "user";
  const { openMedia } = useMediaViewer();
  const atts = message.attachments || [];
  const renderAtt = (a, i) => (
    <button key={i} onClick={() => openMedia({ name: a.name, url: a.url, type: a.type })} className="mt-2 flex items-center gap-2 rounded-lg bg-black/20 border border-white/10 px-2.5 py-1.5 text-left max-w-full">
      <span className="text-ivory/70 shrink-0">{a.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : a.type === "video" ? <Film className="h-3.5 w-3.5" /> : a.type === "audio" ? <Music className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}</span>
      <span className="text-[11px] text-ivory/85 truncate">{a.name}</span>
    </button>
  );
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className={cn("max-w-[80%] break-words rounded-[20px] rounded-br-md px-[18px] py-3 text-sm leading-relaxed tracking-[-0.01em]", bubbleText)} style={{ background: accent }}>
          {message.content}
          {atts.map(renderAtt)}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] min-w-0 break-words overflow-hidden chat-bubble px-[18px] py-3 text-sm text-ivory leading-relaxed [&_pre]:overflow-x-auto [&_pre]:max-w-full">
        <ChatMarkdown>{message.content}</ChatMarkdown>
        {atts.map(renderAtt)}
      </div>
    </div>
  );
}