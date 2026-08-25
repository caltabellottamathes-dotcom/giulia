import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, Minimize2, EyeOff, FileText } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import MusicStage from "@/system/components/media/MusicStage";
import MiniPlayer from "@/system/components/media/MiniPlayer";
import RestorePill from "@/system/components/media/RestorePill";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * MediaFullscreenWindow — écht fullscreen viewer die zich automatisch aan
 * het formaat van de media aanpast (object-contain). Afspelende media
 * (audio/video) kan worden geminimaliseerd tot een zwevende mini-kaart of
 * volledig verborgen terwijl het geluid doorloopt; een pil herstelt het.
 * Muziek krijgt een OS-stijl interface (MusicStage). Sluitknop linksboven.
 */
const videoWrap = (v) =>
  v === "full"
    ? "fixed inset-0 z-[58] flex items-center justify-center pt-14 pb-4 px-4"
    : v === "mini"
    ? "fixed bottom-20 right-6 z-[60] w-72 rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
    : "fixed bottom-6 right-6 z-[60] h-px w-px overflow-hidden opacity-0 pointer-events-none";

const videoCls = (v) =>
  v === "full" ? "max-w-full max-h-full object-contain bg-black" : v === "mini" ? "w-full aspect-video bg-black" : "w-full";

export default function MediaFullscreenWindow() {
  const { mediaFullscreen, closeMediaFullscreen } = usePanel();
  const { media, closeMedia } = useMediaViewer();
  const [view, setView] = useState("full");
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const mediaRef = useRef(null);

  const kind = media?.kind;
  const isPlayable = kind === "music" || kind === "video";

  // Nieuwe media → reset + fullscreen
  useEffect(() => {
    if (mediaFullscreen) {
      setView("full");
      setCur(0);
      setDur(0);
      setPlaying(false);
    }
  }, [mediaFullscreen, media?.url]);

  // Esc sluit (enkel in fullscreen)
  useEffect(() => {
    if (!mediaFullscreen) return;
    const h = (e) => { if (e.key === "Escape" && view === "full") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFullscreen, view]);

  // Body-scroll vergrendelen in fullscreen
  useEffect(() => {
    if (mediaFullscreen && view === "full") {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mediaFullscreen, view]);

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
    if (el) { el.pause(); }
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

  return createPortal(
    <>
      {/* backdrop */}
      {view === "full" && (
        <div className="fixed inset-0 z-[57] bg-charcoal/85 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      )}

      {/* persistente media-laag (audio always hidden; video zichtbaar per view) */}
      {kind === "music" && <audio {...mediaProps} className="hidden" />}
      {kind === "video" && (
        <div className={videoWrap(view)}>
          <video {...mediaProps} controls={view === "full"} className={videoCls(view)} />
        </div>
      )}

      {/* FULLSCREEN */}
      {view === "full" && (
        <div className="fixed inset-0 z-[59] pointer-events-none">
          {/* titelbalk */}
          <header className="absolute top-0 left-0 right-0 h-12 flex items-center gap-2 pl-3 pr-2 pointer-events-auto bg-gradient-to-b from-black/45 to-transparent">
            <button onClick={handleClose} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors" aria-label="Sluiten">
              <X className="h-4 w-4" />
            </button>
            <p className="text-[13px] text-ivory/90 truncate flex-1">{media.name || "Media"}</p>
            {isPlayable && (
              <button onClick={() => setView("mini")} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/75 hover:text-ivory transition-colors shrink-0" aria-label="Minimaliseren" title="Minimaliseren">
                <Minimize2 className="h-4 w-4" />
              </button>
            )}
            {isPlayable && (
              <button onClick={() => setView("hidden")} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/75 hover:text-ivory transition-colors shrink-0" aria-label="Verbergen" title="Verbergen">
                <EyeOff className="h-4 w-4" />
              </button>
            )}
            <a href={media.url} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/75 hover:text-ivory transition-colors shrink-0" aria-label="Openen" title="Openen in nieuw tabblad">
              <Download className="h-4 w-4" />
            </a>
          </header>

          {/* content */}
          {kind === "music" && (
            <MusicStage media={media} playing={playing} cur={cur} dur={dur} onToggle={togglePlay} onSeek={seek} onSkip={skip} />
          )}
          {kind === "image" && (
            <div className="absolute inset-0 flex items-center justify-center pt-12 px-4 pb-4">
              {drive
                ? <iframe src={media.url} title={media.name} className="w-full h-full" />
                : <img src={media.url} alt={media.name} className="max-w-full max-h-full object-contain" />}
            </div>
          )}
          {kind === "doc" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pt-12 text-center px-6 pointer-events-auto">
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
      )}

      {/* MINIMALISEREN */}
      {view === "mini" && isPlayable && (
        <MiniPlayer
          media={media}
          kind={kind}
          playing={playing}
          cur={cur}
          dur={dur}
          onToggle={togglePlay}
          onSeek={seek}
          onExpand={() => setView("full")}
          onHide={() => setView("hidden")}
          onClose={handleClose}
        />
      )}

      {/* VERBERGEN */}
      {view === "hidden" && isPlayable && (
        <RestorePill media={media} kind={kind} playing={playing} onToggle={togglePlay} onRestore={() => setView("mini")} />
      )}
    </>,
    document.body
  );
}