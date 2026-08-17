/**
 * planFoodWeek — de Smart Food Planner van GIULIA (LIFE · FOOD).
 *
 * Maakt een complete 7-daagse eetplanning op basis van:
 *   - persoonlijk Food Profile (budget, personen, maaltijden, voorkeuren, kookvoorkeuren, prioriteiten)
 *   - eerdere weken + eetgeschiedenis (wat at hij, wat sloeg hij over, favorieten)
 *   - huidige Household-voorraad en geplande boodschappen
 *   - realistische Albert Heijn-producten en -prijzen (modelkennis)
 *
 * Eén aanroep naar geminiDecide (BYOK Gemini, response_schema) levert gestructureerde
 * JSON. Vervolgens worden een FoodWeek, Meal-records en (ge deupliceerde) Recipe-
 * records aangemaakt. retourneert een samenvatting voor de UI.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { geminiDecide } from "../../shared/gemini.ts";

const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DEFAULT_TIMES = { breakfast: "08:30", lunch: "12:30", snack: "15:30", dinner: "19:00" };

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

function mondayOf(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0 = monday
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayKeyFor(dateStr: string): string {
  const dow = new Date(dateStr + "T00:00:00").getDay();
  return DAY_KEYS[(dow + 6) % 7];
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // 1) Food Profile (eerste record, anders defaults)
    const profiles = await sr.entities.FoodProfile.list().catch(() => []);
    const profile = profiles[0] || {
      weekly_budget: 50, people: 2, meals: MEAL_TYPES,
      likes: [], dislikes: [], favourites: [], cuisines: [],
      min_cook_time: null, max_cook_time: null, quick_meals_per_week: 3,
      batch_cooking: false, meal_prep: false, use_leftovers: true,
      priorities: ["budget", "variety", "convenience"],
    };

    // 2) Historie — laatste 4 weken + hun maaltijden
    const weeks = await sr.entities.FoodWeek.list("-date_start", 6).catch(() => []);
    const recentWeeks = weeks.slice(0, 4);
    let historyMeals = [];
    if (recentWeeks.length) {
      const weekIds = new Set(recentWeeks.map((w) => w.id));
      const allMeals = await sr.entities.Meal.list("-date", 200).catch(() => []);
      historyMeals = allMeals.filter((m) => weekIds.has(m.week_id));
    }
    const eaten = historyMeals.filter((m) => m.status === "eaten" || m.status === "favourite");
    const skipped = historyMeals.filter((m) => m.status === "skipped");
    const favCounts: Record<string, number> = {};
    eaten.forEach((m) => { favCounts[m.recipe_name] = (favCounts[m.recipe_name] || 0) + 1; });
    const skipCounts: Record<string, number> = {};
    skipped.forEach((m) => { skipCounts[m.recipe_name] = (skipCounts[m.recipe_name] || 0) + 1; });
    const top = (obj: Record<string, number>, n = 5) =>
      Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([n2, c]) => `${n2} (${c}x)`).join(", ") || "geen";

    // 3) Household — huidige voorraad + geplande boodschappen
    const household = await sr.entities.HouseholdItem.list().catch(() => []);
    const inventory = household
      .filter((h) => h.kind === "item" || h.kind === "shopping")
      .map((h) => `- ${h.title}${h.status ? ` (${h.status})` : ""}`)
      .join("\n");

    // 4) Weekrange — plan de eerstvolgende week die nog niet bestaat
    //    (de maandag ná de laatste bestaande week, anders deze maandag).
    let start = mondayOf(new Date());
    if (weeks.length) {
      const latestEnd = weeks
        .map((w) => new Date(w.date_end + "T00:00:00").getTime())
        .reduce((acc, t) => (t > acc ? t : acc), 0);
      if (latestEnd >= Date.now()) {
        const after = new Date(latestEnd);
        after.setDate(after.getDate() + 1);
        start = mondayOf(after);
      }
    }
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const dateStart = fmt(start);
    const dateEnd = fmt(end);
    const weekNumber = isoWeek(start);
    const year = start.getFullYear();

    // 5) Prompt
    const mealsWanted = profile.meals && profile.meals.length ? profile.meals : MEAL_TYPES;
    const prompt =
      `Je bent Giulia's Smart Food Planner. Maak een complete 7-daagse eetplanning voor de week van ${dateStart} t/m ${dateEnd}.\n\n` +
      `PERSOONLIJK PROFIEL:\n` +
      `- Budget: €${profile.weekly_budget} per week\n` +
      `- Personen: ${profile.people}\n` +
      `- Maaltijden per dag: ${mealsWanted.join(", ")}\n` +
      `- Voorkeuren (likes): ${(profile.likes || []).join(", ") || "geen"}\n` +
      `- Niet gewenst (dislikes): ${(profile.dislikes || []).join(", ") || "geen"}\n` +
      `- Favorieten: ${(profile.favourites || []).join(", ") || "geen"}\n` +
      `- Keukens: ${(profile.cuisines || []).join(", ") || "geen"}\n` +
      `- Kooktijd: ${profile.min_cook_time || "geen min"} – ${profile.max_cook_time || "geen max"} min\n` +
      `- Quick meals deze week: ${profile.quick_meals_per_week ?? 3}\n` +
      `- Batch cooking: ${profile.batch_cooking ? "ja" : "nee"}\n` +
      `- Restanten hergebruiken: ${profile.use_leftovers ? "ja" : "nee"}\n` +
      `- Prioriteiten: ${(profile.priorities || []).join(", ")}\n\n` +
      `HUIDIGE VOORRAAD (Household):\n${inventory || "(niets geregistreerd)"}\n\n` +
      `EERDERE ERVARING (laatste ${recentWeeks.length} weken):\n` +
      `- Gegeten maaltijden: ${eaten.length}\n` +
      `- Overgeslagen maaltijden: ${skipped.length}\n` +
      `- Meest gegeten: ${top(favCounts)}\n` +
      `- Vaak overgeslagen: ${top(skipCounts)}\n\n` +
      `INSTRUCTIES:\n` +
      `- Plan 7 dagen (ma t/m zo). Geef per dag elke maaltijd uit: ${mealsWanted.join(", ")}.\n` +
      `- Gebruik realistische Albert Heijn-producten en actuele Nederlandse supermarktprijzen (€).\n` +
      `- Houd het TOTALE budget van €${profile.weekly_budget} aan. total_cost = som van alle maaltijdkosten.\n` +
      `- Geef per maaltijd: name, meal_type, time (HH:MM), servings (${profile.people}), prep_time, cook_time, total_time (minuten), cost (€), cuisine, ingredients (met name, amount, unit, supermarket_product, package, price), method (stap-voor-stap).\n` +
      `- Varieer ingrediënten en keukens over de week. Hergebruik ingrediënten over meerdere maaltijden.\n` +
      `- Benut favorieten; vermijd vaak-overgeslagen maaltijden.\n` +
      `- Houd rekening met de huidige voorraad uit Household.\n` +
      `- Markeer maaltijden met total_time ≤ 20 min als quick.\n\n` +
      `Geef UITSLUITEND geldige JSON volgens het schema, in het Nederlands.`;

    const schema = {
      type: "object",
      properties: {
        total_cost: { type: "number" },
        promotions_used: { type: "number" },
        summary: { type: "string" },
        meals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              day: { type: "string" },
              meal_type: { type: "string" },
              name: { type: "string" },
              time: { type: "string" },
              servings: { type: "number" },
              prep_time: { type: "number" },
              cook_time: { type: "number" },
              total_time: { type: "number" },
              cost: { type: "number" },
              cuisine: { type: "string" },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    amount: { type: "number" },
                    unit: { type: "string" },
                    supermarket_product: { type: "string" },
                    package: { type: "string" },
                    price: { type: "number" },
                  },
                },
              },
              method: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      required: ["total_cost", "meals"],
    };

    const plan = await geminiDecide({
      prompt,
      schema,
      systemText: "Je bent Giulia's Smart Food Planner. Je output uitsluitend geldige JSON volgens het gevraagde schema, in het Nederlands.",
      temperature: 0.5,
      keyName: "BACKDESK_GEMINI_API_KEY",
    });

    if (!plan || !Array.isArray(plan.meals) || !plan.meals.length) {
      return Response.json({ error: "Plannen mislukt — geen geldige planning ontvangen." }, { status: 502 });
    }

    // 6) FoodWeek aanmaken
    const mealsCount = plan.meals.length;
    const quickMeals = plan.meals.filter((m) => (m.total_time || 0) <= 20).length;
    const week = await base44.entities.FoodWeek.create({
      week_number: weekNumber,
      year,
      date_start: dateStart,
      date_end: dateEnd,
      budget: profile.weekly_budget,
      total_cost: Number(plan.total_cost || 0),
      status: "planned",
      meals_count: mealsCount,
      promotions_count: Number(plan.promotions_used || 0),
      quick_meals: quickMeals,
      batch_meals: 0,
      summary: plan.summary || `Week ${weekNumber}: ${mealsCount} maaltijden · €${Number(plan.total_cost || 0).toFixed(2)}`,
    });

    // 7) Meals + Recipes (gedeupliceerd op naam)
    const existingRecipes = await sr.entities.Recipe.list().catch(() => []);
    const recipeByName = new Map(existingRecipes.map((r) => [String(r.name).toLowerCase(), r.id]));

    let created = 0;
    for (const m of plan.meals) {
      const mealDate = m.date || dateStart;
      let recipeId = recipeByName.get(String(m.name || "").toLowerCase());
      if (!recipeId && m.name) {
        const r = await base44.entities.Recipe.create({
          name: m.name,
          meal_type: m.meal_type,
          cuisine: m.cuisine || "",
          ingredients: m.ingredients || [],
          method: m.method || [],
          servings: m.servings || profile.people,
          prep_time: m.prep_time || 0,
          cook_time: m.cook_time || 0,
          total_time: m.total_time || 0,
          cost: m.cost || 0,
          times_eaten: 0,
          rating: "",
        }).catch(() => null);
        if (r) {
          recipeByName.set(String(m.name).toLowerCase(), r.id);
          recipeId = r.id;
        }
      }
      const meal = await base44.entities.Meal.create({
        week_id: week.id,
        date: mealDate,
        day: dayKeyFor(mealDate),
        meal_type: m.meal_type,
        recipe_id: recipeId || "",
        recipe_name: m.name,
        time: m.time || DEFAULT_TIMES[m.meal_type] || "12:00",
        servings: m.servings || profile.people,
        cost: m.cost || 0,
        prep_time: m.prep_time || 0,
        cook_time: m.cook_time || 0,
        total_time: m.total_time || 0,
        status: "planned",
        ingredients: m.ingredients || [],
        method: m.method || [],
        cuisine: m.cuisine || "",
        rating: "",
      }).catch(() => null);
      if (meal) created++;
    }

    // 8) Activity
    try {
      await base44.entities.Activity.create({
        action: "food_week_planned",
        description: `Food week ${weekNumber} gepland · ${created} maaltijden · €${Number(plan.total_cost || 0).toFixed(2)}`,
        source: "planFoodWeek",
        timestamp: new Date().toISOString(),
        domain: "life",
      });
    } catch { /* ignore */ }

    return Response.json({
      ok: true,
      week_id: week.id,
      week_number: weekNumber,
      total_cost: Number(plan.total_cost || 0),
      budget: profile.weekly_budget,
      meals_count: created,
      promotions: Number(plan.promotions_used || 0),
      quick_meals: quickMeals,
    });
  } catch (e) {
    return Response.json({ error: String((e && e.message) || e) }, { status: 500 });
  }
}