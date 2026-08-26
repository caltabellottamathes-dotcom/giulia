import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Download, Minus, Maximize2, FileText } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import { cn } from "@/lib/utils";
import MusicViewerStage from "@/system/components/media/MusicViewerStage";

const DEFAULT_RATIO = { image: 4 / 3, video: 16 / 9, music: 3 / 4, doc: 4 / 3 };

/**
 * MediaFullscreenWindow — VoiceWindow-stijl shell (rechts, volledige hoogte,
 * schuift in) waarin de media helemaal flush (geen rand) vult. De shell-breedte
 * past zich aan de aspect-ratio van de media aan. Muziek toont de vergrote
 * LIFE MusicWidget (MusicViewerStage). Bij minimaliseren verkleint de hele
 * shell exact mee in de verhouding van de media — dus een 9:16 video blijft
 * 9:16, en muziek blijft 3:4 met dezelfde MusicWidget-look.
 *
 * Het <audio>-element voor muziek leeft op top-level (altijd gemount) zodat
 * playback doorloopt bij minimaliseren/vergroten. De WebAudio-grafo
 * (AnalyserNode) wordt eenmalig op dat element opgezet en gedeeld met
 * MusicViewerStage.
 */
export default function MediaFullscreenWindow() {
  const { mediaFullscreen, closeMediaFullscreen, mediaMinimized, minimizeMedia, restoreMedia } = usePanel();
  const { media, closeMedia } = useMediaViewer();
  const [playing, setPlaying] = useState(false);
  const [ratio, setRatio] = useState(3 / 4);
  const [boxH, setBoxH] = useState(0);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(null); // null = standaard rechtsonder; {x,y} na slepen
  const mediaRef = useRef(null);
  const shellRef = useRef(null);
  const minWrapRef = useRef(null);
  const dragRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);

  const kind = media?.kind;

  // ── Muziekbibliotheek (cloud + lokaal) ──
  const cloud = useMediaLibrary();
  const local = useLocalMedia();
  const cloudMusic = useMemo(
    () => (cloud.items || []).filter((i) => kindOfUpload(i) === "music")
      .map((i) => ({ id: "c:" + i.id, name: i.filename || "track", source: "cloud", url: i.file_url, raw: i })),
    [cloud.items]
  );
  const localMusic = useMemo(
    () => (local.files || []).filter((f) => f.kind === "music")
      .map((f) => ({ id: "l:" + f.id, name: f.name.split("/").pop(), source: "local", raw: f })),
    [local.files]
  );
  const tracks = useMemo(() => [...cloudMusic, ...localMusic], [cloudMusic, localMusic]);
  const idx = tracks.findIndex((t) => t.id === currentTrackId);
  const currentTrack = idx >= 0 ? tracks[idx] : tracks[0] || null;

  const resolveUrl = useCallback(async (t) => {
    if (t.source === "cloud") return t.url;
    const m = await local.openFile(t.raw);
    return m.url;
  }, [local]);

  // WebAudio-grafo (AnalyserNode) — eenmaal per <audio>-DOM-node opgezet via
  // een callback-ref. Bij opnieuw openen van de viewer krijgt het element een
  // nieuwe node, dus ook een verse context + source + analyser. Zo blijven
  // bloom & sine echt audio-reactief.
  const attachAudio = useCallback((el) => {
    if (mediaRef.current && mediaRef.current !== el) {
      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;
      analyserRef.current = null;
    }
    mediaRef.current = el;
    if (!el || kind !== "music") return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.74;
      const src = ctx.createMediaElementSource(el);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      ctx.resume().catch(() => {});
    } catch { /* source al verbonden of niet ondersteund */ }
  }, [kind]);

  // Nieuwe media → reset + ratio
  useEffect(() => {
    if (mediaFullscreen) {
      setPlaying(false);
      setRatio(DEFAULT_RATIO[kind] ?? 3 / 4);
      setCurrentTrackId(null);
    }
  }, [mediaFullscreen, media?.url, kind]);

  // Voor muziek: initieel track uit de geopende url afleiden (de grafo wordt
  // opgezet in de callback-ref op het <audio>-element).
  useEffect(() => {
    if (kind !== "music") return;
    if (currentTrackId) return;
    const match = cloudMusic.find((t) => t.url === media.url);
    if (match) setCurrentTrackId(match.id);
    else if (tracks.length) setCurrentTrackId(tracks[0].id);
  }, [kind, cloudMusic, tracks, media?.url, currentTrackId]);

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

  // Shell-hoogte meten (voor breedte-berekening) + viewport-breedte
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxH(el.clientHeight));
    ro.observe(el);
    setBoxH(el.clientHeight);
    return () => ro.disconnect();
  }, [mediaFullscreen, mediaMinimized]);

  useEffect(() => {
    const onR = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const onPlay = () => { setPlaying(true); ctxRef.current?.resume?.().catch(() => {}); };
  const onPause = () => setPlaying(false);
  const onEnded = () => setPlaying(false);

  const playTrack = useCallback(async (t) => {
    if (!t) return;
    setBusy(true);
    try {
      const url = await resolveUrl(t);
      const a = mediaRef.current;
      if (!a) return;
      a.src = url;
      ctxRef.current?.resume?.();
      await a.play();
      setCurrentTrackId(t.id);
    } catch { /* negeer */ } finally { setBusy(false); }
  }, [resolveUrl]);

  const togglePlay = useCallback(() => {
    const a = mediaRef.current;
    if (!a || !currentTrack) return;
    if (currentTrackId !== currentTrack.id) { playTrack(currentTrack); return; }
    if (a.paused) { ctxRef.current?.resume?.(); a.play().catch(() => {}); } else a.pause();
  }, [currentTrack, currentTrackId, playTrack]);

  const prevTrack = useCallback(() => {
    if (!tracks.length) return;
    const i = idx < 0 ? 0 : (idx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[i]);
  }, [tracks, idx, playTrack]);

  const nextTrack = useCallback(() => {
    if (!tracks.length) return;
    const i = idx < 0 ? 0 : (idx + 1) % tracks.length;
    playTrack(tracks[i]);
  }, [tracks, idx, playTrack]);

  const handleClose = useCallback(() => {
    const el = mediaRef.current;
    if (el) el.pause();
    closeMediaFullscreen();
    closeMedia();
  }, [closeMediaFullscreen, closeMedia]);

  if (!mediaFullscreen || !media) return null;

  const drive = isDriveUrl(media.url);

  // ── Afmetingen ──
  // Window-stand: breedte = ratio × hoogte (geklemd).
  const maxWindowW = Math.min(vw - 32, 1400);
  const windowW = Math.max(320, Math.min(ratio && boxH ? ratio * boxH : 720, maxWindowW));
  // Geminimaliseerd: verkleind in de media-eigen verhouding (geen horizontale dwang).
  const MAX_MIN_W = 360, MAX_MIN_H = 240;
  let minW, minH;
  if (ratio >= 1) { minW = Math.min(MAX_MIN_W, MAX_MIN_H * ratio); minH = minW / ratio; }
  else { minH = Math.min(MAX_MIN_H, MAX_MIN_W / ratio); minW = minH * ratio; }

  // ── Vrij verplaatsbare geminimaliseerde widget (slepen via de bovenrand) ──
  const onHandleDown = (e) => {
    const el = minWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onHandleMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = d.ox + (e.clientX - d.sx);
    const ny = d.oy + (e.clientY - d.sy);
    setPos({ x: Math.max(8, Math.min(nx, vw - minW - 8)), y: Math.max(8, Math.min(ny, vh - minH - 8)) });
  };
  const onHandleUp = () => { dragRef.current = null; };

  // ── Shell-inhoud (window én minimized delen dit) ──
  const renderShell = (compact) => {
    const btn = compact ? "h-8 w-8" : "h-9 w-9";
    const ico = compact ? "h-3.5 w-3.5" : "h-4 w-4";
    const radius = compact ? "rounded-[20px]" : "rounded-[28px]";
    const glassBtn = "bg-black/25 border border-white/15 backdrop-blur-md flex items-center justify-center text-ivory/90 hover:text-white hover:bg-black/40 transition-colors";
    return (
      <div className={cn("relative w-full h-full overflow-hidden glass-3", radius)}>
        {/* Sluitknop linksboven */}
        <button onClick={handleClose} className={cn("absolute top-4 left-4 z-50 rounded-full", btn, glassBtn)} aria-label="Sluiten"><X className={ico} /></button>

        {/* Acties rechtsboven */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5">
          <a href={media.url} target="_blank" rel="noreferrer" className={cn("rounded-full", btn, glassBtn)} aria-label="Openen in nieuw tabblad" title="Openen in nieuw tabblad"><Download className={ico} /></a>
          {compact ? (
            <button onClick={restoreMedia} className={cn("rounded-full", btn, glassBtn)} aria-label="Vergroten" title="Vergroten"><Maximize2 className={ico} /></button>
          ) : (
            <button onClick={minimizeMedia} className={cn("rounded-full", btn, glassBtn)} aria-label="Minimaliseren" title="Minimaliseren naar widget"><Minus className={ico} /></button>
          )}
        </div>

        {/* Sleepgreep langs de bovenrand (enkel geminimaliseerd) */}
        {compact && (
          <div
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
            className="absolute top-0 inset-x-0 h-10 z-[35] cursor-grab active:cursor-grabbing touch-none"
            aria-label="Verplaatsen"
          />
        )}

        {/* Media — flush in de shell */}
        {kind === "music" && (
          <MusicViewerStage
            analyserRef={analyserRef}
            tracks={tracks}
            currentTrack={currentTrack}
            playing={playing}
            busy={busy}
            onToggle={togglePlay}
            onPrev={prevTrack}
            onNext={nextTrack}
            onSelect={playTrack}
          />
        )}
        {kind === "video" && (
          <video
            ref={mediaRef}
            src={media.url}
            autoPlay
            controls
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onLoadedMetadata={(e) => setRatio(e.currentTarget.videoWidth / e.currentTarget.videoHeight)}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {kind === "image" && (
          drive
            ? <iframe src={media.url} title={media.name} className="absolute inset-0 w-full h-full" />
            : <img src={media.url} alt={media.name} className="absolute inset-0 w-full h-full object-contain" onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />
        )}
        {kind === "doc" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 pointer-events-auto">
            <div className="h-16 w-16 rounded-2xl bg-ivory/10 flex items-center justify-center"><FileText className="h-8 w-8 text-ivory/55" /></div>
            <p className="text-sm text-ivory/85 max-w-xs">{media.name}</p>
            <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline"><Download className="h-3.5 w-3.5" /> Openen in nieuw tabblad</a>
          </div>
        )}
      </div>
    );
  };

  return createPortal(
    <>
      {/* Persistente audio voor muziek — blijft spelen bij minimaliseren */}
      {kind === "music" && (
        <audio
          ref={attachAudio}
          src={media.url}
          crossOrigin="anonymous"
          autoPlay
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          className="hidden"
        />
      )}

      {mediaMinimized ? (
        <div
          ref={minWrapRef}
          className="fixed z-[56] animate-scale-in touch-none"
          style={pos ? { left: pos.x, top: pos.y, width: minW, height: minH } : { right: 16, bottom: 16, width: minW, height: minH }}
        >
          {renderShell(true)}
        </div>
      ) : (
        <div ref={shellRef} className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-[56] animate-slide-right" style={{ width: windowW }}>
          {renderShell(false)}
        </div>
      )}
    </>,
    document.body
  );
}