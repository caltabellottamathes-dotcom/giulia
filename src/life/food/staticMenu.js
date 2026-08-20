/* ── Vaste boodschappenlijst + 7-daags menu (± €50, ALDI België) ──
   Enige bron van waarheid voor FoodPage, FoodWidget, FoodPreview en
   de Huishouden "Boodschappen"-tab. */

export const TOTAL_BUDGET = 50;

export const CATEGORIES = [
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

export const CUT_LIST = [
  "tweede blik kidneybonen",
  "tweede blik kikkererwten",
  "extra mozzarella",
  "tweede soort pasta",
];

export const WEEK = [
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

export const KCAL = [
  ["Ontbijt", "±200–350 kcal", "Klein maar eiwitrijk"],
  ["Lunch", "±250–450 kcal", "Nog steeds relatief klein"],
  ["Snack", "±50–200 kcal", "Fruit/groente"],
  ["Avondeten", "±600–900 kcal", "Hier zit het volume"],
];

export const REUSE = [
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

/** Totaal aantal maaltijden in het weekmenu. */
export const weekMealCount = WEEK.reduce((n, d) => n + d.meals.length, 0);

/** Index in WEEK voor de huidige weekdag (Vrijdag=0 … Donderdag=6). */
export function todayIndex() {
  const day = new Date().getDay(); // 0=zo … 6=za
  return (day - 5 + 7) % 7;
}

/** De avondmaaltijd van vandaag. */
export function todaysDinner() {
  return WEEK[todayIndex()]?.meals.find((m) => m.slot === "Avondeten");
}