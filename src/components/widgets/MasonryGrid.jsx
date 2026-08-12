import React, { useState, useLayoutEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * MasonryGrid — row-major masonry. Items flow in order (left→right, top→bottom)
 * and each new item drops into the currently-shortest column, so reading order
 * stays natural (unlike CSS columns, which fill one column top-to-bottom first).
 * Heights are measured in JS (ResizeObserver keeps it correct as content loads).
 */
export default function MasonryGrid({ children, className, gap = 16 }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [colW, setColW] = useState(null);
  const [positions, setPositions] = useState([]);
  const [height, setHeight] = useState(0);
  const items = React.Children.toArray(children);

  // Determine column width from container width.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const width = container.offsetWidth;
      if (!width) return;
      const cols = width < 640 ? 1 : width < 1024 ? 2 : 3;
      setColW((width - (cols - 1) * gap) / cols);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, [gap]);

  // Pack items into the shortest column.
  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container || colW == null) return;
    const cols = Math.max(1, Math.round((container.offsetWidth + gap) / (colW + gap)));
    const colHeights = new Array(cols).fill(0);
    const pos = items.map((_, i) => {
      const el = itemRefs.current[i];
      const h = el ? el.offsetHeight : 0;
      const c = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[c];
      colHeights[c] = top + h + gap;
      return { left: c * (colW + gap), top, width: colW };
    });
    setPositions(pos);
    setHeight(Math.max(0, Math.max(...colHeights) - gap));
  }, [colW, items.length, gap]);

  useLayoutEffect(() => { recompute(); }, [recompute]);

  // Re-measure when any item's content changes height.
  useLayoutEffect(() => {
    if (colW == null) return;
    const ro = new ResizeObserver(recompute);
    itemRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [colW, recompute]);

  // Catch async content loads shortly after mount.
  useLayoutEffect(() => {
    if (colW == null) return;
    const t1 = setTimeout(recompute, 250);
    const t2 = setTimeout(recompute, 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [colW, recompute]);

  const ready = positions.length === items.length && colW != null;

  return (
    <div ref={containerRef} className={cn("relative", className)} style={{ height: ready ? height : undefined }}>
      {items.map((child, i) => {
        const pos = positions[i];
        return (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className={cn("transition-[left,top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", !ready && "opacity-0")}
            style={pos
              ? { position: "absolute", left: pos.left, top: pos.top, width: pos.width }
              : { position: "absolute", left: 0, top: 0, width: colW || "100%" }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}