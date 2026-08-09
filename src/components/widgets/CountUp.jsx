import React, { useEffect, useRef, useState } from "react";

/**
 * CountUp — animates a number from its previous value up to `value` on mount
 * and whenever `value` changes. Motion = change (one purposeful animation).
 */
export default function CountUp({ value = 0, duration = 900, className }) {
  const [n, setN] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    const target = +value || 0;
    let raf;
    const start = performance.now();
    const from = ref.current;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(from + (target - from) * eased);
      setN(cur);
      ref.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{n}</span>;
}