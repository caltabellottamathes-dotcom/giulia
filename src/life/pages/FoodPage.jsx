import React, { useMemo, useState } from "react";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { Utensils, CalendarDays, CheckCircle2, CalendarClock, Sparkles } from "lucide-react";
import ThisWeekTab from "@/life/food/ThisWeekTab";
import PlanningTab from "@/life/food/PlanningTab";
import TrackingTab from "@/life/food/TrackingTab";
import NextWeekTab from "@/life/food/NextWeekTab";
import GiuliaTab from "@/life/food/GiuliaTab";
import { SAND } from "@/life/food/lifeColors";

const TABS = [
  { id: "deze", label: "Deze week", icon: Utensils },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "tracking", label: "Tracking", icon: CheckCircle2 },
  { id: "volgende", label: "Volgende week", icon: CalendarClock },
  { id: "giulia", label: "Giulia", icon: Sparkles },
];

export default function FoodPage() {
  const learnTick = useLearningSync();
  const { data: weeks, reload: reloadWeeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals, reload: reloadMeals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });
  const [tab, setTab] = useState("deze");

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const thisWeek = useMemo(
    () => weeks.find((w) => w.date_start && w.date_end && new Date(w.date_start) <= today && new Date(w.date_end) >= today) || null,
    [weeks, today]
  );
  const nextWeek = useMemo(
    () => weeks.filter((w) => (w.status === "planned" || w.status === "active") && new Date(w.date_start) > today).sort((a, b) => new Date(a.date_start) - new Date(b.date_start))[0] || null,
    [weeks, today]
  );
  const reload = () => { reloadWeeks(); reloadMeals(); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-food" image={IMAGES.lifeFood} icon={Utensils} eyebrow="LIFE · FOOD" title="Food Planner" subtitle="Wat eet je deze week — binnen budget, op basis van wat je hebt en wat je lekker vindt" />

      {/* Tabs — LIFE-stijl */}
      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${tab === t.id ? "text-charcoal" : "text-foreground/55 hover:text-foreground"}`} style={tab === t.id ? { background: SAND } : {}}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "deze" && <ThisWeekTab week={thisWeek} meals={meals} reload={reload} />}
      {tab === "planning" && <PlanningTab week={thisWeek} meals={meals} reload={reload} />}
      {tab === "tracking" && <TrackingTab week={thisWeek} meals={meals} reload={reload} />}
      {tab === "volgende" && <NextWeekTab week={nextWeek} meals={meals} />}
      {tab === "giulia" && <GiuliaTab weeks={weeks} reload={reload} goToTab={setTab} />}
    </div>
  );
}