import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * MasonryGrid — row-major masonry with variable column spans. Items flow in
 * order (left→right, top→bottom); each item drops into the position that keeps
 * the layout shortest, and items may span more than one column for width
 * variation. Heights are measured in JS (ResizeObserver keeps it correct as
 * content loads). Pass a `spans` array (one number per child) to vary widths.
 */
export default function MasonryGrid({ children, className, gap = 16, spans, scale = 1, columnTiers, fitHeight }) {
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
      const TIERS = columnTiers || [[0, 1], [640, 2], [1024, 4], [1280, 5]];
      let c = TIERS[0][1];
      for (const [minW, cols] of TIERS) if (width >= minW) c = cols;
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
    const t = setTimeout(recompute, 250);
    return () => clearTimeout(t);
  }, [colW, recompute]);

  const ready = positions.length === items.length && colW != null;
  // fitHeight: schaal het hele grid af zodat het in de viewport-hoogte past
  // (geen scroll op desktop). effScale wordt nooit groter dan de opgegeven scale.
  const effScale = fitHeight != null && height > 0 ? Math.min(scale, fitHeight / height) : scale;

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        height: ready ? height * effScale : undefined,
        ...(effScale !== 1 ? { transform: `scale(${effScale})`, transformOrigin: "top left" } : {}),
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
            className={cn(colW == null && "opacity-0", !pos && "opacity-0")}
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