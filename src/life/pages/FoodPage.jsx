import React from "react";
import PageHero from "@/system/components/glass/PageHero";
import { IMAGES } from "@/lib/images";
import { Utensils, ShoppingCart, CalendarDays, TrendingUp, Recycle } from "lucide-react";
import { SAND } from "@/life/food/lifeColors";

/* ── Vaste boodschappenlijst + 7-daags menu (± €50, ALDI België) ── */

const CATEGORIES = [
  {
    title: "Basis",
    emoji: "🍚",
    items: [
      ["Aardappelen", "2,5 kg", "± €3,50"],
      ["Rijst", "1 kg", "± €1,50"],
      ["Spaghetti", "500 g", "± €1,00"],
      ["Pasta", "500 g", "± €1,00"],
      ["Brood", "1", "± €1,50"],
      ["Wraps", "1 pak", "± €2,00"],
      ["Muesli", "500 g", "± €2,50"],
    ],
    subtotal: "± €13",
  },
  {
    title: "Eiwitten & zuivel",
    emoji: "🥚",
    items: [
      ["Eieren", "12", "€3,99"],
      ["Kippenboutfilet", "500 g", "± €5,59"],
      ["Tonijn", "1 blik", "actie"],
      ["Linzen", "2 blikken", "± €2"],
      ["Kikkererwten", "2 blikken", "± €2"],
      ["Kidneybonen", "2 blikken", "± €2"],
      ["Magere verse kaas", "500 g", "€0,99"],
      ["Griekse yoghurt", "1 kg", "€1,79"],
      ["Mozzarella", "1 bol", "± €1,24"],
    ],
    subtotal: "± €19–20",
  },
  {
    title: "Groenten",
    emoji: "🥕",
    items: [
      ["Wortelen", "1 kg", "± €1,50"],
      ["Uien", "1 kg", "± €1,50"],
      ["Witte kool", "1", "± €1,50"],
      ["Diepvriesgroenten", "1 kg", "± €2,50"],
      ["Komkommer", "1", "± €1"],
      ["Tomaten", "500 g", "± €2"],
      ["Maïs", "1 blik", "± €1"],
      ["Passata/gepelde tomaten", "2", "± €1,50"],
      ["Tomatenpuree", "1", "€0,49"],
    ],
    subtotal: "± €13",
  },
  {
    title: "Fruit",
    emoji: "🍌",
    items: [
      ["Bananen", "1 kg", "± €1,50"],
      ["Appels", "1 kg", "± €2"],
      ["Witte druiven", "2 × 500 g", "€2,05"],
    ],
    subtotal: "± €5,50",
  },
];

const CUT_LIST = [
  "tweede blik kidneybonen",
  "tweede blik kikkererwten",
  "extra mozzarella",
  "tweede soort pasta",
];

