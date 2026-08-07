import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useEntityList — fetch real entity records (user-scoped via RLS).
 * Replaces mock data across the dashboard + screens.
 */
export function useEntityList(name, { filter, sort, limit } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(filter || {});

  useEffect(() => {
    let active = true;
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
  }, [name, key, sort, limit]);

  return { data, loading };
}