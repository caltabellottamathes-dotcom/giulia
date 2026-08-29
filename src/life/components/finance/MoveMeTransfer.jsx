import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, ArrowUp, ArrowRight } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/4ff91851b_Man_in_motion_2K_202608281637.jpeg";
const IVORY = "hsl(var(--ivory))";

// Donkere glas-morphism dropdown — voor op de foto.
const DARK_GLASS = { background: "rgba(20,22,26,0.42)", backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY };
const DARK_POPOVER = { background: "rgba(20,22,26,0.72)", backdropFilter: "blur(22px) saturate(1.4)", WebkitBackdropFilter: "blur(22px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.20)", boxShadow: "0 24px 56px -18px rgba(0,0,0,0.6)" };

function DarkWalletDropdown({ value, onChange, options, placeholder, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value) || null;
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative w-full" ref={ref}>
      {label && <p className="text-[8px] uppercase tracking-[0.22em] font-bold mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</p>}
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 w-full rounded-2xl px-3 py-2 text-sm font-medium transition" style={DARK_GLASS}>
        {selected ? (
          <>
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selected.color || "#b1bec6" }} />
            <span className="truncate flex-1 text-left">{selected.name}</span>
            <span className="text-[10px] font-mono tabular-nums shrink-0 opacity-70">{fmtEuro(selected.current_balance || 0)}</span>
          </>
        ) : (
          <span className="flex-1 text-left opacity-60">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform shrink-0 opacity-70 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }} className="absolute z-50 mt-1.5 right-0 w-full min-w-[210px] rounded-2xl p-1.5 max-h-64 overflow-y-auto no-scrollbar" style={DARK_POPOVER}>
            {options.length === 0 && <p className="px-2.5 py-2 text-sm opacity-60">Geen wallets</p>}
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-1.5 text-sm text-left transition ${active ? "bg-white/15" : "hover:bg-white/10"}`} style={{ color: IVORY }}>
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: o.color || "#b1bec6" }} />
                  <span className="truncate flex-1 font-medium">{o.name}</span>
                  <span className="text-[11px] font-mono tabular-nums opacity-70">{fmtEuro(o.current_balance || 0)}</span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** MoveMeTransfer — editorial transfer-kaart geïnspireerd op WhatsForDinner:
 *  GlassShell met foto, schuivende glazen PhotoCard met titel "Move Me!".
 *  Links achter het glas 3 grote BounceDots (kleur = from/to wallet). Rechts
 *  editorial: from-wallet bovenop de kaart; tik kaart → schuift omhoog → vul
 *  to-wallet + bedrag in → Transfer. Wordt gelogd (Transaction) + opgeslagen. */
export default function MoveMeTransfer() {
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { toast } = useToast();
  const active = useMemo(() => (portfolios || []).filter((p) => !p.archived && p.active !== false), [portfolios]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);

  const from = active.find((p) => p.id === fromId);
  const to = active.find((p) => p.id === toId);
  const canTransfer = !!from && !!to && from.id !== to.id && Number(amount) > 0;

  const fromC = from?.color || "#b1bec6";
  const toC = to?.color || "#d8dab3";
  // 3 dot-kleuren: from, gemiddelde, to
  const dotColors = [fromC, "#9aa1a6", toC];

  const transfer = async () => {
    if (!canTransfer) return;
    const amt = Number(amount);
    setBusy(true);
    try {
      await base44.entities.Transaction.create({ portfolio_id: to.id, type: "transfer", amount: amt, status: "completed", date: new Date().toISOString().slice(0, 10), note: `Move Me · van ${from.name} naar ${to.name}` });
      await base44.entities.Portfolio.update(from.id, { current_balance: (Number(from.current_balance) || 0) - amt });
      await base44.entities.Portfolio.update(to.id, { current_balance: (Number(to.current_balance) || 0) + amt });
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
      toast({ title: "Move Me voltooid", description: `${fmtEuro(amt)} van ${from.name} naar ${to.name}` });
      setAmount(""); setUp(false);
    } catch {
      toast({ title: "Transfer mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative w-full h-[200px] shrink-0 rounded-[22px] overflow-hidden" style={{ boxShadow: "-16px 16px 44px -16px rgba(0,0,0,0.40)" }}>
      {/* foto + donkere gradient (achter glas) */}
      <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.72), rgba(20,22,26,0.46) 55%, rgba(20,22,26,0.66))" }} />
      {/* glass shell over de foto */}
      <div className="absolute inset-0 rounded-[22px]" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(10px) saturate(1.3)", WebkitBackdropFilter: "blur(10px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.16)" }} />

      {/* ONDERSTE PANEEL (to + bedrag + transfer) — verborgen achter kaart, verschijnt wanneer kaart omhoog schuift */}
      <div className="absolute bottom-0 left-0 right-0 h-[112px] z-20 px-4 pt-2.5 pb-3 flex items-center gap-3" style={{ color: IVORY }}>
        {/* links: 3 grote BounceDots */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {dotColors.map((c, i) => (
            <span key={i} className="ontwerp-dot-bounce block rounded-full" style={{ width: 16, height: 16, background: c, animationDelay: `${i * 0.18}s`, boxShadow: "0 0 10px rgba(0,0,0,0.45)" }} />
          ))}
        </div>
        {/* rechts: to + bedrag + transfer */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="flex-1 min-w-[120px]"><DarkWalletDropdown value={toId} onChange={setToId} options={active} placeholder="Naar wallet…" /></div>
          <div className="flex items-center rounded-2xl pl-3 pr-2 py-2 shrink-0" style={DARK_GLASS}>
            <span className="text-[11px] uppercase tracking-[0.16em] font-bold mr-1 opacity-70">€</span>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-16 bg-transparent text-sm font-display font-bold outline-none tabular-nums" style={{ color: IVORY }} />
          </div>
          <button onClick={transfer} disabled={busy || !canTransfer} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold disabled:opacity-40 transition shrink-0" style={{ background: IVORY, color: "#2a2c30", boxShadow: "0 10px 24px -10px rgba(0,0,0,0.5)" }}>
            {busy ? "…" : <><ArrowRight className="w-3.5 h-3.5" />Move</>}
          </button>
        </div>
      </div>

      {/* SCHUIVENDE GLAZEN PHOTOKAART — "Move Me!" titel + from-wallet; schuift omhoog bij tik */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-full rounded-[22px] overflow-hidden text-left block z-30"
        initial={false}
        animate={{ y: up ? "-56%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: up ? "0 14px 34px -10px rgba(0,0,0,0.55)" : "0 -12px 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <img src={PHOTO} alt="Move Me" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.78), rgba(20,22,26,0.30) 55%, rgba(20,22,26,0.45))" }} />
        <div className="absolute inset-0" style={{ background: "rgba(120,128,133,0.12)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.16)" }} />

        <div className="absolute inset-0 p-4 flex flex-col justify-between" style={{ color: IVORY, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
          {/* boven: from-wallet rechts editorial */}
          <div className="flex justify-end">
            <div className="w-[46%]"><DarkWalletDropdown value={fromId} onChange={setFromId} options={active} placeholder="Van wallet…" label="haal uit" /></div>
          </div>
          {/* onder: titel "Move Me!" */}
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-display font-black tracking-[-0.04em] leading-[0.85]" style={{ fontSize: "clamp(28px, 2.6vw, 40px)" }}>Move Me!</h3>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mt-1.5">{up ? "vul in waar heen ↓" : "tik om te verplaatsen"}</p>
            </div>
            <span className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <ArrowUp className={`w-4 h-4 transition-transform duration-500 ${up ? "rotate-180" : ""}`} />
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}