import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";

const HERO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const EASE = [0.16, 1, 0.3, 1];
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

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

/**
 * WalletBarChartWidget — glazen widget-shell (glas-2) met capsule-bars links +
 * fotokaart rechts (zelfde foto als linker PhotoCard). Elke bar = een
 * portefeuille. De gekleurde capsule = huidig saldo; daarboven een glazen
 * capsule die aanvult tot de hoogte die nodig is om de buffer te halen.
 * Kleuren = vaste portefeuille-kleuren.
 */
export default function WalletBarChartWidget() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const [selectedId, setSelectedId] = useState(null);

  const wallets = useMemo(() => {
    return (portfolios || [])
      .filter((p) => p.active !== false && !p.archived)
      .sort((a, b) => (b.current_balance || 0) - (a.current_balance || 0))
      .map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color || colorFor(p.name),
        balance: p.current_balance || 0,
        buffer: p.desired_buffer || 0,
        reservation: p.monthly_reservation_actual || 0,
        raw: p,
      }));
  }, [portfolios]);

  // 100% hoogte = de grootste (saldo of buffer) over alle wallets.
  const scale = useMemo(
    () => Math.max(1, ...wallets.map((w) => Math.max(w.balance, w.buffer))),
    [wallets]
  );

  const selected = wallets.find((w) => w.id === selectedId) || null;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden glass-2">
      {/* LINKS: capsule BarChart */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="bars"
            className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[9px] uppercase tracking-[0.22em] text-foreground/55 font-medium">Wallets · balance vs buffer</p>
            <div className="flex-1 flex items-end gap-[clamp(3px,0.5vw,7px)] mt-3 min-h-0">
              {wallets.length === 0 && (
                <p className="text-[11px] text-foreground/40 self-center w-full text-center">No wallets yet.</p>
              )}
              {wallets.map((w) => {
                const balanceH = (w.balance / scale) * 100;
                const gap = Math.max(0, w.buffer - w.balance);
                const glassH = w.buffer > 0 ? (gap / scale) * 100 : 0;
                const reached = w.buffer > 0 && w.balance >= w.buffer;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedId(w.id)}
                    className="relative flex-1 h-full hover:opacity-90 transition min-w-0"
                    title={w.name}
                  >
                    {/* glazen capsule — aanvulling tot buffer (bovenop gekleurde bar) */}
                    {glassH > 0 && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                          bottom: `calc(${balanceH}% + 2px)`,
                          width: "58%",
                          height: `${glassH}%`,
                          background: "rgba(255,255,255,0.22)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.45)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
                        }}
                      />
                    )}
                    {/* gekleurde capsule — huidig saldo */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500"
                      style={{
                        width: "82%",
                        height: `${balanceH}%`,
                        background: w.color,
                        boxShadow: "0 6px 16px -8px rgba(0,0,0,0.35)",
                        border: reached ? "1px solid rgba(255,255,255,0.5)" : "none",
                      }}
                    />
                    {/* buffer-reached marker */}
                    {reached && (
                      <div className="absolute left-1/2 -translate-x-1/2 w-[58%] h-[3px] rounded-full" style={{ bottom: `${(w.buffer / scale) * 100}%`, background: "rgba(255,255,255,0.6)" }} />
                    )}
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
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">buffer {selected.buffer > 0 ? fmt(selected.buffer) : "—"}</p>
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
  const reached = wallet.buffer > 0 && wallet.balance >= wallet.buffer;
  const remaining = wallet.buffer - wallet.balance;
  const surplus = wallet.balance - wallet.buffer;
  const pct = wallet.buffer > 0 ? Math.min(100, (wallet.balance / wallet.buffer) * 100) : 100;
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
          <span className="uppercase tracking-[0.14em] opacity-60">Buffer</span>
          <span className="font-medium">{wallet.buffer > 0 ? fmt(wallet.buffer) : "—"}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: wallet.color }} />
        </div>
        {wallet.buffer > 0 && (
          reached ? (
            <p className="text-[11px] opacity-80">Buffer bereikt · <span className="font-semibold">{fmt(surplus)} over</span></p>
          ) : (
            <p className="text-[11px] opacity-80"><span className="font-semibold">{fmt(remaining)}</span> nog tot buffer</p>
          )
        )}
      </div>

      <div className="mt-auto pt-4 space-y-2 text-[10px] opacity-70">
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Reservering</span><span className="font-medium">{wallet.reservation > 0 ? `${fmt(wallet.reservation)}/mnd` : "—"}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Kind</span><span className="font-medium">{wallet.raw.kind || "—"}</span></div>
        <div className="flex items-center justify-between"><span className="uppercase tracking-[0.14em] opacity-60">Status</span><span className="font-medium">{wallet.raw.status || "—"}</span></div>
      </div>
    </div>
  );
}