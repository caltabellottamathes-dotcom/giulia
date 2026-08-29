import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";

const PERIODS = { weekly: 52, biweekly: 26, monthly: 12, bimonthly: 6, quarterly: 4, semiannual: 2, annual: 1, once: 1, variable: 12 };
const defaultReservation = (e) => { const a = Number(e.expected_amount ?? e.amount) || 0; const ppy = PERIODS[e.frequency || "monthly"] || 12; return Math.round((a * ppy / 12) * 100) / 100; };

const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";
const label = "text-[9px] uppercase tracking-[0.18em] text-ivory/60 font-semibold mb-1 block";

/** ReservationStage — beheer alle reserveringen op één plek. Wallets: Doel 1
 *  (target_balance) + Doel 2 (desired_buffer) instellen. Lasten: maandelijkse
 *  reservering per last. Auto-fill zet de standaard-reservering voor lasten
 *  die er nog geen hebben. Slaat alles in één keer op. */
export default function ReservationStage({ onClose }) {
  const { toast } = useToast();
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { limit: 500, realtime: true });
  const [wallets, setWallets] = useState({});
  const [lasten, setLasten] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const w = {};
    for (const p of (portfolios || [])) if (!p.archived && p.active !== false) w[p.id] = { target_balance: p.target_balance || 0, desired_buffer: p.desired_buffer || 0 };
    setWallets(w);
  }, [portfolios]);

  useEffect(() => {
    const l = {};
    for (const e of (expenses || [])) if (e.status !== "done") l[e.id] = { monthly_reservation: e.monthly_reservation ?? 0, default: defaultReservation(e) };
    setLasten(l);
  }, [expenses]);

  const activeP = (portfolios || []).filter((p) => !p.archived && p.active !== false);
  const openLasten = (expenses || []).filter((e) => e.status !== "done");

  const setW = (id, k, v) => setWallets((s) => ({ ...s, [id]: { ...s[id], [k]: v } }));
  const setL = (id, v) => setLasten((s) => ({ ...s, [id]: { ...s[id], monthly_reservation: v } }));

  const saveAll = async () => {
    setBusy(true);
    let ok = 0;
    try {
      for (const p of activeP) {
        const w = wallets[p.id];
        if (!w) continue;
        if ((Number(p.target_balance) || 0) !== Number(w.target_balance) || (Number(p.desired_buffer) || 0) !== Number(w.desired_buffer)) {
          await base44.entities.Portfolio.update(p.id, { target_balance: Number(w.target_balance) || 0, desired_buffer: Number(w.desired_buffer) || 0 });
          ok++;
        }
      }
      for (const e of openLasten) {
        const l = lasten[e.id];
        if (!l) continue;
        const v = Number(l.monthly_reservation) || 0;
        if ((Number(e.monthly_reservation) || 0) !== v) {
          await base44.entities.AdminObligation.update(e.id, { monthly_reservation: v });
          ok++;
        }
      }
      toast({ title: `Reserveringen opgeslagen · ${ok} wijzigingen` });
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const autoFill = async () => {
    setBusy(true);
    try {
      let n = 0;
      for (const e of openLasten) {
        const def = defaultReservation(e);
        if ((Number(e.monthly_reservation) || 0) !== def) {
          await base44.entities.AdminObligation.update(e.id, { monthly_reservation: def });
          n++;
        }
      }
      toast({ title: `${n} lasten voorzien van standaard-reservering` });
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
    } catch { toast({ title: "Auto-fill mislukt", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const totalRes = activeP.reduce((s, p) => s + (Number(p.monthly_reservation_actual) || 0), 0);
  const totalRec = activeP.reduce((s, p) => s + (Number(p.monthly_reservation_recommended) || 0), 0);

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">Reserveringen</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[20px] font-display font-bold tracking-[-0.02em] leading-tight">Reserveringen beheren</p>
            <p className="text-[11px] text-ivory/60">Stel Doel 1 & Doel 2 per wallet en de reservering per last in.</p>
          </div>
          <button onClick={autoFill} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-2 text-[11px] font-bold disabled:opacity-50">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Auto-fill
          </button>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[16px] font-display font-bold tabular-nums">{fmtEuro(totalRes)}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">reservering / mnd</p></div>
            <div><p className="text-[16px] font-display font-bold tabular-nums">{fmtEuro(totalRec)}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">aanbevolen / mnd</p></div>
            <div><p className="text-[16px] font-display font-bold tabular-nums">{openLasten.length}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">open lasten</p></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className={label}>Wallets · Doel 1 & Doel 2</p>
          {activeP.map((p) => {
            const w = wallets[p.id] || { target_balance: 0, desired_buffer: 0 };
            return (
              <div key={p.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color || "hsl(var(--smoke))" }} />
                  <span className="text-[13px] font-display font-semibold truncate">{p.name}</span>
                  <span className="text-[10px] text-ivory/55 ml-auto">saldo {fmtEuro(p.current_balance || 0)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-[9px] text-ivory/50 mb-1 block">Doel 1 · dekking €</span><input type="number" step="0.01" className={input} value={w.target_balance} onChange={(e) => setW(p.id, "target_balance", e.target.value)} /></div>
                  <div><span className="text-[9px] text-ivory/50 mb-1 block">Doel 2 · buffer €</span><input type="number" step="0.01" className={input} value={w.desired_buffer} onChange={(e) => setW(p.id, "desired_buffer", e.target.value)} /></div>
                </div>
                <p className="text-[9px] text-ivory/45 mt-1.5">Reservering nu {fmtEuro(p.monthly_reservation_actual || 0)}/mnd · aanbevolen {fmtEuro(p.monthly_reservation_recommended || 0)}/mnd</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className={label}>Lasten · maandelijkse reservering</p>
          {openLasten.length === 0 && <p className="text-sm text-ivory/50 italic">Geen open lasten.</p>}
          {openLasten.map((e) => {
            const l = lasten[e.id] || { monthly_reservation: 0, default: defaultReservation(e) };
            const pot = activeP.find((p) => p.id === e.portfolio_id);
            return (
              <div key={e.id} className="rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-display font-semibold truncate">{e.title}</p>
                  <p className="text-[10px] text-ivory/50">{pot?.name || "—"} · {FREQ_LABELS[e.frequency] || e.frequency} · {fmtEuro(e.expected_amount || 0)}</p>
                </div>
                <div className="w-24 shrink-0">
                  <input type="number" step="0.01" className={input} value={l.monthly_reservation} onChange={(ev) => setL(e.id, ev.target.value)} />
                  <p className="text-[8px] text-ivory/45 mt-0.5 text-right">std {fmtEuro(l.default)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 shrink-0 border-t border-white/10">
        <button onClick={saveAll} disabled={busy} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ivory text-charcoal px-4 py-2.5 text-sm font-bold disabled:opacity-50 transition">
          <Save className="w-4 h-4" /> {busy ? "Bezig…" : "Alles opslaan"}
        </button>
      </div>
    </div>
  );
}