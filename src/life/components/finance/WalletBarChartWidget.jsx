import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";

const HERO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
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
  voorzorg: "#d0d9dd",
};
const colorFor = (name) => {
  const k = String(name || "").toLowerCase();
  for (const key of Object.keys(NAME_COLOR)) if (k.includes(key)) return NAME_COLOR[key];
  return "#9c9c9c";
};
const isLight = (hex) => {
  const c = String(hex || "").replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

/**
 * WalletBarChartWidget — capsule-bars in vaste volgorde, hoogte proportioneel
 * met de huur (Wonen = 100%). Gekleurde capsule = huidig saldo; daarboven een
 * glazen capsule in een subtiele tint van de wallet die aanvult tot het doel,
 * met daarin hoeveel er nog nodig is. Verticaal bedrag onderaan, 180° gedraaid.
 */
export default function WalletBarChartWidget() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const [selectedId, setSelectedId] = useState(null);

  const wallets = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    const find = (key) => pots.find((p) => p.name.toLowerCase().includes(key));
    const list = ORDER.map((key) => {
      const p = find(key);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        color: p.color || colorFor(p.name),
        balance: p.current_balance || 0,
        buffer: p.desired_buffer || 0,
        target: p.target_balance || p.desired_buffer || p.current_balance || 0,
        raw: p,
      };
    }).filter(Boolean);
    return list;
  }, [portfolios]);

  // Schaal = Wonen (huur) = 100%.
  const scale = useMemo(() => {
    const wonen = wallets.find((w) => w.name.toLowerCase().includes("wonen"));
    return Math.max(1, wonen ? wonen.balance : Math.max(1, ...wallets.map((w) => Math.max(w.balance, w.target))));
  }, [wallets]);

  const selected = wallets.find((w) => w.id === selectedId) || null;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden glass-2">
      {/* LINKS: capsule BarChart */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="bars"
            className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10 overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[9px] uppercase tracking-[0.22em] text-foreground/55 font-medium">Wallets · t.o.v. huur</p>
            <div className="flex-1 flex items-end gap-[clamp(3px,0.5vw,7px)] mt-3 min-h-0 overflow-visible">
              {wallets.length === 0 && (
                <p className="text-[11px] text-foreground/40 self-center w-full text-center">No wallets yet.</p>
              )}
              {wallets.map((w) => {
                const balanceH = (w.balance / scale) * 100;
                const remaining = Math.max(0, w.target - w.balance);
                const glassH = w.target > w.balance ? (remaining / scale) * 100 : 0;
                const txt = isLight(w.color) ? "#1a1a1a" : "rgba(255,255,255,0.92)";
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedId(w.id)}
                    className="relative flex-1 h-full hover:opacity-90 transition min-w-0 overflow-visible"
                    title={w.name}
                  >
                    {/* glazen capsule — subtiele wallet-tint, aanvulling tot doel */}
                    {glassH > 1 && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
                        style={{
                          bottom: `calc(${balanceH}% + 2px)`,
                          width: "58%",
                          height: `${glassH}%`,
                          background: `${w.color}33`,
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: `1px solid ${w.color}66`,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                        }}
                      >
                        {glassH > 26 && (
                          <span
                            className="absolute bottom-1 left-1/2 -translate-x-1/2"
                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                          >
                            <span className="text-[8px] font-mono whitespace-nowrap" style={{ color: "rgba(0,0,0,0.55)" }}>{fmt(remaining)} left</span>
                          </span>
                        )}
                      </div>
                    )}
                    {/* gekleurde capsule — huidig saldo (proportioneel met huur) */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500 overflow-hidden"
                      style={{ width: "82%", height: `${balanceH}%`, background: w.color, boxShadow: "0 6px 16px -8px rgba(0,0,0,0.35)" }}
                    >
                      {balanceH > 15 && (
                        <span
                          className="absolute bottom-1 left-1/2 -translate-x-1/2"
                          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                        >
                          <span className="text-[9px] font-mono font-semibold tracking-tight whitespace-nowrap" style={{ color: txt }}>{fmt(w.balance)}</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-foreground/45 mt-2">tap a bar → detail</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — zelfde foto als linker PhotoCard */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[14px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.45), 12px 0 30px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22)" }}
        onClick={selected ? (e) => { e.stopPropagation(); setSelectedId(null); } : undefined}
      >
        <img src={HERO} alt="Wallets" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.34))" }} />
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: selected.color }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{selected.name}</span>
            </div>
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{fmt(selected.balance)}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">doel {selected.target > 0 ? fmt(selected.target) : "—"}</p>
            <p className="text-[8px] uppercase tracking-[0.2em] mt-auto opacity-50">tap → back</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold opacity-75">Legend</p>
            <h3 className="text-[18px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">Your wallets</h3>
            <div className="mt-auto space-y-1.5 max-h-[70%] overflow-hidden">
              {wallets.map((w) => (
                <div key={w.id} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: w.color }} />
                  <span className="text-[11px] font-medium truncate">{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: detail-paneel bij selectie (glas) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[14px] glass-3"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <WalletDetail wallet={selected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletDetail({ wallet }) {
  const reached = wallet.target > 0 && wallet.balance >= wallet.target;
  const remaining = wallet.target - wallet.balance;
  const surplus = wallet.balance - wallet.target;
  const pct = wallet.target > 0 ? Math.min(100, (wallet.balance / wallet.target) * 100) : 100;
  return (
    <div className="h-full p-4 flex flex-col text-foreground">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: wallet.color }} />
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{wallet.name}</span>
      </div>
      <h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.02em] mt-3">{fmt(wallet.balance)}</h3>
      <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mt-1">current balance</p>

      <div className="mt-5 space-y-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="uppercase tracking-[0.14em] opacity-60">Doel</span>
          <span className="font-medium">{wallet.target > 0 ? fmt(wallet.target) : "—"}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: wallet.color }} />
        </div>
        {wallet.target > 0 && (
          reached ? (
            <p className="text-[11px] opacity-80">Doel bereikt · <span className="font-semibold">{fmt(surplus)} over</span></p>
          ) : (
            <p className="text-[11px] opacity-80"><span className="font-semibold">{fmt(remaining)}</span> nog tot doel</p>
          )
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2 text-[10px] opacity-70">
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Buffer</span><span className="font-medium">{wallet.buffer > 0 ? fmt(wallet.buffer) : "—"}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Kind</span><span className="font-medium">{wallet.raw.kind || "—"}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Status</span><span className="font-medium">{wallet.raw.status || "—"}</span></div>
      </div>
    </div>
  );
}