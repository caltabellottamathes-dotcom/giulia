import React, { useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

const SHADOW = "-16px 16px 40px -16px rgba(0,0,0,0.30)";
const STATUS_LABEL = { expected: "Verwacht", partial: "Gedeeltelijk", missed: "Gemist" };
const STATUS_COLOR = { expected: "#94925d", partial: "#b1bec6", missed: "#9aa1a6" };

/** ExpectedIncomeWidget — sluitstuk van de Inkomen-bento. Toont verwachte
 *  inkomstenbronnen die nog niet binnen zijn (status expected/partial): bijvoorbeeld
 *  uitstaande offertes voor klanten, een erfenis of een deels uitbetaalde factuur
 *  — alles wat Giulia uit communicatie/voortgang als 'in de pijplijn' herkent. */
export default function ExpectedIncomeWidget() {
  const { data: incomes } = useEntityList("Income", { limit: 200, realtime: true });
  const list = useMemo(() => {
    return (incomes || [])
      .filter((i) => i.status === "expected" || i.status === "partial")
      .sort((a, b) => {
        const da = a.expected_date || a.date || "";
        const db = b.expected_date || b.date || "";
        return da.localeCompare(db);
      });
  }, [incomes]);
  const total = list.reduce((s, i) => s + (Number(i.received_amount ?? i.amount) || 0), 0);

  return (
    <div className="w-full rounded-[18px] graph-paper overflow-hidden" style={{ boxShadow: SHADOW }}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">Verwacht · pijplijn</p>
            <h3 className="text-lg font-display font-bold tracking-[-0.01em] text-foreground leading-tight">Expected income</h3>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Totaal verwacht</p>
            <p className="text-2xl font-display font-bold tabular-nums text-foreground leading-none mt-0.5">{fmtEuro(total)}</p>
          </div>
        </div>

        <div className="h-px w-full bg-foreground/10" />

        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Geen verwachte inkomsten in de pijplijn.</p>
        ) : (
          <div className="flex flex-col divide-y divide-foreground/8">
            {list.map((inc) => {
              const amt = Number(inc.received_amount ?? inc.amount) || 0;
              const label = inc.description || inc.category || "Inkomstenbron";
              const date = inc.expected_date || inc.date;
              const color = STATUS_COLOR[inc.status] || "#94925d";
              return (
                <div key={inc.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-8 w-1 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-foreground truncate">{label}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-0.5">
                      {inc.recurring ? `Terugkerend · ${inc.frequency || "maandelijks"}` : "Eenmalig"}{date ? ` · ${date}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-display font-bold tabular-nums text-foreground leading-none">{fmtEuro(amt)}</p>
                    <p className="text-[9px] uppercase tracking-[0.16em] font-semibold mt-1" style={{ color }}>{STATUS_LABEL[inc.status] || inc.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}