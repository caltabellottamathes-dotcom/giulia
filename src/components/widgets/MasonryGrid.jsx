import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * MasonryGrid — row-major masonry with variable column spans. Items flow in
 * order (left→right, top→bottom); each item drops into the position that keeps
 * the layout shortest, and items may span more than one column for width
 * variation. Heights are measured in JS (ResizeObserver keeps it correct as
 * content loads). Pass a `spans` array (one number per child) to vary widths.
 */
export default function MasonryGrid({ children, className, gap = 16, spans, scale = 1 }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const spansRef = useRef(spans);
  spansRef.current = spans;
  const [cols, setCols] = useState(0);
  const [colW, setColW] = useState(null);
  const [positions, setPositions] = useState([]);
  const [height, setHeight] = useState(0);
  const items = React.Children.toArray(children);
  const spansKey = (spans || []).join(",");

  const spanFor = (i, c) => {
    const s = Number.isFinite(spansRef.current?.[i]) ? spansRef.current[i] : 1;
    return Math.max(1, Math.min(s, c || 1));
  };

  // Determine column count + single-column width from container width.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const width = container.offsetWidth;
      if (!width) return;
      const c = width < 640 ? 1 : width < 1024 ? 2 : width < 1280 ? 4 : 5;
      setCols(c);
      setColW((width - (c - 1) * gap) / c);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [gap]);

  // Pack items into the shortest position, honoring each item's span.
  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container || colW == null || cols < 1) return;
    const step = colW + gap;
    const colHeights = new Array(cols).fill(0);
    const pos = items.map((_, i) => {
      const el = itemRefs.current[i];
      const h = el ? el.offsetHeight : 0;
      const span = spanFor(i, cols);
      let bestC = 0, bestTop = Infinity;
      for (let c = 0; c <= cols - span; c++) {
        const top = Math.max(...colHeights.slice(c, c + span));
        if (top < bestTop) { bestTop = top; bestC = c; }
      }
      const left = bestC * step;
      const width = span * colW + (span - 1) * gap;
      for (let k = bestC; k < bestC + span; k++) colHeights[k] = bestTop + h + gap;
      return { left, top: bestTop, width };
    });
    setPositions(pos);
    setHeight(Math.max(0, Math.max(...colHeights) - gap));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colW, cols, items.length, gap]);

  useLayoutEffect(() => { recompute(); }, [recompute, spansKey]);

  // Re-measure when any item's content changes height.
  useLayoutEffect(() => {
    if (cols < 1) return;
    const ro = new ResizeObserver(recompute);
    itemRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [cols, recompute]);

  // Catch async content loads shortly after mount.
  useLayoutEffect(() => {
    if (colW == null) return;
    const t1 = setTimeout(recompute, 250);
    const t2 = setTimeout(recompute, 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [colW, recompute]);

  const ready = positions.length === items.length && colW != null;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        height: ready ? height * scale : undefined,
        ...(scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: "top left" } : {}),
      }}
    >
      {items.map((child, i) => {
        const pos = positions[i];
        const span = spanFor(i, cols);
        const initWidth = colW != null ? span * colW + (span - 1) * gap : "100%";
        return (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={cn("transition-[left,top,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", !ready && "opacity-0")}
            style={pos
              ? { position: "absolute", left: pos.left, top: pos.top, width: pos.width }
              : { position: "absolute", left: 0, top: 0, width: initWidth }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}