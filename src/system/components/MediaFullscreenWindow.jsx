import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Download, Maximize2, Music, FileText } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaViewer, isDriveUrl } from "@/lib/MediaViewerContext";

/**
 * MediaFullscreenWindow — fullscreen, vrij vergrootbaar venster voor het
* afspelen van media (foto / video / audio / document). De inhoudsstage
 * behoudt een gekozen beeldverhouding en kan met de hoekgreep worden
 * vergroot/verkleind. Sluitknop linksboven (GIULIA-voorkeur).
 */
const RATIOS = [
  { key: "fit", label: "Fit" },
  { key: "16:9", label: "16:9" },
  { key: "4:3", label: "4:3" },
  { key: "1:1", label: "1:1" },
  { key: "9:16", label: "9:16" },
];
const ratioVal = (k) => (k === "fit" ? null : k.split("/").reduce((a, b) => Number(a) / Number(b)));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function MediaFullscreenWindow() {
  const { mediaFullscreen, closeMediaFullscreen } = usePanel();
  const { media } = useMediaViewer();
  const [ratioKey, setRatioKey] = useState("fit");
  const [size, setSize] = useState(() => ({
    w: clamp(window.innerWidth - 160, 320, 1280),
    h: clamp(window.innerHeight - 220, 240, 820),
  }));
  const stageRef = useRef(null);

  // Esc sluit
  useEffect(() => {
    if (!mediaFullscreen) return;
    const h = (e) => { if (e.key === "Escape") closeMediaFullscreen(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mediaFullscreen, closeMediaFullscreen]);

  // Body-scroll vergrendelen
  useEffect(() => {
    if (mediaFullscreen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mediaFullscreen]);

  // Bij nieuw media: reset naar verstandige basisafmeting passend bij soort
  useEffect(() => {
    if (!mediaFullscreen) return;
    const kind = media?.kind;
    const baseW = clamp(window.innerWidth - 160, 320, 1280);
    if (kind === "image") setRatioKey("fit");
    else if (kind === "music") setRatioKey("1:1");
    else setRatioKey("16:9");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaFullscreen, media?.url]);

  // Pas hoogte aan wanneer ratio verandert (breedte blijft)
  useEffect(() => {
    const r = ratioVal(ratioKey);
    if (!r) return;
    setSize((s) => ({ w: s.w, h: clamp(s.w / r, 200, window.innerHeight - 160) }));
  }, [ratioKey]);

  // Sleep hoekgreep om te vergroten/verkleinen
  const onCornerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startW = size.w, startH = size.h;
    const r = ratioVal(ratioKey);
    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      const maxW = window.innerWidth - 120, maxH = window.innerHeight - 140;
      const newW = clamp(startW + dx, 280, maxW);
      const newH = r ? clamp(newW / r, 180, maxH) : clamp(startH + dy, 180, maxH);
      setSize({ w: newW, h: newH });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [size, ratioKey]);

  if (!mediaFullscreen || !media) return null;

  const drive = isDriveUrl(media.url);
  const kind = media.kind;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[57] bg-charcoal/40 animate-fade-in" onClick={closeMediaFullscreen} />
      <div className="fixed inset-0 z-[58] flex items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto relative flex flex-col rounded-[20px] overflow-hidden glass-4 float-shadow text-ivory animate-scale-in"
          style={{ width: size.w, maxWidth: "calc(100vw - 48px)", maxHeight: "calc(100vh - 48px)" }}
        >
          {/* Titelbalk */}
          <div className="shrink-0 flex items-center gap-2 pl-3 pr-2 h-12 border-b border-white/10">
            <button
              onClick={closeMediaFullscreen}
              className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[13px] text-ivory/85 truncate flex-1">{media.name || "Media"}</p>
            <a
              href={media.url}
              target="_blank"
              rel="noreferrer"
              className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors shrink-0"
              aria-label="Openen in nieuw tabblad"
              title="Openen in nieuw tabblad"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>

          {/* Ratio-presets */}
          <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/10 overflow-x-auto no-scrollbar">
            {RATIOS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRatioKey(r.key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  ratioKey === r.key ? "bg-ivory text-charcoal" : "glass-1 text-ivory/70 hover:text-ivory"
                }`}
              >
                {r.label}
              </button>
            ))}
            <span className="ml-auto text-[10px] font-mono text-ivory/40 tabular-nums shrink-0">
              {Math.round(size.w)}×{Math.round(size.h)}
            </span>
          </div>

          {/* Stage */}
          <div
            ref={stageRef}
            className="relative flex-1 min-h-0 bg-black flex items-center justify-center overflow-hidden"
          >
            {kind === "image" && (
              drive
                ? <iframe src={media.url} title={media.name} className="w-full h-full" />
                : <img src={media.url} alt={media.name} className="max-w-full max-h-full object-contain" />
            )}
            {kind === "video" && (
              drive
                ? <iframe src={media.url} title={media.name} className="w-full h-full" allow="autoplay" />
                : <video src={media.url} controls autoPlay className="max-w-full max-h-full" />
            )}
            {kind === "music" && (
              drive
                ? <iframe src={media.url} title={media.name} className="w-full h-full" allow="autoplay" />
                : (
                  <div className="flex flex-col items-center gap-5 p-6">
                    <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-ivory/15 to-ivory/5 border border-white/12 flex items-center justify-center">
                      <Music className="h-12 w-12 text-ivory/60" />
                    </div>
                    <p className="text-sm text-ivory/90 truncate max-w-full">{media.name}</p>
                    <audio src={media.url} controls autoPlay className="w-full max-w-md" />
                  </div>
                )
            )}
            {kind === "doc" && (
              <div className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-ivory/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-ivory/55" />
                </div>
                <p className="text-sm text-ivory/85 max-w-xs">{media.name}</p>
                <a href={media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-olive hover:underline">
                  <Download className="h-3.5 w-3.5" /> Openen in nieuw tabblad
                </a>
              </div>
            )}

            {/* Hoekgreep om te vergroten/verkleinen (rechtsonder) */}
            <div
              onPointerDown={onCornerDown}
              className="absolute bottom-1.5 right-1.5 h-6 w-6 cursor-nwse-resize touch-none flex items-end justify-end"
              aria-label="Vergroten / verkleinen"
              title="Sleep om te vergroten/verkleinen"
            >
              <div className="h-3 w-3 border-r-2 border-b-2 border-ivory/45 rounded-br-md" />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}