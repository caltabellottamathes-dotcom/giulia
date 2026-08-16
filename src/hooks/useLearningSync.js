import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { onRefresh } from "@/lib/refreshBus";

/**
 * useLearningSync — abonneert op de Activity-feed: de ene learning/sync-bron.
 * Geeft een `tick` die omhoog gaat bij élke schrijfactie in het OS (LIFE of
 * FOCUS, chat of automatie), zolang die via de learningLayer loopt. Widgets,
 * panelen en pagina's gebruiken de tick als dependency (of via
 * useEntityList({ externalTick })) om zichzelf te verversen — één bron,
 * dezelfde regels voor alle domeinen.
 */
export function useLearningSync() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const entity = base44.entities.Activity;
    if (!entity || !entity.subscribe) return;
    const unsub = entity.subscribe((event) => {
      if (!event || !event.type) return;
      setTick((t) => t + 1);
    });
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, []);
  // Update-knop → directe, globale refresh voor alles wat deze hook gebruikt.
  useEffect(() => onRefresh(() => setTick((t) => t + 1)), []);
  return tick;
}