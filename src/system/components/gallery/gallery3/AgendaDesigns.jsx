import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { accentVars } from "@/lib/widgetAccent2";
import { IMAGES } from "@/lib/images";

/* ANALYSE — Agenda: toon de eerstvolgende afspraak (tijd + titel), een
 * dag-tijdlijn 08–20 met markers, schakel vandaag/morgen.
 * D2 "Dagkolom" (3:5 portret) — tijd als ruimte: uren gestapeld, afspraken
 * steken als blokken op hun tijdstip uit de kolom, een 'nu'-lijn pulst.
 * D3 "Countdown + weekdots" (16:9) — links grote af Countdown tot volgende
 * afspraak; rechts 7-dagen densiteit. Focus: onmiddellijkheid + weekritme. */

const H = { start: 7, end: 22 };
const span = H.end - H.start;

export function AgendaDesign2() {
  const { data: events } = useEntityList("Event", { sort: "start" });
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const todayStr = now.toDateString();
  const todays = (events || []).filter((e) => new Date(e.start).toDateString() === todayStr)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const next = todays.find((e) => new Date(e.start) >= now) || todays[0];
  const nowPct = Math.max(0, Math.min(1, (now.getHours() + now.getMinutes() / 60 - H.start) / span));

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/5", ...accentVars("sand") }}>
      <div className="relative w-14 shrink-0 border-r border-ivory/10 flex flex-col text-ivory/45 text-[9px] tabular-nums">
        {Array.from({ length: span + 1 }).map((_, i) => (
          <span key={i} className="flex-1 flex items-center justify-center border-t border-ivory/5 first:border-t-0">{H.start + i}</span>
        ))}
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="absolute top-4 left-4 right-4 text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/70 z-10">What's Happening? · vandaag</div>
        {todays.map((e, i) => {
          const s = new Date(e.start); const en = new Date(e.end || e.start);
          const top = Math.max(0, (s.getHours() + s.getMinutes() / 60 - H.start) / span) * 100;
          const hgt = Math.max(3, ((en - s) / 3600000) / span) * 100;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="absolute left-3 right-3 rounded-xl px-3 py-2 text-ivory shadow" style={{ top: `${top}%`, height: `${hgt}%`, background: "var(--tile-accent)" }}>
              <p className="text-[11px] font-semibold leading-tight truncate">{e.title}</p>
              <p className="text-[9px] opacity-80 tabular-nums">{s.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
            </motion.div>
          );
        })}
        <motion.div className="absolute left-0 right-0 h-[2px] z-20" style={{ top: `${nowPct * 100}%`, background: "hsl(var(--destructive))" }}
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--destructive))" }} />
        </motion.div>
        {next && (
          <div className="absolute bottom-3 left-3 right-3 glass-1 rounded-xl px-3 py-2 text-ivory">
            <p className="text-[9px] uppercase tracking-wider opacity-55">Volgende</p>
            <p className="text-sm font-semibold truncate">{next.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AgendaDesign3() {
  const { data: events } = useEntityList("Event", { sort: "start" });
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t); }, []);
  const upcoming = (events || []).filter((e) => new Date(e.start) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));
  const next = upcoming[0];
  const mins = next ? Math.max(0, Math.round((new Date(next.start) - now) / 60000)) : null;
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); const ds = d.toDateString();
    return { d, count: (events || []).filter((e) => new Date(e.start).toDateString() === ds).length };
  });

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/9", ...accentVars("sand") }}>
      <img src={IMAGES.walkChairsBeach} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent" />
      <div className="relative flex-1 p-5 flex flex-col justify-center text-ivory min-w-0">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">What's Happening? · volgende</p>
        {next ? (
          <>
            <div className="flex items-baseline gap-2 mt-1">
              <motion.span key={mins} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-display font-bold leading-none tabular-nums">{mins}</motion.span>
              <span className="text-[11px] uppercase tracking-[0.2em] opacity-60">min</span>
            </div>
            <p className="text-sm font-semibold mt-1 truncate">{next.title}</p>
            <p className="text-[11px] opacity-60">{new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{next.location ? ` · ${next.location}` : ""}</p>
          </>
        ) : <p className="text-2xl font-display font-semibold opacity-70">Vrij vandaag</p>}
      </div>
      <div className="relative w-[42%] shrink-0 p-4 flex flex-col justify-center gap-1.5 text-ivory">
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">deze week</p>
        {days.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] w-6 opacity-60">{d.d.toLocaleDateString("nl-NL", { weekday: "narrow" })}</span>
            <div className="flex-1 flex gap-0.5">
              {Array.from({ length: Math.min(d.count, 6) }).map((_, j) => (
                <motion.span key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 + j * 0.03 }} className="h-1.5 flex-1 rounded-full" style={{ background: i === 0 ? "var(--tile-accent)" : "rgba(255,255,255,0.3)" }} />
              ))}
              {d.count === 0 && <span className="h-1.5 flex-1 rounded-full bg-ivory/10" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default { Design2: AgendaDesign2, Design3: AgendaDesign3 };