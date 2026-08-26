import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { calcPortfolio, fmtEuro } from "@/lib/financeUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const FORE = "hsl(var(--foreground))";

/** PortfolioBarsWidget — G·3:2·SPLIT (ThingsILike-stijl). Glass-shell = glass-2
 *  (zelfde als het paneel). Links 6 eigen ronde bars: breedte ∝ doel, hoogte ∝
 *  saldo (globaal genormaliseerd), met een glasmorphism-regendruppel erboven
 *  die de resterende-weg-naar-doel (of, bij overvulling, de buffer) toont.
 *  Tik een bar → fotokaart schuift links + rechts verschijnt het info-paneel.
 *  Fotokaart toont standaard alle 6 portefeuilles. */
export default function PortfolioBarsWidget({ portfolios, expenses, onOpenPortfolio }) {
  const { openModule } = usePanel();
  const [selectedId, setSelectedId] = useState(null);
  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);

  const rows = useMemo(() => active.map((p) => {
    const calc = calcPortfolio(p, expenses);
    const target = Math.max(Number(p.target_balance) || 0, 1);
    const cur = Math.max(Number(p.current_balance) || 0, 0);
    const remaining = Math.max(target - cur, 0);
    const glassAmount = cur < target ? remaining : (Number(p.desired_buffer) || 0);
    return { p, calc, target, cur, glassAmount };
  }), [active, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxScale = useMemo(() => Math.max(1, ...rows.map((r) => Math.max(r.target, r.cur))), [rows]);
  const bars = useMemo(() => rows.map((r) => ({
    ...r,
    trackPct: (r.target / maxScale) * 100,
    fillPct: (r.cur / maxScale) * 100,
    glassPct: (r.glassAmount / maxScale) * 100,
  })), [rows, maxScale]);

  const selected = bars.find((b) => b.p.id === selectedId) || null;

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden cursor-pointer" style={{ boxShadow: "-30px 34px 74px -24px rgba(0,0,0,0.52)" }} onClick={() => openModule("personaladmin")}>
      {/* glass-shell = glass-2 (zelfde kleur/rand als paneel) */}
      <div className="absolute inset-0 rounded-[28px] glass-2" />

      {/* LINKS: 6 portfolio bars (eigen ronde vormen, donkere tekst op licht glas) */}
      <AnimatePresence>
        {!selected && (
          <motion.div key="bars" className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mt-1.5">
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/70">Portefeuilles</h3>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-life-olive">{active.length} potjes</span>
            </div>
            <div className="flex-1 flex items-end gap-1.5 mt-3 min-h-0">
              {bars.map((b) => (
                <button key={b.p.id} onClick={(e) => { e.stopPropagation(); setSelectedId(b.p.id); }} className="flex flex-col items-center justify-end gap-1.5 h-full group" style={{ flexGrow: Math.max(b.target, 1), flexBasis: 0, minWidth: 14 }} title={`${b.p.name} · ${fmtEuro(b.cur)}`}>
                  <div className="relative w-full flex-1 flex items-end" style={{ minHeight: 10 }}>
                    {/* track (doel) */}
                    <div className="absolute left-0 right-0 bottom-0 rounded-full bg-foreground/[0.08]" style={{ height: `${Math.max(b.trackPct, 2)}%` }} />
                    {/* glasmorphism-regendruppel (resterend naar doel, of buffer bij overvulling) */}
                    {b.glassPct > 0.4 && (
                      <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ bottom: `${b.fillPct}%`, height: `${b.glassPct}%`, width: "62%", borderRadius: "50% 50% 38% 38%", background: "rgba(207,217,221,0.5)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }} />
                    )}
                    {/* vulling: hoeveel geld erin zit (portfolio-kleur) */}
                    <div className="relative w-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:brightness-105" style={{ height: `${Math.max(b.fillPct, 1.5)}%`, background: b.p.color || "hsl(var(--ridge))", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
                  </div>
                  <span className="text-[7px] uppercase tracking-[0.04em] text-foreground/45 truncate w-full text-center">{(b.p.name.split(" ")[0] || "").slice(0, 7)}</span>
                </button>
              ))}
            </div>
            <p className="text-[8px] uppercase tracking-[0.18em] text-foreground/40 mt-1.5">vulling = saldo · druppel = nog naar doel · tik → detail</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift links ↔ rechts; toont alle 6 portefeuilles */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[24px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.5), 12px 0 30px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        onClick={selected ? (e) => { e.stopPropagation(); setSelectedId(null); } : undefined}
      >
        <img src={PHOTO} alt="Portefeuilles" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.66), rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.26))" }} />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected.p.color || "hsl(var(--ridge))" }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{selected.p.category || "Portefeuille"}</span>
            </div>
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{selected.p.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">{fmtEuro(selected.cur)} / {fmtEuro(selected.p.target_balance || 0)}</p>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-[36px] leading-[0.8] font-display font-semibold tabular-nums">{Math.round((selected.cur / Math.max(selected.target, 1)) * 100)}<span className="text-[16px]">%</span></span>
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1">naar doel</p>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2 opacity-50">tik → terug</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">JE GELD, BESTEMD.</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{active.length} potjes · zie hoe vol</p>
            <div className="mt-auto space-y-1">
              {bars.map((b) => (
                <div key={b.p.id} className="flex items-center gap-2">
                  <span className="h-6 w-2 rounded-full shrink-0" style={{ background: b.p.color || "hsl(var(--ridge))", opacity: 0.4 + (b.fillPct / 100) * 0.6 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-display font-semibold leading-none truncate">{b.p.name}</p>
                    <p className="text-[8px] uppercase tracking-[0.12em] opacity-60 mt-0.5">{fmtEuro(b.cur)} · {Math.round((b.cur / Math.max(b.target, 1)) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: info-paneel bij selectie (naam staat op de foto, hier alleen details) */}
      <AnimatePresence>
        {selected && (
          <motion.div key="info" className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[24px] glass-2" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 p-4 flex flex-col text-foreground overflow-y-auto">
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/60">{selected.p.category}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Info label="Saldo" value={fmtEuro(selected.cur)} />
                <Info label="Doel" value={fmtEuro(selected.p.target_balance || 0)} />
                <Info label="Buffer" value={fmtEuro(selected.p.desired_buffer || 0)} />
                <Info label="Reservering/mnd" value={fmtEuro(selected.p.monthly_reservation_actual || 0)} />
                <Info label="Volgende betaling" value={fmtEuro(selected.calc.next_expected_payment)} />
                <Info label="Status" value={selected.calc.status} />
              </div>
              {selected.p.notes && <p className="text-[10px] text-foreground/70 leading-[1.5] mt-3">{selected.p.notes}</p>}
              <div className="mt-auto pt-3 space-y-2">
                <button onClick={() => onOpenPortfolio?.(selected.p)} className="w-full inline-flex items-center justify-center rounded-full bg-plum text-ivory px-3 py-2 text-xs font-semibold">Open portefeuille</button>
                <button onClick={() => openModule("personaladmin")} className="w-full inline-flex items-center justify-center rounded-full bg-foreground/[0.06] text-foreground px-3 py-2 text-xs font-semibold">Open in admin</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-foreground/[0.05] p-2">
      <p className="text-[8px] uppercase tracking-[0.14em] text-foreground/55">{label}</p>
      <p className="text-[12px] font-display font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}