const WEEK = [
  {
    day: "Vrijdag",
    meals: [
      { slot: "Ontbijt", name: "Yoghurt-muesli", items: ["200 g Griekse yoghurt", "40 g muesli", "½ banaan"] },
      { slot: "Lunch", name: "Eieren op brood", items: ["2 boterhammen", "2 eieren", "tomaat"] },
      { slot: "Snack", name: "Druiven", items: ["±150–200 g"] },
      { slot: "Avondeten", name: "Kipwraps 🌯", items: ["150 g kip", "2 wraps", "200 g diepvriesgroenten", "½ ui", "komkommer", "50 g yoghurt", "kruiden"], time: "±15 min" },
    ],
  },
  {
    day: "Zaterdag",
    meals: [
      { slot: "Ontbijt", name: "Yoghurt + muesli + fruit", items: ["200 g yoghurt", "40 g muesli", "½ banaan"] },
      { slot: "Lunch", name: "Grote omelet", items: ["3 eieren", "wortel", "ui", "tomaat", "2 boterhammen"] },
      { slot: "Snack", name: "Appel + wortel", items: [] },
      { slot: "Avondeten", name: "Linzen-bolognese 🍝", items: ["100 g spaghetti", "½ blik linzen", "250 g passata", "1 wortel", "½ ui", "1 tl tomatenpuree", "Italiaanse kruiden"], time: "±30 min", note: "Maak 2 porties. Eén voor zaterdagavond, één voor zondagmiddag." },
    ],
  },
  {
    day: "Zondag",
    meals: [
      { slot: "Ontbijt", name: "Yoghurt + druiven", items: ["200 g yoghurt", "40 g muesli", "150 g druiven"] },
      { slot: "Lunch", name: "Restje linzen-bolognese", items: [] },
      { slot: "Snack", name: "Banaan", items: [] },
      { slot: "Avondeten", name: "Loaded potatoes 🥔", items: ["600–700 g aardappelen", "½ blik kidneybonen", "maïs", "tomaat", "komkommer", "50 g mozzarella", "75 g yoghurt"], time: "±35 min", note: "Grote portie. Veel volume." },
    ],
  },
  {
    day: "Maandag",
    meals: [
      { slot: "Ontbijt", name: "Eieren + brood", items: ["2 eieren", "2 boterhammen", "stuk fruit"] },
      { slot: "Lunch", name: "Brood met magere verse kaas", items: ["2–3 boterhammen", "magere verse kaas", "tomaat/komkommer"] },
      { slot: "Snack", name: "Druiven", items: [] },
      { slot: "Avondeten", name: "Egg fried rice 🍳", items: ["100 g droge rijst", "2 eieren", "300 g diepvriesgroenten", "wortel", "½ ui", "maïs"], time: "±15 min", note: "Eventueel sambal/sojasaus als je dat al hebt." },
    ],
  },
  {
    day: "Dinsdag",
    meals: [
      { slot: "Ontbijt", name: "Yoghurt bowl", items: ["200 g yoghurt", "40 g muesli", "appel"] },
      { slot: "Lunch", name: "Rijstrestjes / brood", items: ["Gebruik wat over is van maandag."] },
      { slot: "Snack", name: "Appel + wortel", items: [] },
      { slot: "Avondeten", name: "Snelle kipcurry 🍛", items: ["150 g kip", "100 g rijst", "300 g groenten", "wortel", "½ ui", "100 g yoghurt", "kerrie/kruiden"], time: "±25 min", note: "Maak eventueel 2 porties." },
    ],
  },
  {
    day: "Woensdag",
    meals: [
      { slot: "Ontbijt", name: "Yoghurt + muesli + fruit", items: ["200 g yoghurt", "40 g muesli", "banaan of druiven"] },
      { slot: "Lunch", name: "Tonijnsandwich 🐟", items: ["½ blik tonijn", "2–3 boterhammen", "komkommer", "tomaat", "beetje magere verse kaas/yoghurt"] },
      { slot: "Snack", name: "Fruit", items: [] },
      { slot: "Avondeten", name: "Gigantische groentesoep 🍲", items: ["500 g aardappelen", "200 g wortel", "½ ui", "witte kool", "½ blik kikkererwten", "200–300 g diepvriesgroenten", "250 g passata", "bouillon", "water", "kruiden"], time: "±35 min", note: "Maak 2–3 porties." },
    ],
  },
  {
    day: "Donderdag",
    meals: [
      { slot: "Ontbijt", name: "Muesli bowl", items: ["200 g yoghurt", "50 g muesli", "banaan", "paar druiven"] },
      { slot: "Lunch", name: "Rest groentesoep", items: ["2 boterhammen"] },
      { slot: "Snack", name: "Appel + wortel", items: [] },
      { slot: "Avondeten", name: "Crispy potato & chickpea bowl 🥔", items: ["600 g aardappelen", "½–1 blik kikkererwten", "witte kool", "wortel", "maïs", "tomaat", "75 g yoghurt", "kruiden"], time: "±30 min", note: "Aardappelen en kikkererwten krokant bakken/roosteren." },
    ],
  },
];

const KCAL = [
  ["Ontbijt", "±200–350 kcal", "Klein maar eiwitrijk"],
  ["Lunch", "±250–450 kcal", "Nog steeds relatief klein"],
  ["Snack", "±50–200 kcal", "Fruit/groente"],
  ["Avondeten", "±600–900 kcal", "Hier zit het volume"],
];

const REUSE = [
  ["Yoghurt", "ontbijt → sauzen → curry → loaded potatoes"],
  ["Muesli", "vrijwel iedere ochtend"],
  ["Eieren", "ontbijt → omelet → fried rice"],
  ["Kip", "wraps → curry"],
  ["Linzen", "bolognese"],
  ["Kikkererwten", "soep → bowl"],
  ["Kidneybonen", "loaded potatoes"],
  ["Aardappelen", "loaded potatoes → soep → bowl"],
  ["Diepvriesgroenten", "wraps → fried rice → curry → soep"],
  ["Wortel/ui/kool", "bijna de hele week door"],
  ["Fruit", "ontbijt + snacks"],
];

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