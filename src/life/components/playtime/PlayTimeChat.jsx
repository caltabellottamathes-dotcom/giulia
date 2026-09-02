import React, { useState, useEffect, useRef } from "react";
import { useMattiaChat } from "@/lib/useMattiaChat";
import { base44 } from "@/api/base44Client";
import { useMediaViewer } from "@/lib/MediaViewerContext";

const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

/** PlayTimeChat — de editorial-block van /playtime, omgebouwd tot een
 *  Mattia-chat. Visueel identiek (graph-paper, mono-labels, display-titels),
 *  maar de body is nu het gesprek: geen bubbles, Mattia links / jij rechts.
 *  Het "How it works"-deel wordt een editorial invoerveld met foto-knop.
 *  Foto's die je stuurt worden inline naar Gemini (vision) gestuurd én in de
 *  mediatheek opgeslagen, zodat Mattia ze kan zien én jullie er samen doorheen
 *  kunnen bladeren via de Media-knop. */
export default function PlayTimeChat({ onToggleMedia, onOpenMedia }) {
  const { messages, send, sending, ready } = useMattiaChat();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const { openMedia } = useMediaViewer();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Mattia stuurt een media-URL → open de MediaStage en toon het meteen
  const lastUrlMsgId = useRef(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role === "user") return;
    if (lastUrlMsgId.current === last.id) return;
    const m = String(last.content || "").match(/https?:\/\/[^\s)]+\.(png|jpe?g|gif|webp|mp4|mov|webm|mkv|mp3|wav|m4a|flac|aac|ogg|pdf)(\?[^\s]*)?/i);
    if (!m) return;
    const url = m[0].replace(/[)\]]+$/, "");
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    const type = ["png","jpg","jpeg","gif","webp"].includes(ext) ? "image" : ["mp4","mov","webm","mkv"].includes(ext) ? "video" : ["mp3","wav","m4a","flac","aac","ogg"].includes(ext) ? "audio" : "doc";
    lastUrlMsgId.current = last.id;
    onOpenMedia?.({ name: "Mattia", url, type });
  }, [messages, onOpenMedia]);

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
        // Foto ook in de mediatheek → zichtbaar in MediaStage ("media page")
        if (type === "image") {
          base44.entities.Upload.create({ file_url, filename: f.name, uploaded_for: "media", document_type: "image", note: "image", status: "new", folder: "PlayTime" }).catch(() => {});
        }
      } catch { /* ignore */ }
    }
    if (uploaded.length) setAttachments((prev) => [...prev, ...uploaded]);
  };

  const doSend = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || sending) return;
    const atts = attachments;
    setInput("");
    setAttachments([]);
    try {
      await send(text, { attachments: atts, file_urls: atts.map((a) => a.url) });
    } catch { /* ignore */ }
  };

  // Render berichttekst met klikbare links. Media-URLs openen in de MediaStage;
  // andere links openen in een nieuw tabblad.
  const renderText = (text, mine) => {
    if (!text) return null;
    const re = /(https?:\/\/[^\s)]+)/g;
    const out = [];
    let last = 0; let m; let k = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
      const url = m[0].replace(/[)\]]+$/, "");
      const ext = url.split(".").pop().split("?")[0].toLowerCase();
      const mediaExt = ["png","jpg","jpeg","gif","webp","mp4","mov","webm","mkv","mp3","wav","m4a","flac","aac","ogg","pdf"];
      if (mediaExt.includes(ext)) {
        const type = ["mp4","mov","webm","mkv"].includes(ext) ? "video" : ["mp3","wav","m4a","flac","aac","ogg"].includes(ext) ? "audio" : ext === "pdf" ? "doc" : "image";
        out.push(<button key={k++} onClick={() => onOpenMedia?.({ name: "Mattia", url, type })} className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: mine ? BLACK : INK }}>{url}</button>);
      } else {
        out.push(<a key={k++} href={url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-70 transition break-all" style={{ color: mine ? BLACK : INK }}>{url}</a>);
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
    return out;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
      {/* Header — N°1 */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">PlayTime</span> | mattia_chat_</p>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
      </div>

      {/* Title — stays */}
      <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
        Talk to<br />yourself<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
      </h2>

      {/* Conversation — editorial, geen bubbles. Mattia links / jij rechts */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-7 ml-[80px] mr-1 pr-2 pt-5 space-y-3.5" style={{ maskImage: "linear-gradient(to bottom, transparent, #000 52px)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 52px)" }}>
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
                        <img src={a.url} alt={a.name} className="h-20 w-28 object-cover rounded-md border" style={{ borderColor: GREY }} />
                      </button>
                    ))}
                  </div>
                )}
                {m.content && (
                  <div>
                    <p className="font-body text-[13px] leading-[1.5] whitespace-pre-line" style={{ color: mine ? BLACK : INK, fontStyle: mine ? "normal" : "italic", textShadow: mine ? "0 1px 3px rgba(0,0,0,0.20)" : "none" }}>
                      {renderText(m.content, mine)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Second part — titles stay */}
      {sending ? (
        <p className="font-body text-[13px] tracking-[-0.01em] mb-5 mt-6 flex items-center gap-2 justify-end" style={{ color: INK }}>
          Mattia typt
          <span aria-hidden className="inline-flex gap-1.5 align-baseline">
            {[0, 1, 2].map((i) => <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: "#94925d", width: "7px", height: "7px", animationDelay: `${i * 0.18}s` }} />)}
          </span>
        </p>
      ) : (
        <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5 mt-6" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
          Bel Mattia.<br />Spreek vrij.<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: "#94925d", width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
        </h3>
      )}

      <div className="h-px w-full" style={{ background: "#d8dab3" }} />
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => fileRef.current?.click()} title="Stuur een foto naar Mattia" className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Foto</button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFile} />
          <button onClick={onToggleMedia} title="Open Media" className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Media</button>
        </div>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
      </div>

      {/* Text insertion field */}
      <div className="mt-4 ml-[80px] mr-1">
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } }}
            placeholder="Schrijf aan Mattia…"
            rows={1}
            className="flex-1 min-w-0 resize-none bg-transparent border-b focus:outline-none px-1 py-1.5 font-body text-[14px] tracking-[-0.01em] max-h-32"
            style={{ borderColor: GREY, color: BLACK }}
          />
          <button onClick={doSend} disabled={(!input.trim() && attachments.length === 0) || sending} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition disabled:opacity-30" style={{ color: BLACK }}>Stuur</button>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
        <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>No agenda. Just play.</p>
      </div>
    </div>
  );
}