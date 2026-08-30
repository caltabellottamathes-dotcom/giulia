import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";

const HERO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/097d5ac19_Make_editorial_fashion_photo_2K_202608281333.jpeg";
const EASE = [0.16, 1, 0.3, 1];
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

// Vaste volgorde + kleuren per portefeuille.
const ORDER = ["wonen", "gezondheid", "communicatie", "dagelijks leven", "mobiliteit", "voorzorg"];
const NAME_COLOR = {
  wonen: "#d8dab3",
  gezondheid: "#301728",
  communicatie: "#595c64",
  "dagelijks leven": "#abab69",
  mobiliteit: "#8b8471",
  voorzorg: "#d0d9dd"
};
const colorFor = (name) => {
  const k = String(name || "").toLowerCase();
  for (const key of Object.keys(NAME_COLOR)) if (k.includes(key)) return NAME_COLOR[key];
  return "#9c9c9c";
};

/**
 * WalletBarChartWidget — capsule-bars in vaste volgorde. Bar-hoogte = % naar
 * doel (100% = doel bereikt). Boven de gekleurde bar een transparante ghost-bar
 * die aangeeft hoeveel er nog nodig is tot het doel. Geen vaste 100%-vorm.
 */
export default function WalletBarChartWidget() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const [selectedId, setSelectedId] = useState(null);

  const wallets = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    const find = (key) => pots.find((p) => p.name.toLowerCase().includes(key));
    return ORDER.map((key) => {
      const p = find(key);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        color: p.color || colorFor(p.name),
        balance: p.current_balance || 0,
        doel1: p.target_balance || 0,
        doel2: p.desired_buffer || 0,
        buffer: p.desired_buffer || 0,
        target: p.target_balance || p.desired_buffer || p.current_balance || 0,
        raw: p
      };
    }).filter(Boolean);
  }, [portfolios]);

  const selected = wallets.find((w) => w.id === selectedId) || null;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden glass-2">
      <AnimatePresence>
        {!selected &&
        <motion.div
          key="bars"
          className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10 overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}>
            <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/55 font-medium">tap a bar → detail</p>
            <div className="flex-1 flex items-end gap-[clamp(3px,0.5vw,7px)] mt-7 min-h-0 overflow-visible">
              {wallets.length === 0 &&
            <p className="text-[11px] text-foreground/40 self-center w-full text-center">No wallets yet.</p>
            }
              {wallets.map((w) => {
                const doel1 = w.doel1 || w.target || 0;
                const doel2 = w.doel2 || 0;
                const scale = Math.max(doel1, doel2, 1);
                const noGoals = doel1 === 0 && doel2 === 0;
                const solidH = noGoals ? 100 : Math.max(0, Math.min((w.balance / scale) * 100, 100));
                const ghostH = Math.max(0, 100 - solidH);
                const doel1Pct = doel1 > 0 && doel2 > doel1 ? Math.min(100, (doel1 / scale) * 100) : null;
                const reachedDoel2 = doel2 > 0 && w.balance >= doel2;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedId(w.id)}
                    className="relative flex-1 h-full hover:opacity-90 transition min-w-0 overflow-visible"
                    title={w.name}>
                    {/* saldo label boven de gekleurde bar */}
                    {solidH > 3 && (
                      <span className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono font-semibold whitespace-nowrap z-20 text-black" style={{ bottom: `calc(${solidH}% + 3px)` }}>{fmt(w.balance)}</span>
                    )}
                    {/* ghost — hoeveel nog tot Doel 2 */}
                    {ghostH > 1 && (
                      <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ bottom: `calc(${solidH}% + 2px)`, width: "82%", height: `${ghostH}%`, background: `${w.color}1A`, border: `1px dashed ${w.color}55` }} />
                    )}
                    {/* Doel 1 marker line — waar dekking begint; alles erboven = buffer */}
                    {doel1Pct != null && (
                      <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ bottom: `${doel1Pct}%`, width: "92%" }}>
                        <div className="h-[2px] w-full" style={{ background: w.color, opacity: 0.9, boxShadow: "0 0 6px rgba(0,0,0,0.4)" }} />
                      </div>
                    )}
                    {/* gekleurde bar = voortgang naar Doel 2; boven Doel 1 = vooruit gespaard */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${reachedDoel2 ? "wallet-blink" : ""}`} style={{ width: "82%", height: `${solidH}%`, background: w.color, boxShadow: "0 14px 28px -12px rgba(0,0,0,0.45), 0 2px 6px -2px rgba(0,0,0,0.25)" }} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* FOTOKAART */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[14px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.45), 12px 0 30px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)" }}
        onClick={selected ? (e) => {e.stopPropagation();setSelectedId(null);} : undefined}>
        <img src={HERO} alt="Wallets" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.32), rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.10))" }} />
        {selected ?
        <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected.color }} />
              <span className="text-[11px] uppercase tracking-[0.18em] font-bold">{selected.raw?.kind || "pot"}</span>
            </div>
            <h3 className="text-[24px] leading-tight font-display font-semibold tracking-[-0.02em] mt-2">{selected.name}</h3>
            {selected.raw?.goal ? (
              <p className="text-[13px] mt-2 opacity-85 leading-snug">{selected.raw.goal}</p>
            ) : null}
            <p className="text-[9px] uppercase tracking-[0.2em] mt-auto opacity-55">tap → back</p>
          </div> :
        <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold opacity-75">Legend</p>
            <h3 className="text-[18px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">Your wallets</h3>
            <div className="mt-auto space-y-1.5 max-h-[70%] overflow-hidden">
              {wallets.map((w) =>
            <div key={w.id} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: w.color }} />
                  <span className="text-[11px] font-medium truncate">{w.name}</span>
                </div>
            )}
            </div>
          </div>
        }
      </motion.div>

      <AnimatePresence>
        {selected &&
        <motion.div
          key="detail"
          className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[14px]"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          onClick={(e) => e.stopPropagation()}>
            <WalletDetail wallet={selected} />
          </motion.div>
        }
      </AnimatePresence>
    </div>);
}

function WalletDetail({ wallet }) {
  const doel1 = wallet.doel1 || wallet.target || 0;
  const doel2 = wallet.doel2 || wallet.buffer || 0;
  const pct1 = doel1 > 0 ? Math.min(100, wallet.balance / doel1 * 100) : 100;
  const pct2 = doel2 > 0 ? Math.min(100, wallet.balance / doel2 * 100) : (wallet.balance > 0 ? 100 : 0);
  const overDoel1 = doel1 > 0 ? Math.max(0, wallet.balance - doel1) : 0;
  const reached1 = doel1 > 0 && wallet.balance >= doel1;
  const reached2 = doel2 > 0 && wallet.balance >= doel2;
  return (
    <div className="h-full p-4 flex flex-col text-foreground">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: wallet.color }} />
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{wallet.name}</span>
      </div>
      <h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.02em] mt-3">{fmt(wallet.balance)}</h3>
      <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mt-1">current balance</p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="uppercase tracking-[0.14em] opacity-60">Doel 1 · dekking</span>
            <span className="font-medium">{doel1 > 0 ? fmt(doel1) : "geen lasten"}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct1}%`, background: wallet.color }} />
          </div>
          {doel1 > 0 ? (reached1 ? <p className="text-[10px] opacity-80 mt-1">Doel 1 bereikt{overDoel1 > 0 ? ` · ${fmt(overDoel1)} vooruit` : ""}</p> : <p className="text-[10px] opacity-80 mt-1"><span className="font-semibold">{fmt(doel1 - wallet.balance)}</span> nog tot dekking</p>) : <p className="text-[10px] opacity-80 mt-1">Geen lasten · altijd dekking</p>}
        </div>
        {doel2 > 0 && (
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="uppercase tracking-[0.14em] opacity-60">Doel 2 · buffer</span>
              <span className="font-medium">{fmt(doel2)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct2}%`, background: "hsl(var(--giulia-urgent))" }} />
            </div>
            <p className="text-[10px] opacity-80 mt-1">{reached2 ? "Buffer bereikt · vooruit gespaard" : <><span className="font-semibold">{fmt(doel2 - wallet.balance)}</span> nog tot buffer</>}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2 text-[10px] opacity-70">
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Kind</span><span className="font-medium">{wallet.raw.kind || "—"}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Status</span><span className="font-medium">{wallet.raw.status || "—"}</span></div>
      </div>
    </div>);
}