import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassButton from "@/system/components/glass/GlassButton";
import { Heart, Sparkles, CalendarHeart, Clock } from "lucide-react";

const ACTIONS = [
  { key: "moment", label: "Moment", icon: Heart, entity: "SocialMoment" },
  { key: "intention", label: "Intention", icon: Sparkles, entity: "SocialIntention" },
  { key: "plan", label: "Plan", icon: CalendarHeart, entity: "SocialPlan" },
  { key: "time", label: "Time", icon: Clock, entity: "PersonalTimeBlock" },
];

/** QuickAddBar — §1.9 quick management, inline creation without leaving Overview. */
export default function QuickAddBar({ reload }) {
  const [open, setOpen] = useState(null);
  const [value, setValue] = useState("");

  const submit = async (action) => {
    if (!value.trim()) return;
    const now = new Date().toISOString();
    const payloads = {
      SocialMoment: { title: value.trim(), occurred_at: now },
      SocialIntention: { description: value.trim() },
      SocialPlan: { activity: value.trim(), status: "proposed" },
      PersonalTimeBlock: { title: value.trim(), type: "free", start: now, duration_min: 30 },
    };
    await base44.entities[action.entity].create(payloads[action.entity]);
    setValue(""); setOpen(null); await reload();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((a) => (
        <div key={a.key} className="relative">
          <GlassButton size="sm" onClick={() => { setOpen(open === a.key ? null : a.key); setValue(""); }}>
            <a.icon className="w-3.5 h-3.5" /> Add {a.label}
          </GlassButton>
          {open === a.key && (
            <div className="absolute z-20 top-full mt-2 left-0 w-56 glass-3 rounded-xl p-2.5 flex gap-1.5">
              <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit(a)}
                placeholder={`New ${a.label.toLowerCase()}…`} className="flex-1 rounded-lg glass-1 px-2.5 py-1.5 text-xs outline-none" />
              <button onClick={() => submit(a)} className="text-[10px] uppercase font-semibold text-olive shrink-0">Add</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}