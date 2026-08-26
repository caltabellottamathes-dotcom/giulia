import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { accentFor, daysUntil, fmtDate } from "@/lib/adminUtils";

const statusOf = (o) => { const d = daysUntil(o.due_date); return d < 0 ? "urgent" : d <= 7 ? "soon" : "later"; };
const labelOf = (s) => s === "urgent" ? "TE LAAT" : s === "soon" ? "NADERT" : "OP KOERS";

/** AdminObligationCard — heldere administratieve kaart: titel, bedrag, datum,
 *  korte statusregel en één primaire actie. Donker (panel) of licht (page). */
export default function AdminObligationCard({ item, action = "OPEN", onAction, onEdit, onDelete, tone = "light", extra }) {
  if (!item) return null;
  const dark = tone === "dark";
  const s = statusOf(item);
  const c = accentFor(s);
  return (
    <div className="rounded-2xl p-4" style={{ background: dark ? "rgba(120,122,128,0.12)" : "hsl(var(--card))", boxShadow: dark ? "none" : "0 14px 34px -26px rgba(0,0,0,0.28)" }}>
      <div className="flex items-center justify-between gap-2">
        <h4 className={`text-base font-display font-semibold truncate ${dark ? "text-ivory" : "text-foreground"}`}>{item.title}</h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: c }}>{labelOf(s)}</span>
          {onEdit && <button onClick={() => onEdit(item)} title="Bewerken" className={`p-1 rounded-md transition ${dark ? "hover:bg-ivory/10 text-ivory/70" : "hover:bg-foreground/5 text-muted-foreground"}`}><Pencil className="w-3 h-3" /></button>}
          {onDelete && <button onClick={() => onDelete(item)} title="Verwijderen" className={`p-1 rounded-md transition ${dark ? "hover:bg-ivory/10 text-ivory/70" : "hover:bg-foreground/5 text-muted-foreground"}`}><Trash2 className="w-3 h-3" /></button>}
        </div>
      </div>
      <div className="flex items-end gap-3 mt-1.5">
        {Number(item.amount) > 0 && <span className={`text-2xl font-display font-semibold tabular-nums leading-none ${dark ? "text-ivory" : "text-foreground"}`}>€{item.amount}</span>}
        <span className={`text-xs mb-0.5 ${dark ? "text-ivory/55" : "text-muted-foreground"}`}>{fmtDate(item.due_date)}</span>
      </div>
      {item.notes && <p className={`text-xs italic mt-2 ${dark ? "text-ivory/50" : "text-muted-foreground"}`}>{item.notes}</p>}
      {extra}
      {action && onAction && <button onClick={() => onAction(item)} className="mt-3 inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold transition hover:brightness-110" style={{ background: c, color: "hsl(var(--charcoal))" }}>{action}</button>}
    </div>
  );
}