import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, FileWarning } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

/**
 * PdfViewer — OS-eigen pdf.js viewer. Pagina's renderen naar canvas en drijven
 * op de transparante glas-ondergrond (geen browser-chrome, geen grijze backdrop).
 * Eigen besturing: vorige/volgende pagina + zoom, in glaspillen. Achtergrond
 * blijft transparant zodat de glasmorfisme van de stage/shell zichtbaar blijft.
 */
export default function PdfViewer({ url, compact = false }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const renderRef = useRef(null);

  // Document laden
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setPdf(null); setPage(1); setScale(1);
    (async () => {
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        setPdf(doc); setNumPages(doc.numPages); setLoading(false);
      } catch {
        if (!cancelled) { setError("PDF kon niet worden geladen."); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  // Passend maken op de breedte van de container
  const fitWidth = useCallback(async () => {
    if (!pdf || !wrapRef.current) return;
    try {
      const p = await pdf.getPage(page);
      const vp = p.getViewport({ scale: 1 });
      const cw = Math.max(120, wrapRef.current.clientWidth - 24);
      setScale(Math.max(0.25, cw / vp.width));
    } catch { /* negeer */ }
  }, [pdf, page]);

  useEffect(() => { fitWidth(); }, [fitWidth]);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => fitWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitWidth]);

  // Huidige pagina renderen
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
    <div ref={wrapRef} className="relative w-full h-full flex items-start justify-center overflow-y-auto py-4">
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
      <canvas ref={canvasRef} className="block rounded-md bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]" />

      {!loading && !error && numPages > 0 && (
        <div className={"sticky bottom-3 z-20 flex items-center gap-1 rounded-full glass-2 px-2 py-1 " + (compact ? "scale-90 origin-bottom" : "")}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-mono text-[10px] tracking-wide text-foreground/70 px-1 min-w-[54px] text-center">{page} / {numPages}</span>
          <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-foreground/10 disabled:opacity-30 transition"><ChevronRight className="h-4 w-4" /></button>
          <span className="w-px h-4 bg-foreground/15 mx-0.5" />
          <button onClick={() => zoom(-0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-foreground/10 transition"><ZoomOut className="h-4 w-4" /></button>
          <span className="font-mono text-[10px] text-foreground/60 px-1 min-w-[34px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => zoom(0.2)} className="h-7 w-7 rounded-full flex items-center justify-center text-foreground/70 hover:bg-foreground/10 transition"><ZoomIn className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}