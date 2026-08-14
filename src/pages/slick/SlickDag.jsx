import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 → 19:00
const TASKS = [
  { start: 10, dur: 90, title: "Identiteit-richting uitwerken", ctx: "Identiteit" },
  { start: 14, dur: 45, title: "Concept Brons review", ctx: "Concept Brons" },
];
const ROW = 56;

export default function SlickDag() {
  return (
    <div>
      <Head title="Dagplanning" sub="donderdag 13 augustus" tag="Vandaag" />
      <div className="relative" style={{ height: HOURS.length * ROW }}>
        {HOURS.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: i * ROW }}>
            <span className="w-12 text-marble/50 text-[10px] tabular-nums">
              {String(h).padStart(2, "0")}:00
            </span>
            <div className="flex-1 h-px bg-marble/15" />
          </div>
        ))}
        {TASKS.map((t) => {
          const top = (t.start - 7) * ROW + 4;
          const h = (t.dur / 60) * ROW - 8;
          return (
            <div
              key={t.title}
              className="absolute left-12 right-2 rounded-xl border border-marble/40 bg-marble/25 backdrop-blur-md p-3"
              style={{ top, height: Math.max(h, 30) }}
            >
              <p className="text-slickstorm text-xs font-medium leading-snug">{t.title}</p>
              <p className="text-marble/70 text-[10px] mt-1">
                {String(t.start).padStart(2, "0")}:00 · {t.dur}min · {t.ctx}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}