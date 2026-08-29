import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, ArrowUp, ArrowRight } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/097d5ac19_Make_editorial_fashion_photo_2K_202608281333.jpeg";
const IVORY = "hsl(var(--ivory))";

const DARK_GLASS = { background: "rgba(20,22,26,0.42)", backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY };
const DARK_POPOVER = { background: "rgba(20,22,26,0.78)", backdropFilter: "blur(22px) saturate(1.4)", WebkitBackdropFilter: "blur(22px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.20)", boxShadow: "0 24px 56px -18px rgba(0,0,0,0.6)" };

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
    <div className="relative flex-1 min-w-0" ref={ref}>
      {label && <p className="text-[7px] uppercase tracking-[0.22em] font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>}
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 w-full rounded-xl px-2 py-1.5 text-xs font-medium transition" style={DARK_GLASS}>
        {selected ? (
          <>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: selected.color || "#b1bec6" }} />
            <span className="truncate flex-1 text-left">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left opacity-60 truncate">{placeholder}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 opacity-70 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.16 }} className="absolute z-50 mb-1 right-0 bottom-full w-full min-w-[200px] rounded-xl p-1 max-h-56 overflow-y-auto no-scrollbar" style={DARK_POPOVER}>
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} className={`flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-xs text-left transition ${active ? "bg-white/15" : "hover:bg-white/10"}`} style={{ color: IVORY }}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: o.color || "#b1bec6" }} />
                  <span className="truncate flex-1 font-medium">{o.name}</span>
                  <span className="text-[10px] font-mono tabular-nums opacity-70">{fmtEuro(o.current_balance || 0)}</span>
                  {active && <Check className="w-3 h-3 shrink-0 opacity-80" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** MoveMeTransfer — editorial transfer-kaart. SHELL = full photo (geen donkere
 *  overlay). 1 grote BounceDot links, hoger geplaatst, horizontaal stuiterend.
 *  Onderste strook: 3 gelijke glazen pillen (van/naar/bedrag) + Move-knop.
 *  Keuzemenu's schuiven boven de widget uit (niet afgesneden door de shell). */
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
    <div className="relative w-full h-[210px] shrink-0 rounded-[22px]" style={{ boxShadow: "-16px 16px 44px -16px rgba(0,0,0,0.40)" }}>
      {/* SHELL — full photo (geen donkere overlay) */}
      <div className="absolute inset-0 rounded-[22px] overflow-hidden">
        <img src={PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <div className="absolute inset-0 rounded-[22px] pointer-events-none" style={{ background: "rgba(120,128,133,0.06)", border: "1px solid rgba(255,255,255,0.14)" }} />

      {/* 1 GROTE BOUNCEDOT — horizontaal stuiterend, links, hoger geplaatst */}
      <motion.div className="absolute left-10 z-10" style={{ top: "28%" }} animate={{ x: [-24, 24, -24] }} transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}>
        <span className="block rounded-full" style={{ width: 104, height: 104, background: `linear-gradient(135deg, ${from?.color || "#b1bec6"}, ${to?.color || "#d8dab3"})`, boxShadow: "0 0 30px rgba(0,0,0,0.55), inset 0 3px 0 rgba(255,255,255,0.32)" }} />
      </motion.div>

      {/* INVULSTROKEN op de shell — onderste helft (vervalt achter glaskaart wanneer kaart omlaag) */}
      <div className="absolute bottom-0 left-0 right-0 h-[105px] z-20 px-4 pt-2.5 pb-3 flex items-center gap-2" style={{ color: IVORY }}>
        <div className="w-[120px] shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <DarkWalletDropdown value={fromId} onChange={setFromId} options={active} placeholder="Van…" label="haal uit" />
          <DarkWalletDropdown value={toId} onChange={setToId} options={active} placeholder="Naar…" label="breng naar" />
          <div className="flex items-center rounded-xl pl-2.5 pr-1.5 py-1.5 flex-1 min-w-0" style={DARK_GLASS}>
            <span className="text-[10px] uppercase tracking-[0.16em] font-bold mr-1 opacity-70">€</span>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full bg-transparent text-sm font-display font-bold outline-none tabular-nums" style={{ color: IVORY }} />
          </div>
          <button onClick={transfer} disabled={busy || !canTransfer} className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-bold disabled:opacity-40 transition shrink-0" style={{ background: IVORY, color: "#2a2c30", boxShadow: "0 10px 24px -10px rgba(0,0,0,0.5)" }}>
            {busy ? "…" : <><ArrowRight className="w-3.5 h-3.5" />Move</>}
          </button>
        </div>
      </div>

      {/* SCHUIVENDE GLASKAART — half hoog, geen foto. "Move Me!" titel. tik → omhoog */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 bottom-0 h-[105px] rounded-[22px] overflow-hidden text-left block z-30"
        initial={false}
        animate={{ y: up ? "-100%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "rgba(20,22,26,0.22)", backdropFilter: "blur(6px) saturate(1.2)", WebkitBackdropFilter: "blur(6px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: up ? "0 14px 34px -10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)" : "0 -12px 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <div className="absolute inset-0 px-5 flex items-center justify-between" style={{ color: IVORY, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
          <div>
            <h3 className="font-display font-black tracking-[-0.04em] leading-[0.82]" style={{ fontSize: "clamp(28px, 2.6vw, 40px)" }}>Move Me!</h3>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-70 mt-1">{up ? "vul in ↓" : "tik om te verplaatsen"}</p>
          </div>
          <span className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <ArrowUp className={`w-4 h-4 transition-transform duration-500 ${up ? "rotate-180" : ""}`} />
          </span>
        </div>
      </motion.button>
    </div>
  );
}