/**
 * refreshBus — simpele globale pub/sub voor "ververs alles".
 * De Update-knop roept bumpRefresh(); widgets en panelen die useLearningSync
 * gebruiken horen dat en halen hun data opnieuw op. Eén signaal voor alle
 * dashboards tegelijk.
 */
const listeners = new Set();

export function bumpRefresh() {
  listeners.forEach((l) => { try { l(); } catch { /* ignore */ } });
}

export function onRefresh(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Globale "kom terug naar het tabblad / window-focus" → ververs alles.
// Zorgt dat élke pagina en panel (alles via useEntityList) altijd de laatste
// stand toont, niet alleen het dashboard. Eén listener, één signaal.
if (typeof window !== "undefined" && !window.__giulia_focus_refresh) {
  window.__giulia_focus_refresh = true;
  const bump = () => bumpRefresh();
  window.addEventListener("focus", bump);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") bump();
  });
}