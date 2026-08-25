import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, Minus, Maximize2, FileText, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import MusicStage from "@/system/components/media/MusicStage";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/**
 * MediaFullscreenWindow — een zwevend window (zoals de browser) waarin de
 * media altijd fullscreen (gevuld) afspeelt. Te minimaliseren naar een kleine
 * widget; het media-element blijft gemount, dus audio/video loopt door.
 * Muziek krijgt de OS-stijl MusicStage in de content-area.
 */
export default function MediaFullscreenWindow() {
  const { mediaFullscreen, closeMediaFullscreen, mediaMinimized, minimizeMedia, restoreMedia } = usePanel();
  const { media, closeMedia } = useMediaViewer();
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const mediaRef = useRef(null);

  const kind = media?.kind;
  const isPlayable = kind === "music" || kind === "video";

  // Nieuwe media → reset transport
  useEffect(() => {
    if (mediaFullscreen) { setCur(0); setDur(0); setPlaying(false); }
  }, [mediaFullscreen, media?.url]);

  // Esc sluit (enkel in window-stand)
  useEffect(() => {
    if (!mediaFullscreen) return;
    const h = (e) => { if (e.key === "Escape" && !mediaMinimized) handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFullscreen, mediaMinimized]);

  // Body-scroll vergrendelen in window-stand
  useEffect(() => {
    if (mediaFullscreen && !mediaMinimized) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mediaFullscreen, mediaMinimized]);

  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onTime = (e) => setCur(e.currentTarget.currentTime || 0);
  const onMeta = (e) => setDur(e.currentTarget.duration || 0);
  const onEnded = () => setPlaying(false);

  const togglePlay = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) el.play(); else el.pause();
  }, []);

  const seek = useCallback((t) => {
    const el = mediaRef.current;
    if (!el) return;
    el.currentTime = t;
    setCur(t);
  }, []);

  const skip = useCallback((d) => {
    const el = mediaRef.current;
    if (!el) return;
    const t = clamp((el.currentTime || 0) + d, 0, dur || el.duration || 0);
    el.currentTime = t;
    setCur(t);
  }, [dur]);

  const handleClose = useCallback(() => {
    const el = mediaRef.current;
    if (el) el.pause();
    closeMediaFullscreen();
    closeMedia();
  }, [closeMediaFullscreen, closeMedia]);

  if (!mediaFullscreen || !media) return null;

  const drive = isDriveUrl(media.url);

  const mediaProps = {
    ref: mediaRef,
    src: media.url,
    autoPlay: true,
    onPlay,
    onPause,
    onTimeUpdate: onTime,
    onLoadedMetadata: onMeta,
    onEnded,
  };

  // ---- Geminimaliseerde widget-stand ----
  if (mediaMinimized) {
    return createPortal(
      <div className="fixed bottom-4 right-4 z-[56] w-[320px] h-[200px] rounded-2xl overflow-hidden glass-4 float-shadow flex flex-col animate-scale-in text-ivory">
        <div className="shrink-0 h-8 px-2 flex items-center gap-1.5 border-b border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
          <span className="text-[10px] font-semibold tracking-wider truncate flex-1 text-ivory/80">{media.name}</span>
          <button onClick={restoreMedia} className="h-6 w-6 rounded-md glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Vergroten"><Maximize2 className="h-3 w-3" /></button>
          <button onClick={handleClose} className="h-6 w-6 rounded-md glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten"><X className="h-3 w-3" /></button>
        </div>
        <div className="relative flex-1 min-h-0 bg-black">
          {kind === "music" && (
            <>
              <audio {...mediaProps} className="hidden" />
              <div className="absolute inset-0 flex items-center gap-3 px-3">
                <button onClick={togglePlay} className="h-10 w-10 rounded-full bg-ivory text-charcoal flex items-center justify-center shrink-0">
                  {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-ivory/90 truncate">{media.name}</p>
                  <input type="range" min={0} max={dur || 0} value={cur} onChange={(e) => seek(Number(e.target.value))} className="w-full accent-olive h-1 mt-1.5 cursor-pointer" />
                </div>
                <span className="text-[10px] font-mono text-ivory/45 tabular-nums shrink-0">{fmt(cur)}</span>
              </div>
            </>
          )}
          {kind === "video" && <video {...mediaProps} className="w-full h-full object-contain bg-black" />}
          {kind === "image" && (drive ? <iframe src={media.url} title={media.name} className="w-full h-full" /> : <img src={media.url} alt={media.name} className="w-full h-full object-contain" />)}
          {kind === "doc" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-3">
              <FileText className="h-7 w-7 text-ivory/50" />
              <p className="text-[11px] text-ivory/70 truncate max-w-full">{media.name}</p>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // ---- Window-stand ----
  return createPortal(
    <div className="fixed inset-3 sm:inset-4 lg:inset-6 z-[56] animate-scale-in">
      <div className="relative w-full h-full rounded-[24px] overflow-hidden flex flex-col glass-4 float-shadow text-ivory">
        {/* Sluitknop linksboven */}
        <button onClick={handleClose} className="absolute top-3 left-3 z-20 h-9 w-9 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten">
          <X className="h-4 w-4" />
        </button>

        {/* Titelbalk */}
        <div className="shrink-0 px-3 pt-3 pb-2 pl-16 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
          <p className="text-[14px] text-ivory/90 truncate flex-1">{media.name || "Media"}</p>
          <a href={media.url} target="_blank" rel="noreferrer" className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Openen in nieuw tabblad" title="Openen in nieuw tabblad">
            <Download className="h-4 w-4" />
          </a>
          <button onClick={minimizeMedia} className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Minimaliseren" title="Minimaliseren naar widget">
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2"><div className="h-px bg-olive/40" /></div>

        {/* Content-area — media vult altijd het window (fullscreen binnen window) */}
        <div className="relative flex-1 min-h-0 mx-3 mb-3 rounded-2xl overflow-hidden bg-black">
          {kind === "music" && (
            <>
              <audio {...mediaProps} className="hidden" />
              <MusicStage media={media} playing={playing} cur={cur} dur={dur} onToggle={togglePlay} onSeek={seek} onSkip={skip} />
            </>
          )}
          {kind === "video" && <video {...mediaProps} controls className="w-full h-full object-contain bg-black" />}
          {kind === "image" && (drive ? <iframe src={media.url} title={media.name} className="w-full h-full" /> : <img src={media.url} alt={media.name} className="w-full h-full object-contain" />)}
          {kind === "doc" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 pointer-events-auto">
              <div className="h-16 w-16 rounded-2xl bg-ivory/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-ivory/55" />
              </div>
              <p className="text-sm text-ivory/85 max-w-xs">{media.name}</p>
              <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline">
                <Download className="h-3.5 w-3.5" /> Openen in nieuw tabblad
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}