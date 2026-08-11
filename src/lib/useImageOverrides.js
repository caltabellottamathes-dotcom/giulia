import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useImageOverrides — manual photo overrides for page heroes (and any
 * image slot keyed by page). Stored on the user record as `image_overrides`
 * so changing a photo costs no integration credits — only a URL is saved.
 * A module-level store keeps the latest values in memory so a freshly
 * navigated PageHero renders the override on first paint.
 */
const store = { overrides: null, promise: null };

async function loadOnce() {
  if (store.promise) return store.promise;
  store.promise = base44.auth.me()
    .then((u) => { store.overrides = (u && u.image_overrides) || {}; })
    .catch(() => { store.overrides = {}; });
  return store.promise;
}

export function useImageOverrides() {
  const [overrides, setOverrides] = useState(store.overrides || {});

  useEffect(() => {
    if (store.overrides) { setOverrides(store.overrides); return; }
    loadOnce().then(() => setOverrides(store.overrides || {}));
  }, []);

  const setOverride = async (key, url) => {
    const clean = url && url.trim();
    const next = { ...(store.overrides || {}) };
    if (clean) next[key] = clean;
    else delete next[key];
    store.overrides = next;
    setOverrides(next);
    try { await base44.auth.updateMe({ image_overrides: next }); } catch { /* ignore */ }
  };

  return { overrides, setOverride };
}