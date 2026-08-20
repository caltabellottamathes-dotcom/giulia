import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { useEntityList } from "@/hooks/useEntity";
import { mealsForWeek, weekDays, localTodayStr } from "@/lib/foodUtils";
import FoodProfileCard from "./FoodProfileCard";
import FoodWeekHero from "./FoodWeekHero";
import FoodWeekTimeline from "./FoodWeekTimeline";
import RecipeView from "@/life/components/RecipeView";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { Utensils, Zap, Layers, Tag } from "lucide-react";

/** TAB 1 — DEZE WEEK. Editorial compositie in SELF-galerij stijl:
 *  profiel · foto-hero met geanimeerde budget-ring + count-ups · stat-pills
 *  · interactieve week-tijdlijn met pulserende vandaag-mijlpaal + maaltijd-stappen. */
export default function ThisWeekTab({ week, meals, reload }) {
  const { data: profiles } = useEntityList("FoodProfile", { realtime: true });
  const profile = profiles[0];
  const [selected, setSelected] = useState(null);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

  if (!week) {
    return (
      <GlassPanel level={1} className="p-10 text-center">
        <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nog geen week actief. Ga naar de <b>Giulia</b>-tab om een nieuwe week te plannen.</p>
      </GlassPanel>
    );
  }

  const days = weekDays(week);
  const todayStr = localTodayStr();

  return (
    <div className="space-y-4">
      <FoodProfileCard profile={profile} />

      <FoodWeekHero week={week} weekMeals={weekMeals} />

      {/* stat pills */}
      <div className="flex flex-wrap gap-2">
        <Pill icon={Zap} label="quick" value={week.quick_meals} color={SAND_DEEP} />
        <Pill icon={Layers} label="batch" value={week.batch_meals} color={PLUM} />
        <Pill icon={Tag} label="aanbieding" value={week.promotions_count} color={SAND_DEEP} />
      </div>

      <FoodWeekTimeline days={days} weekMeals={weekMeals} todayStr={todayStr} onSelect={setSelected} />

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reload(); }} />}
    </div>
  );
}

function Pill({ icon: Icon, label, value, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold" style={{ background: `${color}1f`, color }}>
      <Icon className="h-3.5 w-3.5" /> {value} {label}
    </span>
  );
}