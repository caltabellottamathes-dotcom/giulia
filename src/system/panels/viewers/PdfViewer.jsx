import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, FileWarning } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Worker via CDN op de geïnstalleerde versie — robuuster dan Vite's ?worker/?url
// imports voor pdfjs-dist v4.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * PdfViewer — OS-eigen pdf.js viewer. Pagina's renderen naar canvas op de
 * transparante glas-ondergrond (geen browser-chrome). De besturing (vorige/
 * volgende + zoom) zit binnen het pdf-beeld, rechtsonder.
 *
 * mode="width"  → pagina past op de container-breedte; hoogte volgt (stage).
 * mode="height" → pagina is exact zo hoog als de viewer; breedte volgt (groot).
 * onAspect(word/height) → meldt de pagina-verhouding zodat de shell meeschalen kan.
 */
export default function PdfViewer({ url, compact = false, mode = "width", onAspect }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const renderRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setPdf(null); setPage(1); setScale(1);
    (async () => {
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdf(doc); setNumPages(doc.numPages); setLoading(false);
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
        const cw = Math.max(120, wrapRef.current.clientWidth - 24);
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
    <div ref={wrapRef} className={"relative w-full h-full flex items-start justify-center overflow-y-auto " + (mode === "height" ? "" : "py-3 px-3")}>
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
      <div className="relative">
        <canvas ref={canvasRef} className="block rounded-md bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]" />
        {!loading && !error && numPages > 0 && (
          <div className={"absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full glass-2 px-2 py-1 " + (compact ? "scale-90 origin-bottom-right" : "")}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronLeft className="h-4 w-4" /></button>
            <span className="font-mono text-[10px] tracking-wide text-foreground/70 px-1 min-w-[54px] text-center">{page} / {numPages}</span>
            <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronRight className="h-4 w-4" /></button>
            <span className="w-px h-4 bg-foreground/15 mx-0.5" />
            <button onClick={() => zoom(-0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 transition"><ZoomOut className="h-4 w-4" /></button>
            <span className="font-mono text-[10px] text-foreground/60 px-1 min-w-[34px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => zoom(0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/75 hover:bg-foreground/10 transition"><ZoomIn className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}