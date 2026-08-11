import React, { useEffect, useState } from "react";
import CountUp from "@/components/widgets/CountUp";
import LayeredWidgetTile from "./LayeredWidgetTile";

const CIRC = 2 * Math.PI * 92; // r = 92

/**
 * StorageGauge — layered widget tile with the fill-ring gauge. Whole tile
 * clickable (opens the email module).
 */
export default function StorageGauge({ image, label, count, heading = "Inbox gesorteerd", percent = 0, detail = "", onClick }) {
  const [on, setOn] = useState(false);
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const offset = on ? CIRC * (1 - pct / 100) : CIRC;
  const rot = on ? pct * 3.6 : 0;

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <LayeredWidgetTile image={image} label={label} count={count} onClick={onClick}>
      <h3 className="sg-heading">{heading}</h3>
      <div className="flex justify-center">
        <div className="sg-dial" style={{ maxWidth: 220 }}>
          <svg className="sg-svg" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
            <circle className="sg-track-ring" cx="120" cy="120" r="92" />
            <circle className="sg-progress" cx="120" cy="120" r="92" transform="rotate(-90 120 120)" style={{ strokeDasharray: CIRC, strokeDashoffset: offset }} />
            <text className="sg-scale" x="120" y="58" textAnchor="middle" dominantBaseline="middle">0</text>
            <text className="sg-scale" x="182" y="120" textAnchor="middle" dominantBaseline="middle">25</text>
            <text className="sg-scale" x="120" y="182" textAnchor="middle" dominantBaseline="middle">50</text>
            <text className="sg-scale" x="58" y="120" textAnchor="middle" dominantBaseline="middle">75</text>
          </svg>
          <div className="sg-ticks" />
          <div className="sg-knob-track" style={{ transform: `rotate(${rot}deg)` }}>
            <div className="sg-knob" />
          </div>
        </div>
      </div>
      <div className="sg-readout">
        <span className="sg-value"><CountUp value={pct} duration={1600} />%</span>
        <span className="sg-detail">{detail}</span>
      </div>
    </LayeredWidgetTile>
  );
}