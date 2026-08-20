import { useEffect, useRef, useState } from "react";

/** GIULIA graph palette — editorial tokens. */
export const A = {
  olive: "hsl(var(--olive))",
  ridge: "hsl(var(--ridge))",
  sand: "hsl(var(--sand))",
  urgent: "hsl(var(--urgent))",
  smoke: "hsl(var(--smoke))",
  ink: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--foreground) / 0.08)",
  card: "hsl(var(--card))",
};

export const fmtEuro = (n) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const fmtNum = (n, d = 0) =>
  new Intl.NumberFormat("nl-NL", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);

/** Tel op naar target bij mount. */
export function useCountUp(target, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/** Live waarde die drift binnen [min,max]. */
export function useLiveValue(initial = 50, { min = 0, max = 100, step = 4, ms = 1800 } = {}) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setV((c) => Math.max(min, Math.min(max, c + (Math.random() - 0.5) * step * 2)));
    }, ms);
    return () => clearInterval(id);
  }, [min, max, step, ms]);
  return v;
}

/** Vloeiend morphen naar target (ease-out cubic). */
export function useMorph(target, { duration = 800 } = {}) {
  const [v, setV] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = v;
    fromRef.current = from;
    startRef.current = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - startRef.current) / duration);
      setV(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return v;
}

/** Streaming serie — schuift links weg, nieuwe punt erbij. */
export function useLiveSeries(len = 40, { min = 0, max = 100, vol = 8, ms = 1200, seed } = {}) {
  const [data, setData] = useState(() =>
    Array.from({ length: len }, (_, i) => ({ i, v: seed ?? (min + max) / 2 }))
  );
  useEffect(() => {
    let last = seed ?? (min + max) / 2;
    const id = setInterval(() => {
      last = Math.max(min, Math.min(max, last + (Math.random() - 0.5) * vol * 2));
      setData((d) => [...d.slice(1), { i: d[d.length - 1].i + 1, v: last }]);
    }, ms);
    return () => clearInterval(id);
  }, [len, min, max, vol, ms, seed]);
  return data;
}

/** Forceer re-render op interval (timers, countdowns). */
export function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}