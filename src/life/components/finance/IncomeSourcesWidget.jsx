import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";


const EASE = [0.16, 1, 0.3, 1];
const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const PISTACHIO = "#d8dab3";   // Whipped Pistachio achtergrond
const DOT = "#595c64";          // donkere BounceDot op pistache
const DAY = 86400000;

const STATUS_LABEL = { expected: "Verwacht", received: "Ontvangen", partial: "Gedeeltelijk", missed: "Gemist" };

/** IncomeSourcesWidget — de 'inkomstenbronnen widget' op de Inkomen-tab.
 *  Links: glazen horizontale pillen — 2 vaste inkomsten + éénmalige inkomsten
 *  (onderling), plus een 3e pil als knop om een eenmalige bron toe te voegen
 *  (opent de editor). Rechts: een fotokaart met Whipped-Pistachio achtergrond,
 *  een grote BounceDot en een glaskaart die er half overheen ligt met een ghost
 *  aftelklok (enkel dagen, grote typografie) tot het volgende verwachte inkomen.
 *  Tik een bron → de fotokaart schuift links en rechts verschijnt alle info/data
 *  van die inkomstenbron. */
export default function IncomeSourcesWidget() {
  const { data: incomes } = useEntityList("Income", { limit: 200, realtime: true });
  const [selectedId, setSelectedId] = useState(null);
  const openStage = (id) => window.dispatchEvent(new CustomEvent("giulia:open-income-stage", { detail: id }));
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);

  const list = incomes || [];
  const fixed = useMemo(() => list.filter((i) => i.recurring).sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0)).slice(0, 2), [list]);
  const oneTime = useMemo(() => list.filter((i) => !i.recurring).slice(0, 6), [list]);
  const selected = list.find((i) => i.id === selectedId) || null;

  // Ghost dagen tot het dichtstbijzijnde verwachte inkomen.
  const days = useMemo(() => {
    const fut = list.filter((i) => i.expected_date).map((i) => new Date(i.expected_date + "T00:00:00").getTime()).filter((d) => d >= now).sort((a, b) => a - b);
    if (!fut.length) return null;
    return Math.floor((fut[0] - now) / DAY);
  }, [list, now]);
  const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");


  const del = async (i) => { try { await base44.entities.Income.delete(i.id); } catch {} };

  const Pill = ({ income, active }) => (
    <button
      onClick={() => setSelectedId(active ? null : income.id)}
      className={`w-full glass-1 rounded-full pl-4 pr-3 py-2.5 flex items-center justify-between gap-2 transition ${active ? "ring-2 ring-foreground/25" : "hover:bg-white/15"}`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: income.recurring ? "hsl(var(--life-olive))" : "hsl(var(--life-ridge))" }} />
        <span className="text-[13px] font-display font-semibold truncate" style={{ color: INK }}>{income.description || income.category || "Inkomen"}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>{income.recurring ? FREQ_LABELS[income.frequency] || "Vast" : "1×"}</span>
        <span className="text-[13px] font-display font-bold tabular-nums" style={{ color: INK }}>{fmtEuro(income.amount)}</span>
      </span>
    </button>
  );

  return (
    <div className="relative w-full h-[380px] rounded-[28px] overflow-hidden" style={{ background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      {/* LINKS — pillen */}
      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: INK }}>Inkomstenbronnen.</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: MUTED }}>{list.length}</span>
        </div>
        <div className="flex-1 min-h-0 flex flex-col gap-2 justify-end overflow-y-auto no-scrollbar">
          {fixed.map((i) => <Pill key={i.id} income={i} active={selectedId === i.id} />)}
          {oneTime.map((i) => <Pill key={i.id} income={i} active={selectedId === i.id} />)}
          {/* 3e pil — knop voor eenmalige inkomsten */}
          <button
            onClick={() => openStage("new")}
            className="w-full rounded-full pl-4 pr-3 py-2.5 flex items-center justify-center gap-2 border border-dashed border-foreground/25 hover:bg-foreground/[0.04] transition"
          >
            <Plus className="w-3.5 h-3.5" style={{ color: INK }} />
            <span className="text-[12px] font-display font-semibold" style={{ color: INK }}>Eenmalige inkomsten</span>
          </button>
        </div>
      </div>

      {/* RECHTS — fotokaart (pistache + BounceDot + glas met ghost dagen) */}
      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        {/* detail paneel achter — alle info/data van de geselecteerde bron */}
        <AnimatePresence>
          {selected && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0" style={{ background: INK }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.28), rgba(0,0,0,0.58))" }} />
              <div className="relative h-full flex flex-col p-4 text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-white/90"><ArrowLeft className="h-3 w-3" /> dicht</button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openStage(selected.id)} className="h-7 w-7 rounded-full bg-white/12 flex items-center justify-center hover:bg-white/20 transition"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { del(selected); setSelectedId(null); }} className="h-7 w-7 rounded-full bg-white/12 flex items-center justify-center hover:bg-white/20 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <h3 className="text-[16px] font-display font-bold leading-tight truncate mt-2">{selected.description || selected.category || "Inkomen"}</h3>
                <div className="mt-3">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Bedrag</p>
                  <p className="text-[30px] leading-none font-display font-bold tabular-nums">{fmtEuro(selected.amount)}</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Frequentie</p>
                    <p className="text-[12px] font-display font-bold leading-none mt-0.5">{selected.recurring ? (FREQ_LABELS[selected.frequency] || "—") : "Eenmalig"}</p>
                  </div>
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Status</p>
                    <p className="text-[12px] font-display font-bold leading-none mt-0.5">{STATUS_LABEL[selected.status] || selected.status || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Verwacht op</p>
                    <p className="text-[12px] font-display font-bold leading-none mt-0.5">{selected.expected_date ? new Date(selected.expected_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
                  </div>
                  <div className="rounded-lg bg-white/15 px-2 py-1.5">
                    <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Ontvangen</p>
                    <p className="text-[12px] font-display font-bold tabular-nums leading-none mt-0.5">{selected.received_amount != null ? fmtEuro(selected.received_amount) : "—"}</p>
                  </div>
                  {selected.category && (
                    <div className="rounded-lg bg-white/15 px-2 py-1.5 col-span-2">
                      <p className="text-[8px] uppercase tracking-[0.14em] text-white/65">Categorie</p>
                      <p className="text-[12px] font-display font-bold leading-none mt-0.5">{selected.category}</p>
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-white/80">
                  <span className="uppercase tracking-[0.14em]">Bron</span>
                  <span className="font-display font-bold">{selected.recurring ? "Vast" : "Eenmalig"}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* fotokaart laag boven — pistache + BounceDot + glas met ghost dagen; schuift links weg bij selectie */}
        <motion.div className="absolute inset-0" animate={{ x: selectedId ? "-102%" : "0%" }} transition={{ duration: 0.55, ease: EASE }}>
          <div className="absolute inset-0" style={{ background: PISTACHIO }} />
          {/* grote BounceDot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bounce-hard rounded-full" style={{ width: "56%", aspectRatio: "1 / 1", background: DOT, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.40)" }} />
          </div>
          <p className="absolute top-3 left-3 z-30 text-[10px] uppercase tracking-[0.2em] font-light" style={{ color: "rgba(40,42,46,0.7)" }}>Volgende inkomen</p>
          {/* glaskaart — onderste 2/3, half overheen de dot */}
          <div className="absolute left-0 right-0 bottom-0 overflow-hidden rounded-b-[28px]" style={{ top: "33.33%", background: "rgba(118,118,118,0.28)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 -18px 40px -16px rgba(0,0,0,0.45)" }}>
            <p className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] text-white/70" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>Dagen tot inkomen</p>
            <span className="absolute font-display font-bold leading-none select-none pointer-events-none" style={{ fontSize: "clamp(110px, 17vw, 220px)", color: "rgba(255,255,255,0.5)", letterSpacing: "-0.06em", right: "-2%", bottom: "-22%" }}>
              {days == null ? "—" : pad2(days)}
            </span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}