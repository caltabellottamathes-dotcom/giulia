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