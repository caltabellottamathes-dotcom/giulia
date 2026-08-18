import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/**
 * BeeldbankContext — de beeldbank-modus van GIULIA OS.
 *
 * - `mode`: als aan, wordt elke <img> in het systeem klikbaar; er opent een
 *   kiezer met alle foto's (website-register + eigen uploads) om die foto
 *   te wisselen. De gekozen foto wordt direct op het scherm gezet én
 *   persistent opgeslagen op de gebruiker (image_overrides) en in het
 *   IMAGES-register gemuteerd, zodat de swap ook na herladen zichtbaar is.
 * - `assets`: geüploade foto's (ImageAsset-entity).
 * - `upload` / `removeAsset`: eigen foto's toevoegen/verwijderen.
 */
const BeeldbankContext = createContext(null);

// Snapshot van de oorspronkelijke register-URL's — blijft constant, zodat we
// overrides altijd kunnen terugkoppelen naar de echte bron-sleutel.
const ORIGINAL_IMAGES = { ...IMAGES };
const keyByCurrentUrl = (url) => Object.keys(IMAGES).find((k) => IMAGES[k] === url);

/** Normaliseer een <img>-URL naar de oorspronkelijke basis-URL.
 *  De Image-component transformeert media.base44.com URL's naar
 *  /v1/fill/w_,h_,... varianten. Om de override te koppelen aan de juiste
 *  IMAGES-sleutel stripsen we het /v1/ gedeelte. */
function normalizeImgUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (["media.base44.com", "static.wixstatic.com"].includes(u.hostname)) {
      const v1 = u.pathname.indexOf("/v1/");
      const basePath = v1 === -1 ? u.pathname : u.pathname.slice(0, v1);
      return `${u.origin}${basePath}`;
    }
    return url;
  } catch { return url; }
}

export function BeeldbankProvider({ children }) {
  const [mode, setMode] = useState(false);
  const [assets, setAssets] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [picker, setPicker] = useState({ open: false, originalUrl: null, imgEl: null });
  const [uploading, setUploading] = useState(false);
  const applied = useRef(false);

  const loadAssets = useCallback(async () => {
    try {
      const list = await base44.entities.ImageAsset.list("-created_date", 200);
      setAssets(list || []);
    } catch { setAssets([]); }
  }, []);

  // Bij opstart: persisted overrides toepassen op het IMAGES-register.
  useEffect(() => {
    if (applied.current) return; applied.current = true;
    (async () => {
      try {
        const u = await base44.auth.me();
        const ov = (u && u.image_overrides) || {};
        setOverrides(ov);
        for (const [orig, chosen] of Object.entries(ov)) {
          const k = Object.keys(ORIGINAL_IMAGES).find((key) => ORIGINAL_IMAGES[key] === orig);
          if (k) IMAGES[k] = chosen;
        }
      } catch {}
      loadAssets();
    })();
  }, [loadAssets]);

  // Globale click-listener in beeldbank-modus — pakt elke <img> in de app.
  // Uit zodra de kiezer open is ( anders pakt de kiezer zichzelf opnieuw ).
  useEffect(() => {
    if (!mode || picker.open) return;
    const handler = (e) => {
      // elementsFromPoint vindt ook <img>'s die achter een overlay liggen
      // (gradients in headers, widget-kaarten met text-lagen eroverheen).
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      let img = null;
      for (const el of els) {
        if (el.tagName === "IMG" && !el.dataset.emptyImage && !el.dataset.errorImage) { img = el; break; }
      }
      if (!img) return;
      e.preventDefault();
      e.stopPropagation();
      setPicker({ open: true, originalUrl: normalizeImgUrl(img.src || img.currentSrc), imgEl: img });
    };
    document.addEventListener("click", handler, true);
    document.body.classList.add("beeldbank-active");
    return () => {
      document.removeEventListener("click", handler, true);
      document.body.classList.remove("beeldbank-active");
    };
  }, [mode, picker.open]);

  const toggleMode = useCallback(() => setMode((m) => !m), []);
  const closePicker = useCallback(() => setPicker((p) => ({ ...p, open: false, imgEl: null })), []);

  const pick = useCallback(async (chosenUrl) => {
    const { originalUrl, imgEl } = picker;
    if (imgEl) { try { imgEl.src = chosenUrl; } catch {} }
    const norm = normalizeImgUrl(originalUrl);
    const key = keyByCurrentUrl(norm);
    const orig = key ? ORIGINAL_IMAGES[key] : norm;
    const next = { ...(overrides || {}) };
    if (chosenUrl) next[orig] = chosenUrl; else delete next[orig];
    setOverrides(next);
    if (key) IMAGES[key] = chosenUrl;
    try { await base44.auth.updateMe({ image_overrides: next }); } catch {}
    setPicker((p) => ({ ...p, open: false, imgEl: null }));
  }, [picker, overrides]);

  const upload = useCallback(async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const rec = await base44.entities.ImageAsset.create({
        url: file_url, label: file.name, origin: "uploaded", category: "upload",
      });
      setAssets((a) => [rec, ...(a || [])]);
      return rec;
    } catch { return null; } finally { setUploading(false); }
  }, []);

  const removeAsset = useCallback(async (id) => {
    try {
      await base44.entities.ImageAsset.delete(id);
      setAssets((a) => (a || []).filter((x) => x.id !== id));
    } catch {}
  }, []);

  const value = {
    mode, toggleMode, setMode, assets, loadAssets, overrides,
    picker, pick, closePicker, upload, uploading, removeAsset,
  };
  return <BeeldbankContext.Provider value={value}>{children}</BeeldbankContext.Provider>;
}

export function useBeeldbank() {
  const ctx = useContext(BeeldbankContext);
  if (!ctx) throw new Error("useBeeldbank must be used within BeeldbankProvider");
  return ctx;
}