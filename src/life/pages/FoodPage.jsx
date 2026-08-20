import React from "react";
import PageHero from "@/system/components/glass/PageHero";
import { IMAGES } from "@/lib/images";
import { Utensils, ShoppingCart, CalendarDays, TrendingUp, Recycle } from "lucide-react";
import { SAND } from "@/life/food/lifeColors";
import {
  CATEGORIES, CUT_LIST, WEEK, KCAL, REUSE,
} from "@/life/food/staticMenu";

function SectionTitle({ icon: Icon, kicker, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: SAND }}>
        <Icon className="w-4 h-4 text-charcoal" />
      </div>
      <div>
        <div className="text-[9px] uppercase tracking-[0.28em] font-bold text-foreground/45">{kicker}</div>
        <h2 className="text-xl font-display font-semibold tracking-tight leading-none mt-0.5">{title}</h2>
      </div>
    </div>
  );
}

export default function FoodPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <PageHero page="life-food" image={IMAGES.lifeFood} icon={Utensils} eyebrow="LIFE · FOOD" title="What's for Dinner?" subtitle="Vast 7-daags menu + boodschappenlijst — ± €50 bij ALDI België" />

      {/* Totaal banner */}
      <div className="rounded-2xl glass-2 border border-border/40 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: SAND }}>
            <span className="text-xl">💰</span>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] font-bold text-foreground/45">Totaal</div>
            <div className="text-2xl font-display font-semibold tracking-tight">Geschat: ± €49–51</div>
          </div>
        </div>
        <p className="text-xs text-foreground/55 max-w-md leading-relaxed">
          Boven €50? Schrap eerst: {CUT_LIST.join(" · ")}.
        </p>
      </div>

      {/* Boodschappenlijst */}
      <section className="space-y-4">
        <SectionTitle icon={ShoppingCart} kicker="🛒 Boodschappen" title="Boodschappenlijst" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="rounded-2xl glass border border-border/40 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-border/30" style={{ background: SAND }}>
                <span className="text-sm font-display font-semibold tracking-tight text-charcoal">{cat.emoji} {cat.title}</span>
                <span className="text-[10px] font-mono text-charcoal/70">{cat.subtotal}</span>
              </div>
              <div className="divide-y divide-border/20">
                {cat.items.map(([name, qty, price]) => (
                  <div key={name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span className="text-foreground/85">{name}</span>
                    <span className="text-foreground/45 text-xs tabular-nums">{qty}</span>
                    <span className="text-foreground/70 text-xs font-mono tabular-nums w-16 text-right">{price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Je Week */}
      <section className="space-y-4">
        <SectionTitle icon={CalendarDays} kicker="🍽️ Menu" title="Je Week" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {WEEK.map((d) => (
            <div key={d.day} className="rounded-2xl glass-2 border border-border/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
                <span className="text-sm font-display font-semibold tracking-[0.14em] uppercase text-charcoal">{d.day}</span>
                <span className="text-[10px] font-mono text-foreground/40">{d.meals.length} maaltijden</span>
              </div>
              <div className="divide-y divide-border/20">
                {d.meals.map((m) => (
                  <div key={m.slot} className="px-5 py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-foreground/40 w-16 shrink-0">{m.slot}</span>
                        <span className="text-[15px] font-display font-medium tracking-tight truncate">{m.name}</span>
                      </div>
                      {m.time && <span className="text-[10px] font-mono text-foreground/45 shrink-0">{m.time}</span>}
                    </div>
                    {m.items.length > 0 && (
                      <ul className="mt-1.5 ml-[4.7rem] flex flex-wrap gap-x-2 gap-y-1 text-xs text-foreground/55">
                        {m.items.map((it, i) => (
                          <li key={i} className="after:content-['·'] after:ml-2 after:text-foreground/25 last:after:content-['']">{it}</li>
                        ))}
                      </ul>
                    )}
                    {m.note && <p className="mt-1.5 ml-[4.7rem] text-[11px] italic text-foreground/45">{m.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wat je hiermee eet + hergebruik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="space-y-4">
          <SectionTitle icon={TrendingUp} kicker="📊 Voeding" title="Wat je ongeveer eet" />
          <div className="rounded-2xl glass border border-border/40 divide-y divide-border/20">
            {KCAL.map(([slot, kcal, note]) => (
              <div key={slot} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-display font-medium">{slot}</div>
                  <div className="text-[11px] text-foreground/45">{note}</div>
                </div>
                <span className="text-sm font-mono text-foreground/70 tabular-nums">{kcal}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <SectionTitle icon={Recycle} kicker="🔄 Hergebruik" title="Ingrediënten opgebruikt" />
          <div className="rounded-2xl glass border border-border/40 divide-y divide-border/20">
            {REUSE.map(([ing, flow]) => (
              <div key={ing} className="px-5 py-3">
                <div className="text-sm font-display font-medium">{ing}</div>
                <div className="text-[11px] text-foreground/55 mt-0.5">→ {flow}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}