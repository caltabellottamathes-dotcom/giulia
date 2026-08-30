import React, { useEffect, useRef, useState, useMemo } from "react";
import { useConversation } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Film, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import SineLayers from "@/giulia/widgets/new/SineLayers";
import { useAudio } from "@/lib/useAudio";

const MATTIA_AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";
const DEEP = "#94925d";   // olive
const LIGHT = "#d8dab3";  // whipped pistachio

/** stripAudioTags — verwijdert bracketed audio-effect-tags uit de transcript. */
const stripAudioTags = (s) => String(s || "").replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();

/** PlayTimeVoicePanel — de zwevende Mattia voice-interface op de /playtime
 *  pagina. Bloom om te bellen, live transcript, upload om iets naar Mattia
 *  te verzenden (wordt opgeslagen in de mediatheek + getoond in de MediaStage),
 *  en een Media-knop om de MediaStage te tonen/verbergen. */
export default function PlayTimeVoicePanel({ onToggleMedia }) {
  const { openModule } = usePanel();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);
  const [transcript, setTranscript] = useState([]);
  const processedRef = useRef(new Set());
  const [uploading, setUploading] = useState(false);

  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);
  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({
    agentId: MATTIA_AGENT_ID,
    clientTools,
    onMessage: (payload) => {
      const text = String(payload?.message || "").trim();
      const role = payload?.role || (payload?.source === "ai" ? "assistant" : payload?.source || "user");
      if (!text || processedRef.current.has(text)) return;
      processedRef.current.add(text);
      setTranscript((t) => [...t, { id: `${Date.now()}-${Math.random()}`, role, text }]);
    },
  });

  const connected = status === "connected";
  const connecting = status === "connecting";
  const bandsRef = useAudio({ getOutputVolume, connected });

  // Bloom — ademt + reageert op Mattia's audio-output.
  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const raw = connected && typeof getOutputVolume === "function" ? (getOutputVolume() || 0) : 0;
      levelRef.current = levelRef.current * 0.82 + raw * 0.18;
      const level = Math.min(1, levelRef.current);
      const breath = 0.08 * Math.sin(t * 1.1);
      const scale = 0.9 + level * 0.5 + breath;
      const opacity = 0.6 + level * 0.32 + 0.04 * Math.sin(t * 1.1);
      const el = bloomRef.current;
      if (el) { el.style.transform = `scale(${scale})`; el.style.opacity = String(opacity); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connected, getOutputVolume]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);
  useEffect(() => () => { try { endSession(); } catch { /* ignore */ } }, [endSession]);

  const toggle = async () => {
    if (connected) { try { await endSession(); } catch { /* ignore */ } }
    else { setTranscript([]); processedRef.current.clear(); try { await startSession(); } catch { /* ignore */ } }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      const file_url = res?.file_url || res?.data?.file_url;
      if (!file_url) throw new Error("no url");
      await base44.entities.Upload.create({ file_url, filename: file.name, status: "new", uploaded_for: "playtime" });
      const kind = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "music" : "doc";
      window.dispatchEvent(new CustomEvent("giulia:open-media", { detail: { name: file.name, url: file_url, type: kind, kind } }));
      toast({ title: "Gedeeld met Mattia", description: file.name });
    } catch {
      toast({ title: "Upload mislukt", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const statusLabel = connecting ? "Verbinden…" : connected ? (isSpeaking ? "Spreekt" : "Luistert") : "Tik om te bellen";

  return (
    <div
      className="absolute right-[2.5%] top-[8%] bottom-[8%] w-[34%] z-40 flex flex-col rounded-[28px] overflow-hidden animate-slide-right"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px) saturate(1.35)",
        WebkitBackdropFilter: "blur(14px) saturate(1.35)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 24px 60px -22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
        color: "hsl(var(--ivory))",
      }}
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", connected ? "bg-[#94925d] animate-pulse-soft" : "bg-ivory/30")} />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold tracking-[0.22em] text-[12px] uppercase text-ivory leading-none">MATTIA · PLAYTIME</p>
          <p className="text-[11px] text-ivory/60 mt-1.5 tracking-wide truncate">{statusLabel}</p>
        </div>
        <button onClick={onToggleMedia} title="Media tonen" className="h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-ivory/15 transition">
          <Film className="h-4 w-4" />
        </button>
      </div>

      {/* bloom */}
      <div className="relative flex items-center justify-center py-4 shrink-0">
        <SineLayers bandsRef={bandsRef} className="absolute bottom-1 left-0 right-0 w-full opacity-70 pointer-events-none" />
        <button
          ref={bloomRef}
          onClick={toggle}
          aria-label={connected ? "Gesprek stoppen" : "Mattia bellen"}
          className="h-[230px] w-[230px] rounded-full will-change-transform cursor-pointer"
          style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 46%, transparent 74%)`, filter: "blur(3px)", opacity: 0.95, border: "none" }}
        />
      </div>

      {/* transcript */}
      <div className="flex-1 min-h-0 px-4 pb-3 overflow-y-auto no-scrollbar space-y-2.5">
        {transcript.length === 0 ? (
          <p className="text-[12px] text-ivory/55 text-center py-6">
            {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Mattia's antwoorden live te zien"}
          </p>
        ) : (
          transcript.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", isUser ? "bg-charcoal text-ivory rounded-br-md" : "chat-bubble rounded-bl-md")}>
                  {stripAudioTags(m.text)}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* upload bar — verzend naar Mattia */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-ivory/10">
        <input ref={fileRef} type="file" onChange={onUpload} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-10 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center gap-2 text-ivory/80 hover:bg-ivory/15 hover:text-ivory transition disabled:opacity-40"
        >
          <Upload className="h-4 w-4" />
          <span className="text-[12px] font-medium tracking-wide">{uploading ? "Uploaden…" : "Verzend naar Mattia"}</span>
        </button>
      </div>
    </div>
  );
}