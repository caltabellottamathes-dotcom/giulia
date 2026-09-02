import React, { useRef, useState, useEffect } from "react";
import { useMattiaChat } from "@/lib/useMattiaChat";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { base44 } from "@/api/base44Client";
import ReadAloudButton from "@/components/mattia/ReadAloudButton";

const BLUE = "#b1bfc7";
const BLACK = "#000000";
const GREY = "#CCCCCC";
const INK = "#595c64";

/**
 * MattiaTab — full-surface reflectieve chat met Mattia, als eigen tabblad
 * in de PlayTime MediaStage (naast Camera en Bibliotheek).
 *
 * Editorial, géén bubbles (Mattia links / jij rechts), spreektaal,
 * WhatsApp-kort. De "Levels & Spiegel"-laag (openen over tijd, DBT-meets-
 * vrijheid) zit permanent in Mattia's persona in chatWithMattia, niet hier —
 * dit is puur het praatvlak.
 */
export default function MattiaTab() {
  const { messages, send, sending, ready } = useMattiaChat();
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const { openMedia } = useMediaViewer();

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" }); }, [messages, sending]);

  const doSend = async (text) => {
    const content = (text ?? input).trim();
    if ((!content && attachments.length === 0) || sending) return;
    const atts = attachments;
    setInput("");
    setAttachments([]);
    try { await send(content, { attachments: atts, file_urls: atts.map((a) => a.url) }); } catch { /* hook toont fout via gesprek */ }
  };

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

  return (
    <div className="h-full w-full flex flex-col graph-paper">
      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-2">
        <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>PlayTime | mattia_spiegel_</p>
        <h2 className="font-display font-bold uppercase tracking-[-0.035em] leading-[0.92] mt-2" style={{ color: BLACK, fontSize: "clamp(22px, 1.8vw, 34px)" }}>
          Spiegel<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(7px, 0.6vw, 12px)", height: "clamp(7px, 0.6vw, 12px)" }} />
        </h2>
      </div>

      {/* Conversation — geen bubbles, Mattia links / jij rechts */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-3 space-y-3">
        {!ready ? (
          <p className="font-body text-[12px] italic" style={{ color: INK }}>Laden…</p>
        ) : messages.length === 0 ? (
          <p className="font-body text-[13px] leading-[1.55]" style={{ color: INK }}>Zeg iets tegen Mattia. Het is zoals tegen jezelf praten — hij luistert, en ergens hoor je jezelf terug.</p>
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
                  <div>
                    <p className="font-body text-[13px] leading-[1.5] whitespace-pre-line" style={{ color: mine ? BLACK : INK, fontStyle: mine ? "normal" : "italic" }}>
                      {renderText(m.content, mine)}
                    </p>
                    {!mine && <ReadAloudButton text={m.content} color={INK} />}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Typing */}
      {sending && (
        <p className="font-body text-[13px] tracking-[-0.01em] px-5 pb-1 flex items-center gap-2 justify-end" style={{ color: INK }}>
          Mattia typt
          <span aria-hidden className="inline-flex gap-1.5 align-baseline">
            {[0,1,2].map((i) => <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: "#94925d", width: "7px", height: "7px", animationDelay: `${i*0.18}s` }} />)}
          </span>
        </p>
      )}

      {/* Input */}
      <div className="shrink-0 px-5 pb-4 pt-1">
        <div className="h-px w-full mb-2" style={{ background: "#d8dab3" }} />
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => fileRef.current?.click()} className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition" style={{ color: INK }}>Foto</button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickFile} />
        </div>
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
          <button onClick={() => doSend()} disabled={(!input.trim() && attachments.length === 0) || sending} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] pb-1.5 hover:underline transition disabled:opacity-30" style={{ color: BLACK }}>Stuur</button>
        </div>
      </div>
    </div>
  );
}