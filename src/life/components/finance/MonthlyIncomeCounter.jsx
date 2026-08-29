import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

const WALLET_PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/4ff91851b_Man_in_motion_2K_202608281637.jpeg";

/** MonthlyIncomeCounter — brede kaart boven de maandelijkse verdeling op de
 *  Inkomen-tab. Een teller die optelt wat deze kalendermaand aan inkomen is
 *  ontvangen (status=received met een datum in de huidige maand). Telkens een
 *  inkomen wordt uitbetaald (status → received) telt hij mee; bij maandovergang
 *  reset hij automatisch (compute-based uit de inkomsten, geen opslag). */
export default function MonthlyIncomeCounter() {
  const { data: incomes } = useEntityList("Income", { limit: 200, realtime: true });
  const now = new Date();
  const monthLabel = now.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

  const { receivedThisMonth, totalExpected, lastReceived } = useMemo(() => {
    const list = incomes || [];
    const inMonth = (d) => {
      if (!d) return false;
      const x = new Date(d.length > 10 ? d : d + "T00:00:00");
      return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth();
    };
    const rec = list.filter((i) => i.status === "received" && (inMonth(i.expected_date) || inMonth(i.date)));
    const sum = rec.reduce((s, i) => s + (Number(i.received_amount ?? i.amount) || 0), 0);
    const exp = list.filter((i) => i.recurring || i.status === "expected").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const last = rec.length ? rec[rec.length - 1] : null;
    return { receivedThisMonth: sum, totalExpected: exp, lastReceived: last };
  }, [incomes]); // eslint-disable-line

  const irregularExpected = useMemo(() => {
    return (incomes || [])
      .filter((i) => (i.status === "expected" || i.status === "partial") && !i.recurring)
      .sort((a, b) => (a.expected_date || a.date || "").localeCompare(b.expected_date || b.date || ""))
      .slice(0, 4);
  }, [incomes]);

  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = display;
    const end = receivedThisMonth;
    const t0 = performance.now();
    const dur = 850;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [receivedThisMonth]); // eslint-disable-line

  return (
    <div className="relative w-full rounded-[18px] overflow-hidden" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <img src={WALLET_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.78), rgba(20,22,26,0.52) 55%, rgba(20,22,26,0.70))" }} />
      <div className="relative p-5 flex flex-col gap-3" style={{ color: "hsl(var(--ivory))", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
        <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] font-light opacity-70">Inkomsten teller · {monthLabel}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mt-1 opacity-65 truncate">
            {lastReceived ? `laatst ontvangen: ${lastReceived.description || lastReceived.category || "—"}` : "nog niets ontvangen deze maand"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] uppercase tracking-[0.2em] font-semibold opacity-65">Deze maand ontvangen</p>
          <p className="text-[clamp(34px,3.4vw,48px)] leading-none font-display font-bold tabular-nums tracking-[-0.03em]">{fmtEuro(display)}</p>
          <p className="text-[10px] mt-1 opacity-65">verwacht totaal {fmtEuro(totalExpected)} / mnd</p>
        </div>
        </div>
        {irregularExpected.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2.5 border-t border-white/15">
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-50 w-full">Verwacht · pijplijn (onregelmatig)</p>
            {irregularExpected.map((inc) => (
              <div key={inc.id} className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-display font-semibold opacity-85">{inc.description || inc.category || "—"}</span>
                <span className="text-[10px] tabular-nums opacity-60">{fmtEuro(Number(inc.received_amount ?? inc.amount) || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}