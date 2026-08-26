import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { calcPortfolio, fmtEuro } from "@/lib/financeUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const RIDGE = "#b1bec6";

/** PortfolioBarsWidget — 6 eigen ronde bars in een shell die dezelfde kleur
 *  en rand heeft als het paneel. Hoogte = saldo op een GLOBALE schaal (vergelijk-
 *  baar). Boven elke bar een glasmorphism-segment: nog-te-gaan tot het doel, óf
 *  (als saldo ≥ doel) de werkelijke buffer — altijd aanwezig, ook bij 0 saldo.
 *  Tik een bar → fotokaart schuift links + rechts verschijnt het info-paneel.
 *  Titel staat één keer (links); de fotokaart toont alle 6 portefeuilles. */
export default function PortfolioBarsWidget({ portfolios, expenses, onOpenPortfolio }) {
  const { openModule } = usePanel();
  const [selectedId, setSelectedId] = useState(null);
  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);

  const rows = useMemo(() => {
    const r = active.map((p) => {
      const calc = calcPortfolio(p, expenses);
      const cur = Math.max(Number(p.current_balance) || 0, 0);
      const target = Math.max(Number(p.target_balance) || 0, 0);
      const buf = Math.max(Number(p.desired_buffer) || 0, 0);
      // glas = nog-te-gaan tot doel; als saldo al ≥ doel → de werkelijke buffer
      const glassAmt = cur >= target ? buf : Math.max(0, target - cur);
      return { p, calc, cur, target, buf, glassAmt, toTarget: target > 0 ? Math.min(100, (cur / target) * 100) : 0 };
    });
    const maxVal = Math.max(1, ...r.map((x) => Math.max(x.cur, x.target, x.cur + x.glassAmt)));
    r.forEach((x) => { x.solidPct = (x.cur / maxVal) * 100; x.glassPct = (x.glassAmt / maxVal) * 100; });
    return r;
  }, [active, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = rows.find((r) => r.p.id === selectedId) || null;
  const shellStyle = { background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--foreground) / 0.12)" };

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden cursor-pointer" style={{ boxShadow: "-30px 34px 74px -24px rgba(0,0,0,0.42)" }} onClick={() => openModule("personaladmin")}>
      <div className="absolute inset-0 rounded-[28px]" style={shellStyle} />

      {/* LINKS: 6 portfolio bars */}
      <AnimatePresence>
        {!selected && (
          <motion.div key="bars" className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-bold text-foreground">Portefeuilles</h3>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground">{active.length} potjes</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 mt-3 min-h-0">
              {rows.map((r) => (
                <button key={r.p.id} onClick={(e) => { e.stopPropagation(); setSelectedId(r.p.id); }} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group" title={r.p.name}>
                  <div className="relative w-full flex-1 flex items-end" style={{ minHeight: 8 }}>
                    <div className="absolute inset-0 rounded-full bg-foreground/[0.06]" />
                    {/* glasmorphism: nog-te-gaan tot doel, óf buffer — altijd aanwezig */}
                    <div className="absolute left-0 right-0 rounded-full" style={{ bottom: `${r.solidPct}%`, height: `${r.glassPct}%`, background: "rgba(120,128,133,0.22)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)" }} />
                    {/* vulling = saldo (portfolio-kleur) */}
                    <div className="relative w-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:brightness-110" style={{ height: `${r.cur > 0 ? Math.max(r.solidPct, 1.5) : 0}%`, background: r.p.color || RIDGE, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
                  </div>
                  <span className="text-[7px] uppercase tracking-[0.04em] text-muted-foreground truncate w-full text-center">{(r.p.name.split(" ")[0] || "").slice(0, 6)}</span>
                </button>
              ))}
            </div>
            <p className="text-[8px] uppercase tracking-[0.18em] text-muted-foreground/70 mt-1.5">vulling = saldo · glas = buffer / nog te gaan</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift links ↔ rechts; toont alle 6 portefeuilles */}
      <motion.div className="absolute inset-y-0 z-20 overflow-hidden rounded-[24px]" initial={false} animate={{ left: selected ? "0%" : "50%" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.5), 12px 0 30px -14px rgba(0,0,0,0.5)" }} onClick={selected ? (e) => { e.stopPropagation(); setSelectedId(null); } : undefined}>
        <img src={PHOTO} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.3))" }} />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected.p.color || RIDGE }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{selected.p.category || "Portefeuille"}</span>
            </div>
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{selected.p.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">{fmtEuro(selected.cur)} / {fmtEuro(selected.target || 0)}</p>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-[36px] leading-[0.8] font-display font-semibold tabular-nums">{Math.round(selected.toTarget)}<span className="text-[16px]">%</span></span>
              <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-1">naar doel</p>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-2 opacity-50">tik → terug</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col text-ivory overflow-y-auto no-scrollbar" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <p className="text-[9px] uppercase tracking-[0.2em] font-semibold opacity-70 mb-2">Alle 6 portefeuilles</p>
            <div className="space-y-1.5">
              {rows.map((r) => (
                <div key={r.p.id} className="flex items-center gap-2">
                  <span className="h-7 w-2 rounded-full shrink-0" style={{ background: r.p.color || RIDGE, opacity: 0.45 + (r.toTarget / 100) * 0.55 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-display font-semibold leading-none truncate">{r.p.name}</p>
                    <p className="text-[8px] uppercase tracking-[0.14em] opacity-60 mt-1">{fmtEuro(r.cur)} · {Math.round(r.toTarget)}% naar doel</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: info-paneel bij selectie (wit, past bij shell) */}
      <AnimatePresence>
        {selected && (
          <motion.div key="info" className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[24px]" style={{ background: "hsl(var(--warm-white))", borderLeft: "1px solid hsl(var(--foreground) / 0.12)" }} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 p-4 flex flex-col text-foreground overflow-y-auto">
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">{selected.p.category}</p>
              <h3 className="text-[16px] font-display font-semibold mt-1">{selected.p.name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Info label="Saldo" value={fmtEuro(selected.cur)} />
                <Info label="Doel" value={fmtEuro(selected.target || 0)} />
                <Info label="Buffer" value={fmtEuro(selected.buf || 0)} />
                <Info label="Reservering/mnd" value={fmtEuro(selected.p.monthly_reservation_actual || 0)} />
                <Info label="Volgende betaling" value={fmtEuro(selected.calc.next_expected_payment)} />
                <Info label="Status" value={selected.calc.status} />
              </div>
              {selected.p.notes && <p className="text-[10px] text-muted-foreground leading-[1.5] mt-3">{selected.p.notes}</p>}
              <div className="mt-auto pt-3 space-y-2">
                <button onClick={() => onOpenPortfolio?.(selected.p)} className="w-full inline-flex items-center justify-center rounded-full bg-plum text-ivory px-3 py-2 text-xs font-semibold">Open portefeuille</button>
                <button onClick={() => openModule("personaladmin")} className="w-full inline-flex items-center justify-center rounded-full bg-foreground/10 text-foreground px-3 py-2 text-xs font-semibold">Open in admin</button>
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
    <div className="rounded-lg bg-foreground/[0.04] p-2">
      <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-[12px] font-display font-semibold tabular-nums mt-0.5 text-foreground">{value}</p>
    </div>
  );
}