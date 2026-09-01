import React, { useRef, useState, useEffect } from "react";
import { useMattiaChat } from "@/lib/useMattiaChat";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import LibraryPicker from "@/system/components/files/LibraryPicker";

/**
 * MattiaChatWindow — MATTIA'S HOTLINE · chat. Horizontale editorial-versie
 * van de PlayTime-chat: schuift rechts-onder omhoog, graph-paper achtergrond,
 * géén bubbles (Mattia links / jij rechts), klikbare links, tekstknoppen
 * zonder icons. Praat met Mattia via useMattiaChat (chatWithMattia, BYOK).
 * Vervangt het oude links-schuivende glaspaneel op alle pagina's.
 */
const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

export default function MattiaChatWindow() {
  const { mattiaChatOpen, closeMattiaChat, openMattiaVoice, pendingMattiaMessage, setPendingMattiaMessage } = usePanel();
  const { messages, send, sending, ready } = useMattiaChat();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const [libOpen, setLibOpen] = useState(false);
  const { openMedia } = useMediaViewer();

  useEffect(() => {
    if (mattiaChatOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mattiaChatOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && mattiaChatOpen) closeMattiaChat(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mattiaChatOpen, closeMattiaChat]);

  useEffect(() => {
    if (!mattiaChatOpen) return;
    const t = [40, 220, 460].map((d) => setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" }), d));
    return () => t.forEach(clearTimeout);
  }, [mattiaChatOpen]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" }); }, [messages, sending]);

  const doSend = async (text) => {
    const content = (text ?? input).trim();
    if ((!content && attachments.length === 0) || sending) return;
    const atts = attachments;
    setInput("");
    setAttachments([]);
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

  const onPickLibrary = ({ url, name, kind }) => setAttachments((prev) => [...prev, { url, name, type: kind === "music" ? "audio" : kind }]);

  // Mattia stuurt een media-URL → open de viewer meteen
  const lastUrlMsgId = useRef(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role === "user" || lastUrlMsgId.current === last.id) return;
    const m = String(last.content || "").match(/https?:\/\/[^\s)]+\.(png|jpe?g|gif|webp|mp4|mov|webm|mkv|mp3|wav|m4a|flac|aac|ogg|pdf)(\?[^\s]*)?/i);
    if (!m) return;
    const url = m[0].replace(/[)\]]+$/, "");
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    const type = ["mp4","mov","webm","mkv"].includes(ext) ? "video" : ["mp3","wav","m4a","flac","aac","ogg"].includes(ext) ? "audio" : ext === "pdf" ? "doc" : "image";
    lastUrlMsgId.current = last.id;
    openMedia({ name: "Mattia", url, type });
  }, [messages, openMedia]);

  // Klikbare links in berichttekst — media-URLs openen in de viewer
  const renderText = (text, mine) => {
    if (!text) return null;
    const re = /(https?:\/\/[^\s)]+)/g;
    const out = []; let last = 0; let m; let k = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
      const url = m[0].replace(/[)\]]+$/, "");
      const ext = url.split(".").pop().split("?")[0].toLowerCase();
      const mediaExt = ["png","jpg","jpeg","gif","webp","mp4","mov","webm","mkv","mp3","wav","m4a","flac","aac","ogg","pdf"];
      if (mediaExt.includes(ext)) {
        const type = ["mp4","mov","webm","mkv"].includes(ext) ? "video" : ["mp3","wav","m4a","flac","aac","ogg"].includes(ext) ? "audio" : ext === "pdf" ? "doc" : "image";
        out.push(<button key={k++} onClick={() => openMedia({ name: "Mattia", url, type })} className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: mine ? BLACK : INK }}>{url}</button>);
      } else {
        out.push(<a key={k++} href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: mine ? BLACK : INK }}>{url}</a>);
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
    return out;
  };

  if (!mattiaChatOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/15 animate-fade-in" onClick={closeMattiaChat} />

      <div className="fixed right-4 lg:right-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[680px] animate-slide-up">
        <div className="relative flex flex-col rounded-[24px] overflow-hidden graph-paper border" style={{ borderColor: GREY, height: "min(560px, 78vh)", maxHeight: "78vh", boxShadow: "0 -24px 64px -20px rgba(0,0,0,0.45)" }}>
          {/* Sluiten — linksboven, tekstknop */}
          <button onClick={closeMattiaChat} className="absolute top-3 left-4 z-40 font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Sluiten</button>

          <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">PlayTime</span> | mattia_chat_</p>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
            </div>

            {/* Title */}
            <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-4" style={{ color: BLACK, fontSize: "clamp(28px, 2.4vw, 44px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
              Talk to<br />yourself<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
            </h2>

            {/* Conversation — geen bubbles, Mattia links / jij rechts */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-5 ml-[40px] pr-1 pt-3 space-y-3" style={{ maskImage: "linear-gradient(to bottom, transparent, #000 40px)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 40px)" }}>
              {!ready ? (
                <p className="font-body text-[12px] italic" style={{ color: INK }}>Laden…</p>
              ) : messages.length === 0 ? (
                <p className="font-body text-[12px] leading-[1.55]" style={{ color: INK }}>Zeg iets tegen Mattia. Hij luistert — en praat terug.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.role === "user";
                  const imgs = (m.attachments || []).filter((a) => a.type === "image");
                  return (
                    <div key={m.id} className={mine ? "text-right" : "text-left"}>
                      {imgs.length > 0 && (
                        <div className={`flex gap-2 mb-1.5 ${mine ? "justify-end" : "justify-start"}`}>
                          {imgs.map((a, i) => (
                            <button key={i} onClick={() => openMedia({ name: a.name, url: a.url, type: "image" })} className="block">
                              <img src={a.url} alt={a.name} className="h-16 w-24 object-cover rounded-md border" style={{ borderColor: GREY }} />
                            </button>
                          ))}
                        </div>
                      )}
                      {m.content && (
                        <p className="font-body text-[12.5px] leading-[1.5] whitespace-pre-line" style={{ color: mine ? BLACK : INK, fontStyle: mine ? "normal" : "italic", textShadow: mine ? "0 1px 3px rgba(0,0,0,0.20)" : "none" }}>
                          {renderText(m.content, mine)}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Typing / title line — subtiele "Mattia typt" bij laden */}
            {sending ? (
              <p className="font-body text-[13px] tracking-[-0.01em] mb-3 mt-4 flex items-center gap-2" style={{ color: INK }}>
                Mattia typt
                <span aria-hidden className="inline-flex gap-1.5 align-baseline">
                  {[0, 1, 2].map((i) => <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: "#94925d", width: "7px", height: "7px", animationDelay: `${i * 0.18}s` }} />)}
                </span>
              </p>
            ) : (
              <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-3 mt-4" style={{ color: BLACK, fontSize: "clamp(20px, 1.6vw, 30px)" }}>
                Bel Mattia.<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: "#94925d", width: "clamp(7px, 0.6vw, 12px)", height: "clamp(7px, 0.6vw, 12px)" }} />
              </h3>
            )}

            <div className="h-px w-full" style={{ background: "#d8dab3" }} />
            <div className="flex items-center justify-between mt-3">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">How it works</span> | now_</p>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
            </div>

            {/* Input — minimalistische tekstknoppen, geen icons */}
            <div className="mt-3">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-md border px-2 py-1" style={{ borderColor: GREY }}>
                      <span className="text-[10px] truncate max-w-[120px]" style={{ color: INK }}>{a.name}</span>
                      <button onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="text-[10px] leading-none" style={{ color: INK }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-3">
                <button onClick={() => fileRef.current?.click()} title="Stuur een foto naar Mattia" className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition" style={{ color: INK }}>Foto</button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFile} />
                <button onClick={() => setLibOpen(true)} title="Kies uit bibliotheek" className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition" style={{ color: INK }}>Media</button>
                <button onClick={openMattiaVoice} title="Bel Mattia" className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition" style={{ color: BLACK }}>Bel</button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
                  placeholder="Schrijf aan Mattia…"
                  rows={1}
                  className="flex-1 min-w-0 resize-none bg-transparent border-b focus:outline-none px-1 py-1.5 font-body text-[14px] tracking-[-0.01em] max-h-32"
                  style={{ borderColor: GREY, color: BLACK }}
                />
                <button onClick={() => doSend()} disabled={(!input.trim() && attachments.length === 0) || sending} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition disabled:opacity-30" style={{ color: BLACK }}>Stuur</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LibraryPicker open={libOpen} onClose={() => setLibOpen(false)} onPick={onPickLibrary} />
    </>
  );
}