import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpenseAllocationBar from "./ExpenseAllocationBar";
import { fmtEuro } from "@/lib/financeUtils";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const effDate = (o) => o?.next_payment_date || o?.due_date;
const amt = (o) => Number(o?.expected_amount ?? o?.amount) || 0;

/** LastenAllocationCard — kopie van de maandelijkse verdeling per last,
 *  expandable naar beneden met gestructureerde info (verticale-lijnen
 *  timeline zoals de Overview-editorial). */
export default function LastenAllocationCard({ expenses, portfolios }) {
  const [open, setOpen] = useState(false);
  const pots = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "hsl(var(--smoke))";
  const nameOf = (pid) => pots.find((p) => p.id === pid)?.name || "—";

  const list = useMemo(() => {
    return (expenses || [])
      .filter((e) => (e.status || "open") !== "done" && e.frequency && e.frequency !== "once")
      .sort((a, b) => (effDate(a) || "").localeCompare(effDate(b) || ""));
  }, [expenses]);
  const total = list.reduce((s, e) => s + amt(e), 0);

  return (
    <div className="w-full rounded-[20px] graph-paper overflow-hidden" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-4 pt-4 pb-2 text-left">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: MUTED }}>Maandelijkse verdeling per last</p>
          <p className="text-base font-display font-bold mt-0.5" style={{ color: INK }}>{fmtEuro(total)} <span className="text-xs font-normal" style={{ color: MUTED }}>/ mnd over {list.length} lasten</span></p>
        </div>
        <span className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--foreground) / 0.05)" }}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} style={{ color: MUTED }} />
        </span>
      </button>
      <div className="px-4 pb-3">
        <ExpenseAllocationBar />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: MUTED }}>Gestructureerde lasten</p>
              <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "hsl(var(--foreground) / 0.18)" }} />
                <div className="space-y-3.5">
                  {list.map((e) => (
                    <div key={e.id} className="relative flex items-center justify-between gap-3">
                      <span className="absolute -left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2" style={{ background: colorOf(e.portfolio_id), borderColor: "hsl(var(--warm-white))" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-display font-semibold truncate" style={{ color: INK }}>{e.title}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] mt-0.5" style={{ color: MUTED }}>{nameOf(e.portfolio_id)}{effDate(e) ? ` · ${effDate(e)}` : ""}</p>
                      </div>
                      <span className="text-sm font-mono tabular-nums font-bold shrink-0" style={{ color: INK }}>{fmtEuro(amt(e))}</span>
                    </div>
                  ))}
                  {list.length === 0 && <p className="text-xs italic" style={{ color: MUTED }}>Geen openstaande vaste lasten.</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}