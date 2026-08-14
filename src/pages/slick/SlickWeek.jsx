import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const WEEK = [
  { day: "Ma", date: 10, tasks: [] },
  { day: "Di", date: 11, tasks: [] },
  { day: "Wo", date: 12, tasks: [] },
  {
    day: "Do",
    date: 13,
    tasks: [
      { t: "Marktanalyse Q3 voorbereiden", time: "09:00 · 120min" },
      { t: "Klantgesprek Giulia", time: "11:30 · 60min" },
    ],
  },
  {
    day: "Vr",
    date: 14,
    tasks: [
      { t: "Identiteit-richting uitwerken", time: "10:00 · 90min" },
      { t: "Concept Brons review", time: "14:00 · 45min" },
    ],
  },
  {
    day: "Za",
    date: 15,
    tasks: [
      { t: "Concurrentieonderzoek notities", time: "08:30 · 75min" },
      { t: "Briefing wervingscampagne", time: "13:00 · 60min" },
    ],
  },
  { day: "Zo", date: 16, tasks: [{ t: "Marktonderzoek rapport opstellen", time: "09:30 · 150min" }] },
];

export default function SlickWeek() {
  return (
    <div>
      <Head title="Weekplanning" sub="10 augustus – 16 augustus 2026" tag="Planning" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WEEK.map((d) => (
          <div key={d.day + d.date} className="min-w-[170px] flex-1">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-slickstorm text-sm font-semibold">{d.day}</span>
              <span className="text-marble/50 text-xs tabular-nums">{d.date}</span>
            </div>
            <div className="space-y-2">
              {d.tasks.length === 0 && <p className="text-marble/40 text-xs">—</p>}
              {d.tasks.map((t) => (
                <div key={t.t} className="rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md p-3">
                  <p className="text-slickstorm text-xs font-medium leading-snug">{t.t}</p>
                  <p className="text-marble/60 text-[10px] mt-1 tabular-nums">{t.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}