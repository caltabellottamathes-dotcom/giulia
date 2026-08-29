import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

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
    <div className="w-full rounded-[18px] overflow-hidden" style={{ background: "#d8dab3", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <div className="relative p-5 flex items-center justify-between gap-4" style={{ color: "#2a2c30" }}>
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
    </div>
  );
}