import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";

const PERIODS = { weekly: 52, biweekly: 26, monthly: 12, bimonthly: 6, quarterly: 4, semiannual: 2, annual: 1, once: 1, variable: 12 };
const defaultReservation = (e) => { const a = Number(e.expected_amount ?? e.amount) || 0; const ppy = PERIODS[e.frequency || "monthly"] || 12; return Math.round((a * ppy / 12) * 100) / 100; };

const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";
const label = "text-[9px] uppercase tracking-[0.18em] text-ivory/60 font-semibold mb-1 block";

/** ReservationStage — beheer reserveringen (Doel 2) los van vaste lasten.
 *  Wallets uitklapbaar: tik → toont bijbehorende vaste lasten (alleen lezen;
 *  het lastbedrag pas je aan in de Last-tab/expense-stage, niet hier).
 *  Doel 1 = som der lasten (vast, auto-berekend). Doel 2 (buffer) en de
 *  maandelijkse reservering (Doel 2-bijdrage) stel je zelf in — onafhankelijk
 *  van de lastbedragen. "Alles opslaan" schrijft Doel 1 (berekend), Doel 2
 *  en de reservering per wallet weg. */
export default function ReservationStage({ onClose }) {
  const { toast } = useToast();
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { limit: 500, realtime: true });
  const [buffers, setBuffers] = useState({});
  const [reservations, setReservations] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(false);

  const activeP = useMemo(() => (portfolios || []).filter((p) => !p.archived && p.active !== false), [portfolios]);
  const openLasten = useMemo(() => (expenses || []).filter((e) => e.status !== "done"), [expenses]);

  const linkedOf = (pid) => openLasten.filter((e) => e.portfolio_id === pid);
  const doel1Of = (pid) => linkedOf(pid).reduce((s, e) => s + defaultReservation(e), 0);

  useEffect(() => {
    const b = {}; const r = {};
    for (const p of activeP) { b[p.id] = p.desired_buffer || 0; r[p.id] = p.monthly_buffer_reservation || 0; }
    setBuffers(b); setReservations(r);
  }, [activeP]);

  const setB = (id, v) => setBuffers((s) => ({ ...s, [id]: v }));
  const setR = (id, v) => setReservations((s) => ({ ...s, [id]: v }));

  const saveAll = async () => {
    setBusy(true);
    let ok = 0;
    try {
      for (const p of activeP) {
        const d1 = Math.round(doel1Of(p.id) * 100) / 100;
        const d2 = Number(buffers[p.id]) || 0;
        const res = Number(reservations[p.id]) || 0;
        if ((Number(p.target_balance) || 0) !== d1 || (Number(p.desired_buffer) || 0) !== d2 || (Number(p.monthly_buffer_reservation) || 0) !== res) {
          await base44.entities.Portfolio.update(p.id, { target_balance: d1, desired_buffer: d2, monthly_buffer_reservation: res });
          ok++;
        }
      }
      toast({ title: `Reserveringen opgeslagen · ${ok} wallets` });
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const totalRes = activeP.reduce((s, p) => s + (Number(reservations[p.id]) || 0), 0);
  const totalDoel1 = activeP.reduce((s, p) => s + doel1Of(p.id), 0);

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">Reserveringen</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4 space-y-4">
        <div>
          <p className="text-[20px] font-display font-bold tracking-[-0.02em] leading-tight">Reserveringen beheren</p>
          <p className="text-[11px] text-ivory/60">Tik een wallet voor de lasten. Doel 1 = som der lasten (vast). Doel 2 & reservering stel je zelf in — los van de lastbedragen.</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-[16px] font-display font-bold tabular-nums">{fmtEuro(totalDoel1)}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">Doel 1 totaal / mnd</p></div>
            <div><p className="text-[16px] font-display font-bold tabular-nums">{fmtEuro(totalRes)}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">reservering / mnd</p></div>
            <div><p className="text-[16px] font-display font-bold tabular-nums">{openLasten.length}</p><p className="text-[9px] uppercase tracking-wide text-ivory/55">open lasten</p></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className={label}>Wallets · tik om uit te klappen</p>
          {activeP.map((p) => {
            const isOpen = expanded === p.id;
            const linked = linkedOf(p.id);
            const d1 = doel1Of(p.id);
            return (
              <div key={p.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : p.id)} className="w-full flex items-center gap-2 p-3 text-left">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: p.color || "hsl(var(--smoke))" }} />
                  <span className="text-[13px] font-display font-semibold truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-ivory/55 shrink-0">saldo {fmtEuro(p.current_balance || 0)}</span>
                  <ChevronDown className={`w-4 h-4 text-ivory/60 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-3 border-t border-white/8 pt-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-white/8 px-2.5 py-2">
                        <p className="text-[8px] uppercase tracking-[0.14em] text-ivory/55">Doel 1 · dekking (vast)</p>
                        <p className="text-[13px] font-display font-bold tabular-nums leading-none mt-1">{fmtEuro(d1)}</p>
                        <p className="text-[8px] text-ivory/45 mt-1">som van {linked.length} lasten</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-ivory/50 mb-1 block">Doel 2 · buffer €</span>
                        <input type="number" step="0.01" className={input} value={buffers[p.id] || 0} onChange={(e) => setB(p.id, e.target.value)} />
                      </div>
                      <div>
                        <span className="text-[9px] text-ivory/50 mb-1 block">Reservering / mnd €</span>
                        <input type="number" step="0.01" className={input} value={reservations[p.id] || 0} onChange={(e) => setR(p.id, e.target.value)} />
                        <p className="text-[8px] text-ivory/45 mt-1">Doel 2-bijdrage</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-ivory/55 font-semibold mb-1.5">Vaste lasten in deze wallet · {linked.length}</p>
                      {linked.length === 0 && <p className="text-[11px] text-ivory/45 italic">Geen lasten gekoppeld.</p>}
                      <div className="space-y-1">
                        {linked.map((e) => (
                          <div key={e.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
                            <div className="min-w-0">
                              <p className="text-[12px] font-display font-semibold truncate">{e.title}</p>
                              <p className="text-[10px] text-ivory/50">{FREQ_LABELS[e.frequency] || e.frequency}</p>
                            </div>
                            <span className="text-[12px] font-mono tabular-nums font-bold shrink-0">{fmtEuro(e.expected_amount || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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