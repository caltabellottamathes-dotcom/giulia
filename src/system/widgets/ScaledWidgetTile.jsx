import React, { useLayoutEffect, useRef, useState } from "react";

/** ScaledWidgetTile — plaatst een widget in een shell met een vaste aspect-ratio
 *  en SCHAALT de hele widget (object-fit: contain) zodat de volledige widget
 *  zichtbaar is in de shell, ongeacht de verhouding. De widget wordt op zijn
 *  natuurlijke design-breedte gerenderd, gemeten, en via transform geschaald
 *  én gecentreerd in de shell. */
const DESIGN_W = 380;

export default function ScaledWidgetTile({ ratio, label, children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [tf, setTf] = useState("scale(0.25)");

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const compute = () => {
      const bw = outer.clientWidth;
      const bh = outer.clientHeight;
      const iw = inner.offsetWidth || DESIGN_W;
      const ih = inner.offsetHeight || 1;
      if (!bw || !bh || !ih) return;
      const s = Math.min(bw / iw, bh / ih);
      const tx = (bw - iw * s) / 2;
      const ty = (bh - ih * s) / 2;
      setTf(`translate(${tx}px, ${ty}px) scale(${s})`);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-[260px] sm:w-[300px] shrink-0">
      <div ref={outerRef} className="relative w-full overflow-hidden rounded-2xl border border-foreground/10 bg-warm-white shadow-[0_18px_40px_-22px_rgba(0,0,0,0.35)]" style={{ aspectRatio: ratio }}>
        <div ref={innerRef} style={{ width: DESIGN_W, position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: tf }}>
          {children}
        </div>
        <span className="absolute top-2 left-2 z-10 rounded-full bg-foreground/80 text-ivory text-[9px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 pointer-events-none">{label}</span>
      </div>
    </div>
  );
}