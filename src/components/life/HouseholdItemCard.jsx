import React from "react";

const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";

/** HouseholdItemCard — generieke card voor shopping / maintenance / issue.
 *  Titel, categorie/status, korte context en één primaire actie. */
export default function HouseholdItemCard({ item, action, onAction, tone = "light" }) {
  if (!item) return null;
  const dark = tone === "dark";
  const att = ["overdue", "needs_attention", "due", "open"].includes(item.status);
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: dark ? "rgba(120,122,128,0.12)" : "hsl(var(--card))", boxShadow: dark ? "none" : "0 14px 34px -26px rgba(0,0,0,0.28)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`text-base font-display font-semibold leading-none truncate ${dark ? "text-ivory" : "text-foreground"}`}>{item.title}</h4>
          {att && <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-soft" style={{ background: SAND }} />}
        </div>
        {(item.location || item.notes) && <p className={`text-[12px] mt-1.5 italic ${dark ? "text-ivory/50" : "text-foreground/50"}`}>{item.location ? item.location : ""}{item.location && item.notes ? " · " : ""}{item.notes || ""}</p>}
        {item.next_due && <p className="text-[10px] uppercase tracking-[0.18em] mt-1.5 font-semibold" style={{ color: BLUE_DEEP }}>{new Date(item.next_due).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</p>}
      </div>
      {action && onAction && (
        <button onClick={() => onAction(item)} className="shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition" style={{ background: SAND, color: "hsl(var(--charcoal))" }}>{action}</button>
      )}
    </div>
  );
}