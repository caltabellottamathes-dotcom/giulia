import React from "react";

/** SVG-wiskunde helpers + herbruikbare mini-visuals voor de graph-gallery. */

export function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function pts(data, w, h, pad = 3) {
  if (!data.length) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  return data.map((v, i) => ({
    x: pad + (i / (data.length - 1 || 1)) * (w - 2 * pad),
    y: h - pad - ((v - min) / rng) * (h - 2 * pad),
  }));
}

export function linePath(p) {
  return p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
}

export function areaPath(p, h) {
  if (!p.length) return "";
  return `${linePath(p)} L${p[p.length - 1].x.toFixed(1)} ${h} L${p[0].x.toFixed(1)} ${h} Z`;
}

export function Sparkline({ data, w = 90, h = 24, stroke = "hsl(var(--olive))", fill, strokeWidth = 1.6 }) {
  const p = pts(data, w, h, 2);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {fill && <path d={areaPath(p, h)} fill={fill} opacity={0.16} />}
      <path d={linePath(p)} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniBars({ data, w = 100, h = 40, color = "hsl(var(--olive))" }) {
  const max = Math.max(...data, 1);
  const bw = w / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => (
        <rect key={i} x={i * bw + 1} y={h - (v / max) * h} width={bw - 2} height={(v / max) * h} rx={1.5} fill={color} opacity={0.4 + (v / max) * 0.6} />
      ))}
    </svg>
  );
}