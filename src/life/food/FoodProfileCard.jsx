import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { MEAL_LABELS, MEAL_ORDER, fmtEuro } from "@/lib/foodUtils";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { Loader2, Pencil, Check, X } from "lucide-react";

/** FoodProfileCard — LIFE-stijl: plum waarden, sand pills, label tracking. */
export default function FoodProfileCard({ profile, editable, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weekly_budget: profile?.weekly_budget ?? 50,
    people: profile?.people ?? 2,
    meals: profile?.meals ?? MEAL_ORDER,
    likes: (profile?.likes || []).join(", "),
    dislikes: (profile?.dislikes || []).join(", "),
    favourites: (profile?.favourites || []).join(", "),
    cuisines: (profile?.cuisines || []).join(", "),
  });

  const save = async () => {
    setSaving(true);
    const payload = {
      weekly_budget: Number(form.weekly_budget) || 50,
      people: Number(form.people) || 2,
      meals: form.meals,
      likes: form.likes.split(",").map((s) => s.trim()).filter(Boolean),
      dislikes: form.dislikes.split(",").map((s) => s.trim()).filter(Boolean),
      favourites: form.favourites.split(",").map((s) => s.trim()).filter(Boolean),
      cuisines: form.cuisines.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (profile?.id) await base44.entities.FoodProfile.update(profile.id, payload);
      else await base44.entities.FoodProfile.create(payload);
      setEditing(false);
      if (onSaved) onSaved();
    } finally { setSaving(false); }
  };

  const toggleMeal = (mt) => setForm((f) => ({ ...f, meals: f.meals.includes(mt) ? f.meals.filter((x) => x !== mt) : [...f.meals, mt] }));
  const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-life-blue-deep/30";

  if (editable && editing) {
    return (
      <div className="rounded-[24px] bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Food Profile · bewerken</p>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            <button onClick={save} disabled={saving} className="h-8 w-8 rounded-full flex items-center justify-center text-ivory disabled:opacity-50" style={{ background: PLUM }}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Budget (€/week)</span>
            <input type="number" value={form.weekly_budget} onChange={(e) => setForm((f) => ({ ...f, weekly_budget: e.target.value }))} className={inputCls} />
          </label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Personen</span>
            <input type="number" value={form.people} onChange={(e) => setForm((f) => ({ ...f, people: e.target.value }))} className={inputCls} />
          </label>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Maaltijden per dag</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {MEAL_ORDER.map((mt) => (
              <button key={mt} onClick={() => toggleMeal(mt)} className={cn("rounded-full px-3 py-1.5 text-xs font-medium border transition", form.meals.includes(mt) ? "text-charcoal border-transparent" : "border-border text-muted-foreground hover:text-foreground")} style={form.meals.includes(mt) ? { background: SAND, borderColor: SAND } : {}}>{MEAL_LABELS[mt]}</button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Voorkeuren (komma)</span><input value={form.likes} onChange={(e) => setForm((f) => ({ ...f, likes: e.target.value }))} className={inputCls} placeholder="bv. pasta, kip" /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Niet gewenst (komma)</span><input value={form.dislikes} onChange={(e) => setForm((f) => ({ ...f, dislikes: e.target.value }))} className={inputCls} placeholder="bv. paddenstoelen" /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Favorieten</span><input value={form.favourites} onChange={(e) => setForm((f) => ({ ...f, favourites: e.target.value }))} className={inputCls} /></label>
          <label className="space-y-1"><span className="text-xs text-muted-foreground">Keukens</span><input value={form.cuisines} onChange={(e) => setForm((f) => ({ ...f, cuisines: e.target.value }))} className={inputCls} placeholder="bv. italiaans, aziatisch" /></label>
        </div>
      </div>
    );
  }

  const meals = (profile?.meals && profile.meals.length ? profile.meals : MEAL_ORDER).map((mt) => MEAL_LABELS[mt]).join(" · ");
  const likes = (profile?.likes || []).join(", ") || "—";
  const dislikes = (profile?.dislikes || []).join(", ") || "—";

  return (
    <div className="rounded-[24px] bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Food Profile</p>
        {editable && (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition" style={{ background: "hsl(var(--life-sand) / 0.18)" }}>
            <Pencil className="h-3 w-3" /> Bewerk
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Budget" value={profile?.weekly_budget ? `${fmtEuro(profile.weekly_budget)}/wk` : "—"} valueColor={PLUM} />
        <Field label="Personen" value={profile?.people ?? "—"} valueColor={PLUM} />
        <Field label="Maaltijden" value={meals} wide />
        <Field label="Voorkeuren" value={likes} wide />
        <Field label="Niet gewenst" value={dislikes} wide />
      </div>
    </div>
  );
}

function Field({ label, value, wide, valueColor }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold mb-1">{label}</p>
      <p className="text-sm font-medium leading-snug" style={valueColor ? { color: valueColor } : undefined}>{value}</p>
    </div>
  );
}