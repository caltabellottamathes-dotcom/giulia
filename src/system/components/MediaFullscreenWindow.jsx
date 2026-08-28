import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Download, Minus, Maximize2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import { cn } from "@/lib/utils";
import MusicViewerStage from "@/system/components/media/MusicViewerStage";
import PdfViewer from "@/system/panels/viewers/PdfViewer";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const DEFAULT_RATIO = { image: 4 / 3, video: 16 / 9, music: 3 / 4, doc: 4 / 3 };

/**
 * MediaFullscreenWindow — grote viewer die rechts uitschuift tot tegen de
 * bovenrand (top-0), even hoog als de witte kaart, met een slagschaduw naar
 * links. De shell-breedte past zich aan de media-verhouding aan. Voor pdf
 * wordt de pagina-verhouding vooraf opgehaald, zodat de viewer meteen in
 * het juiste formaat inschuift (geen glitch). Vorige/volgende-pagina knop
 * staat buiten de viewer, linksonder. Sluiten → glijdt visueel naar rechts
 * uit beeld. Muziek toont de vergrote LIFE MusicWidget; bij minimaliseren
 * verkleint de hele shell mee in de media-verhouding.
 */
export default function MediaFullscreenWindow() {
  const { mediaFullscreen, closeMediaFullscreen, mediaMinimized, minimizeMedia, restoreMedia } = usePanel();
  const { media, closeMedia } = useMediaViewer();
  const [playing, setPlaying] = useState(false);
  const [ratio, setRatio] = useState(3 / 4);
  const [ratioReady, setRatioReady] = useState(false);
  const [boxH, setBoxH] = useState(typeof window !== "undefined" ? window.innerHeight - 24 : 0);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pos, setPos] = useState(null);
  const [minSize, setMinSize] = useState(null);
  const [closing, setClosing] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPages, setPdfPages] = useState(0);
  const mediaRef = useRef(null);
  const minWrapRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);

  const kind = media?.kind;
  const drive = isDriveUrl(media?.url);
  const isPdf = media?.type === "pdf" || /\.pdf$/i.test(media?.name || media?.url || "");

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

  const attachAudio = useCallback((el) => {
    if (mediaRef.current && mediaRef.current !== el) {
      try { ctxRef.current?.close(); } catch { /* negeer */ }
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

  // Nieuwe media → reset
  useEffect(() => {
    if (mediaFullscreen) {
      setPlaying(false);
      setRatio(DEFAULT_RATIO[kind] ?? 3 / 4);
      setCurrentTrackId(null);
      setMinSize(null);
      setPos(null);
      setClosing(false);
      setPdfPage(1);
      setPdfPages(0);
    }
  }, [mediaFullscreen, media?.url, kind]);

  // ── ratio klaar? ── voor pdf wordt de pagina-verhouding vooraf opgehaald
  // zodat de shell meteen op de juiste breedte inschuift. Foto/video wachten
  // op load; muziek en overige soorten zijn meteen klaar.
  useEffect(() => {
    if (!mediaFullscreen) return;
    setRatioReady(false);
    let cancelled = false;
    const t = setTimeout(() => { if (!cancelled) setRatioReady(true); }, 2500);
    if (kind === "music") {
      setRatioReady(true);
    } else if (kind === "doc" && isPdf && !drive) {
      (async () => {
        try {
          const doc = await pdfjsLib.getDocument(media.url).promise;
          if (cancelled) return;
          const p1 = await doc.getPage(1);
          const vp = p1.getViewport({ scale: 1 });
          setRatio(vp.width / vp.height);
          try { doc.destroy(); } catch { /* negeer */ }
          if (!cancelled) setRatioReady(true);
        } catch { if (!cancelled) setRatioReady(true); }
      })();
    } else if (kind === "image" || kind === "video") {
      // ratio + ratioReady worden op onLoad / onLoadedMetadata gezet
    } else {
      setRatioReady(true);
    }
    return () => { cancelled = true; clearTimeout(t); };
  }, [mediaFullscreen, media?.url, kind, isPdf, drive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Muziek: initieel track uit de geopende url afleiden
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

  // Viewport + hoogte (shell = top-0 bottom-6 → vh - 24)
  useEffect(() => {
    const onR = () => { setVw(window.innerWidth); setVh(window.innerHeight); setBoxH(window.innerHeight - 24); };
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

  // Sluiten → eerst visueel naar rechts uit beeld glijden, dan pas unmounten
  const handleClose = useCallback(() => {
    const el = mediaRef.current;
    if (el) el.pause();
    setClosing(true);
    setTimeout(() => { closeMediaFullscreen(); closeMedia(); setClosing(false); }, 430);
  }, [closeMediaFullscreen, closeMedia]);

  if (!mediaFullscreen || !media) return null;

  // ── Afmetingen ──
  const maxWindowW = Math.min(vw - 32, 1400);
  const windowW = Math.max(320, Math.min(ratio && boxH ? ratio * boxH : 720, maxWindowW));
  const MAX_MIN_W = 360, MAX_MIN_H = 240;
  let minW, minH;
  if (ratio >= 1) { minW = Math.min(MAX_MIN_W, MAX_MIN_H * ratio); minH = minW / ratio; }
  else { minH = Math.min(MAX_MIN_H, MAX_MIN_W / ratio); minW = minH * ratio; }

  // ── Vrij verplaatsbare geminimaliseerde widget ──
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

  const onResizeDown = (e) => {
    const el = minWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!pos) setPos({ x: rect.left, y: rect.top });
    resizeRef.current = { sx: e.clientX, sy: e.clientY, w: rect.width, h: rect.height };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onResizeMove = (e) => {
    const d = resizeRef.current;
    if (!d) return;
    const dw = e.clientX - d.sx;
    const dh = e.clientY - d.sy;
    let nw = d.w + dw;
    let nh = d.h + dh;
    if (kind === "image" || kind === "video") {
      let s = Math.max(nw / d.w, nh / d.h, 180 / d.w);
      s = Math.min(s, (vw - 16) / d.w, (vh - 16) / d.h);
      nw = d.w * s;
      nh = d.h * s;
    } else {
      nw = Math.max(180, Math.min(nw, vw - 16));
      nh = Math.max(140, Math.min(nh, vh - 16));
    }
    setMinSize({ w: nw, h: nh });
  };
  const onResizeUp = () => { resizeRef.current = null; };

  // ── Shell-inhoud (window én minimized delen dit) ──
  const renderShell = (compact) => {
    const btn = compact ? "h-8 w-8" : "h-9 w-9";
    const ico = compact ? "h-3.5 w-3.5" : "h-4 w-4";
    const radius = compact ? "rounded-[20px]" : "rounded-l-[28px]";
    const closeBtn = "bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-ivory/15 transition-colors";
    const bareBtn = "flex items-center justify-center text-foreground/80 hover:text-foreground transition-colors";
    return (
      <div className={cn("relative w-full h-full overflow-hidden glass-3", radius, !compact && "shadow-[-48px_0_90px_-30px_rgba(0,0,0,0.55)]")}>
        <button onClick={handleClose} className={cn("absolute top-4 left-4 z-50 rounded-full", btn, closeBtn)} aria-label="Sluiten"><ArrowRight className={ico} /></button>

        <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5">
          <a href={media.url} target="_blank" rel="noreferrer" className={cn(btn, bareBtn)} aria-label="Openen in nieuw tabblad" title="Openen in nieuw tabblad"><Download className={ico} /></a>
          {compact ? (
            <button onClick={restoreMedia} className={cn(btn, bareBtn)} aria-label="Vergroten" title="Vergroten"><Maximize2 className={ico} /></button>
          ) : (
            <button onClick={minimizeMedia} className={cn(btn, bareBtn)} aria-label="Minimaliseren" title="Minimaliseren naar widget"><Minus className={ico} /></button>
          )}
        </div>

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

        {kind !== "music" && kind !== "doc" && !compact && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center" style={{ color: "hsl(var(--ivory))", textShadow: "0 1px 8px rgba(0,0,0,0.65)" }}>
            <p className="font-display font-semibold tracking-[0.22em] uppercase text-[10px] leading-none opacity-70">{kind === "video" ? "VIDEO" : kind === "image" ? "FOTO" : kind === "doc" ? "DOCUMENT" : "BESTAND"}</p>
            <p className="text-[12px] tracking-wide truncate max-w-[46vw] mt-1">{media.name || "Media"}</p>
          </div>
        )}

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
            preload="auto"
            controls
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onLoadedMetadata={(e) => { setRatio(e.currentTarget.videoWidth / e.currentTarget.videoHeight); setRatioReady(true); }}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {kind === "image" && (
          drive
            ? <iframe src={media.url} title={media.name} className="absolute inset-0 w-full h-full" />
            : <img src={media.url} alt={media.name} className="absolute inset-0 w-full h-full object-contain" onLoad={(e) => { setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight); setRatioReady(true); }} />
        )}
        {kind === "doc" && (
          (isPdf && !drive)
            ? <div className="absolute inset-0"><PdfViewer url={media.url} compact mode="height" page={pdfPage} onPageChange={setPdfPage} onNumPages={setPdfPages} onAspect={setRatio} showControls={false} /></div>
            : (drive || isPdf)
              ? <div className="absolute inset-4 sm:inset-6 rounded-2xl bg-white overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)]"><iframe src={media.url} title={media.name} className="w-full h-full" /></div>
              : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 pointer-events-auto">
                  <div className="h-16 w-16 rounded-2xl bg-ivory/10 flex items-center justify-center"><FileText className="h-8 w-8 text-ivory/55" /></div>
                  <p className="text-sm text-ivory/85 max-w-xs">{media.name}</p>
                  <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline"><Download className="h-3.5 w-3.5" /> Openen in nieuw tabblad</a>
                </div>
              )
        )}
      </div>
    );
  };

  // Externe vorige/volgende-knop voor pdf — buiten de viewer, linksonder
  const pdfNav = !mediaMinimized && kind === "doc" && isPdf && !drive && ratioReady && (
    <div className="fixed z-[57] flex items-center gap-1 rounded-full glass-2 px-2 py-1.5" style={{ right: windowW + 8, bottom: 72 }}>
      <button onClick={() => setPdfPage((p) => Math.max(1, p - 1))} disabled={pdfPage <= 1} className="h-8 w-8 rounded-full flex items-center justify-center text-foreground/80 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronLeft className="h-4 w-4" /></button>
      <span className="font-mono text-[11px] text-foreground/70 px-1 min-w-[56px] text-center">{pdfPage} / {pdfPages || "—"}</span>
      <button onClick={() => setPdfPage((p) => Math.min(pdfPages || 1, p + 1))} disabled={pdfPage >= pdfPages} className="h-8 w-8 rounded-full flex items-center justify-center text-foreground/80 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );

  return createPortal(
    <>
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
          style={pos ? { left: pos.x, top: pos.y, width: minSize?.w || minW, height: minSize?.h || minH } : { right: 16, bottom: 16, width: minSize?.w || minW, height: minSize?.h || minH }}
        >
          {renderShell(true)}
          <div
            onPointerDown={onResizeDown}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onPointerCancel={onResizeUp}
            className="absolute bottom-1 right-1 z-50 h-5 w-5 cursor-se-resize touch-none flex items-end justify-center"
            aria-label="Grootte aanpassen"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" className="opacity-60 hover:opacity-100 transition-opacity" style={{ color: "hsl(var(--ivory))" }}>
              <line x1="3" y1="10" x2="10" y2="3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="6.5" y1="10" x2="10" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ) : ratioReady && boxH > 0 ? (
        <div
          className="fixed right-0 top-0 bottom-6 z-[56] animate-slide-right transition-transform duration-[430ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: windowW, transform: closing ? "translateX(100%)" : undefined }}
        >
          {renderShell(false)}
        </div>
      ) : null}

      {pdfNav}
    </>,
    document.body
  );
}