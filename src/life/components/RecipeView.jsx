import React, { useState } from "react";
import { X, Utensils, Check, Trash2, Move } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MEAL_LABELS, DAY_LABELS, MEAL_ORDER, fmtEuro, dayKeyFor } from "@/lib/foodUtils";

/**
 * RecipeView — modaal recept-overlay. Toont metadata, ingrediënten, method en
 * acties: START COOKING / MARK AS EATEN. In planningscontext (onDelete/onMove)
 * ook VERWIJDEREN en VERPLAATSEN.
 */
export default function RecipeView({ meal, onClose, onEaten, onDelete, onMove, days }) {
  const [moving, setMoving] = useState(false);
  const [moveDate, setMoveDate] = useState(meal?.date || "");
  const [moveType, setMoveType] = useState(meal?.meal_type || "dinner");
  if (!meal) return null;

  const markEaten = async () => {
    try {
      await base44.entities.Meal.update(meal.id, { status: "eaten" });
      if (meal.recipe_id) {
        try { await base44.entities.Recipe.update(meal.recipe_id, { last_eaten: new Date().toISOString().slice(0, 10) }); } catch { /* ignore */ }
      }
      if (onEaten) onEaten();
    } catch { /* ignore */ }
  };

  const doDelete = async () => {
    try { await base44.entities.Meal.delete(meal.id); } catch { /* ignore */ }
    if (onDelete) onDelete();
  };

  const doMove = async () => {
    if (!moveDate) return;
    try {
      await base44.entities.Meal.update(meal.id, { date: moveDate, day: dayKeyFor(moveDate), meal_type: moveType });
    } catch { /* ignore */ }
    if (onMove) onMove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 animate-fade-in" onClick={onClose}>
      <div className="refraction-panel relative w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten">
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-7 pb-7">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold">
            {MEAL_LABELS[meal.meal_type] || meal.meal_type}{meal.time ? ` · ${meal.time}` : ""}
          </p>
          <h2 className="text-2xl font-display font-semibold text-ivory mt-1 tracking-tight">{meal.recipe_name}</h2>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-ivory/60">
            {meal.total_time ? <span>{meal.total_time} min</span> : null}
            {meal.servings ? <span>{meal.servings} servings</span> : null}
            {meal.cost ? <span>{fmtEuro(meal.cost)}</span> : null}
            {meal.cuisine ? <span className="capitalize">{meal.cuisine}</span> : null}
          </div>

          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mt-6 mb-2">Ingredients</p>
          {(meal.ingredients || []).length ? (
            <ul className="space-y-1.5">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-ivory/85 flex justify-between gap-3">
                  <span className="min-w-0">{ing.name}{ing.amount ? ` · ${ing.amount} ${ing.unit || ""}` : ""}</span>
                  {ing.supermarket_product ? <span className="text-ivory/45 text-xs shrink-0 text-right">{ing.supermarket_product}{ing.price ? ` · ${fmtEuro(ing.price)}` : ""}</span> : null}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ivory/50 italic">Geen ingrediënten opgegeven.</p>}

          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mt-6 mb-2">Method</p>
          {(meal.method || []).length ? (
            <ol className="space-y-2">
              {meal.method.map((step, i) => (
                <li key={i} className="text-sm text-ivory/85 flex gap-2.5"><span className="text-ivory/40 font-mono shrink-0">{i + 1}.</span><span>{step}</span></li>
              ))}
            </ol>
          ) : <p className="text-sm text-ivory/50 italic">Geen stappen opgegeven.</p>}

          {/* Planning-acties */}
          {(onDelete || onMove) && (
            <div className="mt-6 pt-5 border-t border-ivory/10 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold">Planning</p>
              {moving ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <select value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className="rounded-lg bg-ivory/10 border border-ivory/15 px-3 py-2 text-sm text-ivory outline-none">
                      {(days || []).map((d) => <option key={d.date} value={d.date} className="text-charcoal">{DAY_LABELS[d.dayKey]} {new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</option>)}
                    </select>
                    <select value={moveType} onChange={(e) => setMoveType(e.target.value)} className="rounded-lg bg-ivory/10 border border-ivory/15 px-3 py-2 text-sm text-ivory outline-none">
                      {MEAL_ORDER.map((t) => <option key={t} value={t} className="text-charcoal">{MEAL_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <button onClick={doMove} className="w-full rounded-full px-4 py-2.5 text-sm font-bold bg-ivory text-charcoal inline-flex items-center justify-center gap-1.5"><Move className="h-4 w-4" /> Verplaatsen</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {onMove && <button onClick={() => setMoving(true)} className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold glass-button text-ivory inline-flex items-center justify-center gap-1.5"><Move className="h-4 w-4" /> Verplaatsen</button>}
                  {onDelete && <button onClick={doDelete} className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold bg-red-500/80 text-ivory inline-flex items-center justify-center gap-1.5"><Trash2 className="h-4 w-4" /> Verwijderen</button>}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-7">
            <button onClick={onClose} className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold bg-ivory text-charcoal inline-flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform"><Utensils className="h-4 w-4" /> Start cooking</button>
            <button onClick={markEaten} className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold glass-button text-ivory inline-flex items-center justify-center gap-1.5"><Check className="h-4 w-4" /> Mark as eaten</button>
          </div>
        </div>
      </div>
    </div>
  );
}