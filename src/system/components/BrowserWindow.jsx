import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, RotateCw, ExternalLink, Globe, Lock, X } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";

/**
 * BrowserWindow — volledig fullscreen, horizontaal in-app browserwindow.
 * Geen paneel: een eigen floating overlay (naast chat/voice) die de hele
 * viewport inneemt met een adresbalk boven en een iframe eronder.
 */
const HOME_URL = "https://giulia-os-flow.base44.app";

function normalizeUrl(input) {
  const v = (input || "").trim();
  if (!v) return "";
  if (!/^[a-zA-Z]+:\/\//.test(v) && !/^about:/.test(v)) {
    if (/^[\w-]+(\.[\w-]+)+/.test(v)) return `https://${v}`;
    return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
  }
  return v;
}

export default function BrowserWindow() {
  const { browserOpen, closeBrowser } = usePanel();
  const [history, setHistory] = useState([HOME_URL]);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState(HOME_URL);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  const current = history[index];

  // reset state telkens als het window (her)opent
  useEffect(() => {
    if (browserOpen) {
      setHistory([HOME_URL]);
      setIndex(0);
      setAddress(HOME_URL);
      setLoading(false);
    }
  }, [browserOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && browserOpen) closeBrowser(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [browserOpen, closeBrowser]);

  useEffect(() => {
    if (browserOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [browserOpen]);

  const navigate = useCallback((raw) => {
    const url = normalizeUrl(raw);
    if (!url) return;
    setHistory((h) => [...h.slice(0, index + 1), url]);
    setIndex((i) => i + 1);
    setAddress(url);
    setLoading(true);
  }, [index]);

  const back = () => {
    if (index > 0) { setIndex(index - 1); setAddress(history[index - 1]); setLoading(true); }
  };
  const forward = () => {
    if (index < history.length - 1) { setIndex(index + 1); setAddress(history[index + 1]); setLoading(true); }
  };
  const reload = () => {
    setLoading(true);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "about:blank";
      requestAnimationFrame(() => { iframeRef.current.src = src; });
    }
  };

  useEffect(() => { setAddress(current); }, [current]);

  if (!browserOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[55] bg-charcoal/30 animate-fade-in" onClick={closeBrowser} />
      <div className="fixed inset-3 sm:inset-4 lg:inset-6 z-[56] animate-scale-in">
        <div className="relative w-full h-full rounded-[24px] overflow-hidden flex flex-col glass-4 float-shadow text-ivory">
          {/* Sluitknop linksboven */}
          <button
            onClick={closeBrowser}
            className="absolute top-3 left-3 z-20 h-9 w-9 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Adresbalk — volledige breedte, horizontaal */}
          <div className="shrink-0 px-3 pt-3 pb-2 pl-16 flex items-center gap-2">
            <button onClick={back} disabled={index === 0} className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors disabled:opacity-30" aria-label="Terug">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={forward} disabled={index >= history.length - 1} className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors disabled:opacity-30" aria-label="Vooruit">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={reload} className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Herladen">
              <RotateCw className="h-4 w-4" />
            </button>

            <form
              onSubmit={(e) => { e.preventDefault(); navigate(address); }}
              className="flex-1 flex items-center gap-2 rounded-full px-4 h-10 glass-1"
            >
              <Lock className="h-3.5 w-3.5 text-olive shrink-0" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="Voer een URL of zoekterm in…"
                spellCheck={false}
                className="flex-1 bg-transparent text-[14px] text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              {loading && <span className="h-3.5 w-3.5 rounded-full border-2 border-ivory/20 border-t-ivory animate-spin shrink-0" />}
            </form>

            <a
              href={current}
              target="_blank"
              rel="noreferrer"
              className="h-9 w-9 shrink-0 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
              aria-label="Openen in nieuw tabblad"
              title="Openen in nieuw tabblad"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="px-3 pb-2"><div className="h-px bg-olive/40" /></div>

          {/* Browser viewport — vult de rest */}
          <div className="relative flex-1 min-h-0 mx-3 mb-3 rounded-2xl overflow-hidden bg-charcoal/40">
            <iframe
              ref={iframeRef}
              src={current}
              title="In-app browser"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            <BlockedHint url={current} />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function BlockedHint({ url }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, [url]);
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex justify-center">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] glass-2 text-ivory/80 hover:text-ivory transition-colors"
      >
        <Globe className="h-3 w-3" />
        Pagina leeg? Sommige sites blokkeren inbedding — open in nieuw tabblad
      </a>
    </div>
  );
}