import React, { useRef, useState, useEffect } from "react";
import { useMattiaChat } from "@/lib/useMattiaChat";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { X, ArrowUp, Phone, Paperclip, Image as ImageIcon, Film, Music, FileText, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Image } from "@/components/ui/image";
import { IMAGES } from "@/lib/images";
import LibraryPicker from "@/system/components/files/LibraryPicker";

/**
 * MattiaChatWindow — MATTIA'S HOTLINE · chat. Full-screen LINKS-schuivend paneel
 * (Giulia komt van rechts — direct duidelijk met wie je praat). Fotobanner-header
 * met Mattia's gezicht, olijf/pistache-thema. Praat met Mattia via useMattiaChat
 * (chatWithMattia, BYOK MATTIA Gemini-key). De Bel-knop opent de voice-agent.
 */
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const DEEP_OLIVE = "#595f34";

const SUGGESTIONS = [
  "Wat zit je echt dwars?",
  "Is dit een goed idee of gewoon drukte?",
  "Zeg me wat ik mis zie.",
  "Praat me erdoorheen.",
];

function BouncingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: PISTACHIO }}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function MattiaChatWindow() {
  const { mattiaChatOpen, closeMattiaChat, openMattiaVoice, pendingMattiaMessage, setPendingMattiaMessage } = usePanel();
  const { messages, send, sending, ready } = useMattiaChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [libOpen, setLibOpen] = useState(false);

  useEffect(() => {
    if (mattiaChatOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mattiaChatOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && mattiaChatOpen) closeMattiaChat(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mattiaChatOpen, closeMattiaChat]);

  const scrollToBottom = (behavior = "smooth") =>
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });

  useEffect(() => {
    if (!mattiaChatOpen) return;
    const timers = [];
    timers.push(setTimeout(() => scrollToBottom("auto"), 40));
    timers.push(setTimeout(() => scrollToBottom("auto"), 220));
    timers.push(setTimeout(() => scrollToBottom("auto"), 460));
    return () => timers.forEach(clearTimeout);
  }, [mattiaChatOpen]);

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
    } catch { /* hook toont de fout via het gesprek */ }
  };

  useEffect(() => {
    if (mattiaChatOpen && pendingMattiaMessage && ready) {
      const msg = pendingMattiaMessage;
      setPendingMattiaMessage(null);
      doSend(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattiaChatOpen, pendingMattiaMessage, ready]);

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

  const onPickLibrary = ({ url, name, kind }) => {
    setAttachments((prev) => [...prev, { url, name, type: kind === "music" ? "audio" : kind }]);
  };

  if (!mattiaChatOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/15 animate-fade-in" onClick={closeMattiaChat} />

      {/* Mattia schuift in van LINKS — Giulia komt van rechts. Direct duidelijk met wie je praat. */}
      <div className="fixed left-4 lg:left-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[460px] animate-slide-left">
        <div
          className="relative h-full flex flex-col rounded-[28px] overflow-hidden"
          style={{
            background: "rgba(48,52,40,0.55)",
            backdropFilter: "blur(48px) saturate(1.4)",
            WebkitBackdropFilter: "blur(48px) saturate(1.4)",
            border: "1px solid rgba(216,218,179,0.18)",
            boxShadow: "0 24px 60px -22px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.16)",
          }}
        >
          {/* Fotobanner-header — Mattia's gezicht als herkenningspunt */}
          <div className="relative h-40 shrink-0">
            <Image src={IMAGES.mattiaPortrait} fittingType="fill" focalPointX={0.5} focalPointY={0.35} alt="Mattia" className="absolute inset-0 w-full h-full" draggable={false} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(48,52,40,0.96) 6%, rgba(48,52,40,0.30) 60%, rgba(48,52,40,0.18) 100%)" }} />
            <button
              onClick={closeMattiaChat}
              className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute left-4 right-4 bottom-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase leading-none" style={{ color: PISTACHIO }}>
                  MATTIA
                </p>
                <p className="text-[11px] text-ivory/60 mt-1.5 tracking-wide truncate">Salvo's chaotische hoofd · spreek vrijuit</p>
              </div>
              <button
                onClick={openMattiaVoice}
                className="flex items-center gap-2 rounded-full pl-3 pr-4 py-2 bg-ivory/10 border border-ivory/15 text-ivory/85 text-[12px] font-medium hover:bg-ivory/15 transition-all shrink-0"
                title="Bel Mattia (ElevenLabs voice agent)"
              >
                <Phone className="h-3.5 w-3.5" /> Bel
              </button>
            </div>
          </div>

          <div className="shrink-0 px-7"><div className="h-px" style={{ background: OLIVE, opacity: 0.7 }} /></div>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-7 py-4 space-y-4">
            {messages.length === 0 && !sending && ready && (
              <div className="flex flex-col items-center text-center py-12 px-4">
                <p className="font-display font-semibold text-2xl text-ivory mb-3 tracking-[-0.01em]">
                  Hier is Mattia.
                </p>
                <p className="text-[13px] text-ivory/55 max-w-[18rem] leading-relaxed">
                  Salvo's chaotische hoofd, ongefilterd. Spreek, daag uit, denk hardop. Geen assistent — een sparring-partner.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-ivory/60 text-xs ml-1">
                <BouncingDots />
                <span>Mattia denkt na…</span>
              </div>
            )}
          </div>

          {messages.length === 0 && ready && (
            <div className="px-7 pb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => doSend(s)}
                  className="px-4 py-2 text-[12px] text-ivory/80 hover:text-ivory transition-colors rounded-full"
                  style={{ background: "rgba(216,218,179,0.10)", border: "1px solid rgba(216,218,179,0.20)" }}
                >
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
              <button
                onClick={() => fileRef.current?.click()}
                className="h-12 w-12 shrink-0 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-ivory/15 transition-colors"
                aria-label="Bijlage toevoegen"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={onPickFile} />
              <button
                onClick={() => setLibOpen(true)}
                className="h-12 w-12 shrink-0 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-ivory/15 transition-colors"
                aria-label="Kies uit bibliotheek"
                title="Kies uit bibliotheek"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
                placeholder="Praat met Mattia…  (Enter = verstuur · Shift+Enter = nieuwe regel)"
                rows={1}
                className="flex-1 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none resize-none max-h-40 rounded-2xl"
                style={{ minHeight: "48px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(216,218,179,0.18)" }}
              />
              <button
                onClick={() => doSend()}
                disabled={(!input.trim() && attachments.length === 0) || sending}
                className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: OLIVE, color: PISTACHIO }}
                aria-label="Verstuur"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <LibraryPicker open={libOpen} onClose={() => setLibOpen(false)} onPick={onPickLibrary} />
    </>
  );
}

function MessageBubble({ message }) {
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
        <div className="max-w-[80%] break-words rounded-[20px] rounded-br-md px-[18px] py-3 text-sm leading-relaxed tracking-[-0.01em] text-ivory" style={{ background: DEEP_OLIVE }}>
          {message.content}
          {atts.map(renderAtt)}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] min-w-0 break-words overflow-hidden px-[18px] py-3 text-sm text-ivory leading-relaxed rounded-2xl [&_pre]:overflow-x-auto [&_pre]:max-w-full"
        style={{ background: "rgba(216,218,179,0.10)", border: "1px solid rgba(216,218,179,0.16)" }}
      >
        <ChatMarkdown>{message.content}</ChatMarkdown>
        {atts.map(renderAtt)}
      </div>
    </div>
  );
}