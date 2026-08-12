import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useEntityList — fetch real entity records (user-scoped via RLS).
 * `reload()` re-fetches after create/update/delete.
 */
export function useEntityList(name, { filter, sort, limit, realtime } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(filter || {});

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res =
          filter && Object.keys(filter).length
            ? await base44.entities[name].filter(filter, sort, limit)
            : await base44.entities[name].list(sort, limit);
        if (active) {
          setData(Array.isArray(res) ? res : []);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setData([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [name, key, sort, limit, tick]);

  // Real-time: herlaad wanneer er een create/update/delete op deze entity is.
  useEffect(() => {
    if (!realtime) return;
    const entity = base44.entities[name];
    if (!entity || !entity.subscribe) return;
    const unsub = entity.subscribe((event) => {
      if (!event || !event.type) return;
      setTick((t) => t + 1);
    });
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, [name, realtime]);

  return { data, loading, reload };
}