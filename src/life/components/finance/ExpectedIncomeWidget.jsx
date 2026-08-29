import React, { useMemo } from "react";
import { FileText, Gift, TrendingUp, Sparkles, Landmark } from "lucide-react";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

const SOURCE_LABEL = { quotation: "Offerte", inheritance: "Erfenis", bonus: "Bonus", refund: "Teruggaaf", grant: "Subsidie", other: "Anders" };
const SOURCE_ICON = { quotation: FileText, inheritance: Gift, bonus: TrendingUp, refund: Sparkles, grant: Landmark, other: FileText };
const STATUS_LABEL = { expected: "Verwacht", partial: "Gedeeltelijk", received: "Ontvangen", cancelled: "Vervallen" };
const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const OLIVE = "#94925d";
const PISTACHIO = "#d8dab3";

/** ExpectedIncomeWidget — laatste kaart op de Inkomen-bento. Toont verwachte
 *  inkomsten buiten de vaste stroom (offertes, erfenissen, uitkeringen, bonussen).
 *  Per bron: waarschijnlijkheid (GIULIA weet uit voortgang/communicatie welke
 *  deels al zeker zijn), verwacht bedrag, al ontvangen, en een gewogen totaal. */
export default function ExpectedIncomeWidget() {
  const { data } = useEntityList("ExpectedIncome", { limit: 50, realtime: true });
  const list = useMemo(
    () => (data || []).filter((x) => x.status !== "cancelled").sort((a, b) => (a.expected_date || "9999").localeCompare(b.expected_date || "9999")),
    [data]
  );
  const open = list.filter((x) => x.status !== "received");
  const gross = open.reduce((s, x) => s + (Number(x.expected_amount) || 0), 0);
  const weighted = open.reduce((s, x) => s + (Number(x.expected_amount) || 0) * ((Number(x.probability) || 0) / 100), 0);
  const received = list.reduce((s, x) => s + (Number(x.received_amount) || 0), 0);

  return (
    <div className="w-full rounded-[18px] overflow-hidden graph-paper" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <div className="p-5">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: MUTED }}>Verwachte inkomsten</p>
            <p className="text-[11px] mt-1" style={{ color: MUTED }}>Buiten de vaste stroom — offertes, erfenissen, uitkeringen.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: MUTED }}>Gewogen verwacht</p>
            <p className="text-[26px] leading-none font-display font-bold tabular-nums tracking-[-0.03em]" style={{ color: INK }}>{fmtEuro(weighted)}</p>
            <p className="text-[10px] mt-1" style={{ color: MUTED }}>bruto {fmtEuro(gross)} · al binnen {fmtEuro(received)}</p>
          </div>
        </div>

        {/* list */}
        {open.length === 0 ? (
          <div className="mt-6 py-8 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ background: "hsl(var(--foreground) / 0.06)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: MUTED }} />
            </div>
            <p className="text-sm font-medium" style={{ color: INK }}>Nog geen verwachte inkomsten</p>
            <p className="text-[12px] mt-1 max-w-[340px] mx-auto" style={{ color: MUTED }}>
              Giulia bewaart hier toekomstige uitkeringen — offertes voor klanten, een erfenis, een bonus — en houdt op basis van voortgang en communicatie bij welk deel al zeker is.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            {open.map((x) => {
              const Icon = SOURCE_ICON[x.source_type] || FileText;
              const prob = Math.max(0, Math.min(100, Number(x.probability) || 0));
              const certain = prob >= 75;
              return (
                <div key={x.id} className="flex items-center gap-3 py-3 border-t" style={{ borderColor: "hsl(var(--foreground) / 0.10)" }}>
                  <span className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: certain ? PISTACHIO : "hsl(var(--foreground) / 0.06)" }}>
                    <Icon className="w-4 h-4" style={{ color: certain ? "#2a2c30" : MUTED }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-display font-semibold truncate" style={{ color: INK }}>{x.title}</p>
                      <span className="text-[9px] uppercase tracking-[0.14em] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "hsl(var(--foreground) / 0.06)", color: MUTED }}>{SOURCE_LABEL[x.source_type] || "Anders"}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
                      {x.expected_date ? `verwacht ${x.expected_date}` : "datum open"}{x.status === "partial" && Number(x.received_amount) > 0 ? ` · ${fmtEuro(x.received_amount)} al binnen` : ""}
                    </p>
                    {/* probability bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${prob}%`, background: certain ? OLIVE : PISTACHIO }} />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums shrink-0" style={{ color: certain ? OLIVE : MUTED }}>{Math.round(prob)}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-display font-bold tabular-nums leading-none" style={{ color: INK }}>{fmtEuro(x.expected_amount || 0)}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] mt-1" style={{ color: certain ? OLIVE : MUTED }}>{certain ? "vast geteld" : STATUS_LABEL[x.status] || "Verwacht"}</p>
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