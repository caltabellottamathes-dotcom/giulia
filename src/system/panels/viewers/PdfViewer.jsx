import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, FileWarning } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * PdfViewer — OS-eigen pdf.js viewer. Pagina's renderen naar canvas op de
 * transparante glas-ondergrond (geen browser-chrome). De besturing (vorige /
 * volgende + zoom) staat onder de pdf, links uitgelijnd met de pagina.
 *
 * mode="width"  → pagina past op de container-breedte; hoogte volgt (stage).
 * mode="height" → pagina is exact zo hoog als de viewer; breedte volgt (groot).
 * page/onPageChange/onNumPages → externe besturing (grote viewer gebruikt een
 * eigen knop buiten het beeld).
 * onAspect(word/height) → meldt de pagina-verhouding voor shell-breedte.
 */
export default function PdfViewer({ url, compact = false, mode = "width", onAspect, page: ctrlPage, onPageChange, onNumPages, showControls = true }) {
  const [pdf, setPdf] = useState(null);
  const [innerPage, setInnerPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const renderRef = useRef(null);

  const page = ctrlPage != null ? ctrlPage : innerPage;
  const setPage = (p) => { if (ctrlPage != null) onPageChange?.(p); else setInnerPage(p); };

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setPdf(null); setNumPages(0);
    if (ctrlPage == null) setInnerPage(1);
    setScale(1);
    (async () => {
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdf(doc); setNumPages(doc.numPages); onNumPages?.(doc.numPages); setLoading(false);
        try {
          const p1 = await doc.getPage(1);
          const vp = p1.getViewport({ scale: 1 });
          onAspect?.(vp.width / vp.height);
        } catch { /* negeer */ }
      } catch {
        if (!cancelled) { setError("PDF kon niet worden geladen."); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  const fit = useCallback(async () => {
    if (!pdf || !wrapRef.current) return;
    try {
      const p = await pdf.getPage(page);
      const vp = p.getViewport({ scale: 1 });
      if (mode === "height") {
        const ch = Math.max(120, wrapRef.current.clientHeight);
        setScale(Math.max(0.2, ch / vp.height));
      } else {
        const cw = Math.max(120, wrapRef.current.clientWidth - 64);
        setScale(Math.max(0.25, cw / vp.width));
      }
    } catch { /* negeer */ }
  }, [pdf, page, mode]);

  useEffect(() => { fit(); }, [fit]);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const render = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;
    try {
      const p = await pdf.getPage(page);
      const viewport = p.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (renderRef.current) { try { renderRef.current.cancel(); } catch { /* negeer */ } }
      renderRef.current = p.render({ canvasContext: ctx, viewport });
      await renderRef.current.promise;
    } catch { /* RenderingCancelledException e.d. */ }
  }, [pdf, page, scale]);

  useEffect(() => { render(); }, [render]);

  const zoom = (d) => setScale((s) => Math.max(0.25, Math.min(3, +(s + d).toFixed(2))));

  return (
    <div ref={wrapRef} className={"relative w-full h-full flex items-start justify-center overflow-y-auto " + (mode === "height" ? "" : "py-6 px-8")}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/55" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <FileWarning className="h-7 w-7 text-foreground/55" />
          <p className="text-[12px] text-foreground/65">{error}</p>
        </div>
      )}
      <div className="flex flex-col items-start">
        <canvas ref={canvasRef} className="block rounded-md bg-white shadow-[0_20px_44px_-20px_rgba(0,0,0,0.35)]" />
        {showControls && !loading && !error && numPages > 0 && (
          <div className={"mt-3 flex items-center gap-1 rounded-full glass-2 px-2 py-1 " + (compact ? "scale-90 origin-left" : "")}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="h-7 w-7 rounded-full flex items-center justify-center text-ivory/80 hover:bg-ivory/10 disabled:opacity-30 transition"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-[10px] tracking-wide text-ivory/70 px-1 min-w-[54px] text-center">{page} / {numPages}</span>
            <button onClick={() => setPage(Math.min(numPages, page + 1))} disabled={page >= numPages} className="h-7 w-7 rounded-full flex items-center justify-center text-ivory/80 hover:bg-ivory/10 disabled:opacity-30 transition"><ChevronRight className="h-4 w-4" /></button>
            <span className="w-px h-4 bg-ivory/15 mx-0.5" />
            <button onClick={() => zoom(-0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 transition"><ZoomOut className="h-4 w-4" /></button>
            <span className="font-mono text-[10px] text-ivory/60 px-1 min-w-[34px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => zoom(0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 transition"><ZoomIn className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}