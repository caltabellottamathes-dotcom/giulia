import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Download, Minus, Maximize2, FileText } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import { cn } from "@/lib/utils";
import MusicViewerStage from "@/system/components/media/MusicViewerStage";

const KIND_LABEL = { image: "FOTO", video: "VIDEO", music: "AUDIO", doc: "DOCUMENT" };
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
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [busy, setBusy] = useState(false);
  const mediaRef = useRef(null);
  const shellRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const graphReadyRef = useRef(false);

  const kind = media?.kind;
  const isPlayable = kind === "music" || kind === "video";

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

  const ensureGraph = useCallback(() => {
    if (graphReadyRef.current) return;
    const a = mediaRef.current;
    if (!a) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.74;
      const src = ctx.createMediaElementSource(a);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      graphReadyRef.current = true;
    } catch { /* grafo al bestaat of niet ondersteund */ }
  }, []);

  // Nieuwe media → reset + ratio
  useEffect(() => {
    if (mediaFullscreen) {
      setPlaying(false);
      setRatio(DEFAULT_RATIO[kind] ?? 3 / 4);
      setCurrentTrackId(null);
    }
  }, [mediaFullscreen, media?.url, kind]);

  // Voor muziek: grafo opzetten + initieel track uit de geopende url afleiden
  useEffect(() => {
    if (kind !== "music") return;
    ensureGraph();
    if (currentTrackId) return;
    const match = cloudMusic.find((t) => t.url === media.url);
    if (match) setCurrentTrackId(match.id);
    else if (tracks.length) setCurrentTrackId(tracks[0].id);
  }, [kind, cloudMusic, tracks, media?.url, currentTrackId, ensureGraph]);

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
    const onR = () => setVw(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const onPlay = () => setPlaying(true);
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
      ensureGraph();
      ctxRef.current?.resume?.();
      await a.play();
      setCurrentTrackId(t.id);
    } catch { /* negeer */ } finally { setBusy(false); }
  }, [resolveUrl, ensureGraph]);

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

  // ── Shell-inhoud (window én minimized delen dit) ──
  const renderShell = (compact) => {
    const btn = compact ? "h-8 w-8" : "h-9 w-9";
    const ico = compact ? "h-3.5 w-3.5" : "h-4 w-4";
    const radius = compact ? "rounded-[20px]" : "rounded-[28px]";
    const glassBtn = "bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors";
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-charcoal float-shadow", radius)}>
        {/* Sluitknop linksboven */}
        <button onClick={handleClose} className={cn("absolute top-4 left-4 z-40 rounded-full", btn, glassBtn)} aria-label="Sluiten"><X className={ico} /></button>

        {/* Acties rechtsboven */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5">
          <a href={media.url} target="_blank" rel="noreferrer" className={cn("rounded-full", btn, glassBtn)} aria-label="Openen in nieuw tabblad" title="Openen in nieuw tabblad"><Download className={ico} /></a>
          {compact ? (
            <button onClick={restoreMedia} className={cn("rounded-full", btn, glassBtn)} aria-label="Vergroten" title="Vergroten"><Maximize2 className={ico} /></button>
          ) : (
            <button onClick={minimizeMedia} className={cn("rounded-full", btn, glassBtn)} aria-label="Minimaliseren" title="Minimaliseren naar widget"><Minus className={ico} /></button>
          )}
        </div>

        {/* Titel-overlay — VoiceWindow-stijl (enkel niet-muziek) */}
        {kind !== "music" && (
          <div className={cn("absolute top-0 inset-x-0 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-3 z-30 pointer-events-none", compact ? "px-3 pt-3 pb-6 ml-10" : "px-5 pt-5 pb-10 ml-12")}>
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", playing && isPlayable ? "bg-olive animate-pulse-soft" : "bg-ivory/30")} />
            <div className="min-w-0">
              <p className={cn("font-display font-semibold tracking-[0.22em] uppercase text-ivory leading-none", compact ? "text-[10px]" : "text-[13px]")}>MEDIA · {KIND_LABEL[kind] || "BESTAND"}</p>
              <p className={cn("text-ivory/60 tracking-wide truncate", compact ? "text-[9px] mt-1" : "text-[11px] mt-1.5")}>{media.name || "Media"}</p>
            </div>
          </div>
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
            className="absolute inset-0 w-full h-full object-contain bg-black"
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
          ref={mediaRef}
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
        <div className="fixed bottom-4 right-4 z-[56] animate-scale-in" style={{ width: minW, height: minH }}>
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