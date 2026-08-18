import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const MID = "#94925d", LIGHT = "#d8dab3", URG = "#d5e24a", DEEP = "#595f34";
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const COLOR = { focus: MID, life: LIGHT, self: "#6b6a4a", urgent: URG, default: DEEP };

export default function WeekView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState((new Date().getDay() + 6) % 7 + 1);

  useEffect(() => {
    base44.entities.CalendarEvent.list("start").then(data => setEvents(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = (new Date().getDay() || 7);
  const pct = Math.round((today - 1) / 6 * 100);

  const weekTasks = useMemo(() => {
    const now = new Date();
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return events.map(e => {
      const d = new Date(e.start);
      const day = ((d.getDay() + 6) % 7) + 1;
      return { day, t: d.toTimeString().slice(0, 5), dur: e.end ? Math.max(0.5, (new Date(e.end) - d) / 3600000) : 1, title: e.title, cat: e.domain || "default" };
    }).filter(t => t.day >= 1 && t.day <= 7);
  }, [events]);

  const selTasks = weekTasks.filter(t => t.day === sel);

  return (
    <PreviewShell index="12" section="WEEK" statement={`WEEK ${Math.ceil((new Date().getDate() + ((new Date().getDay() + 6) % 7)) / 7)}`} kicker={`${DAYS[(new Date().getDay() + 6) % 7]} ${new Date().getDate()}`} accent={URG}
      context={[
        { label: "VERLOPEN", text: `${pct}% van de week al gepasseerd.` },
        { label: "BELASTING", text: weekTasks.length ? `${DAYS[(weekTasks.reduce((max, t) => weekTasks.filter(x => x.day === t.day).length > weekTasks.filter(x => x.day === max.day).length ? t.day : max.day, weekTasks[0]).day) - 1]} is de drukste dag.` : "Geen afspraken." },
        { label: "VRIJ", text: DAYS.filter((_, i) => !weekTasks.some(t => t.day === i + 1)).length > 0 ? `${DAYS.filter((_, i) => !weekTasks.some(t => t.day === i + 1)).join(", ")} grotendeels open.` : "Geen vrije dagen." },
      ]}
      actions={[{ label: "Today", primary: true, onClick: () => setSel(today) }, { label: "Prev", onClick: () => setSel(s => Math.max(1, s - 1)) }, { label: "Next", onClick: () => setSel(s => Math.min(7, s + 1)) }, { label: "Open Weekplanning", to: "/planning" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={pct} size={150} color={MID} label={`${pct}%`} sub="WEEK VERLOPEN" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">LEGENDA</p>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: MID }} />Focus</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: LIGHT }} />Life</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: "#6b6a4a" }} />Self</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: URG }} />Belangrijk</span>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3 text-center">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">NU</p>
            <p className="text-urgent text-xl font-bold tabular-nums mt-1">{new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
            {DAYS.map((d, i) => {
              const day = i + 1;
              const tasks = weekTasks.filter(t => t.day === day);
              const load = Math.min(100, tasks.reduce((s, t) => s + t.dur, 0) / 8 * 100);
              const isToday = day === today;
              return (
                <button key={d} onClick={() => setSel(day)} className={`flex flex-col rounded-2xl border p-2 transition-colors ${sel === day ? "border-sand bg-marble/10" : "border-marble/20 bg-marble/5 hover:bg-marble/8"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] tracking-wider ${isToday ? "text-urgent" : "text-storm/70"}`}>{d}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-urgent" />}
                  </div>
                  <div className="relative flex-1 min-h-0 rounded-lg bg-marble/5 overflow-hidden">
                    {tasks.map((t, idx) => {
                      const sh = parseInt(t.t.split(":")[0]), sm = parseInt(t.t.split(":")[1]);
                      const top = ((sh + sm / 60 - 8) / 13) * 100;
                      const h = (t.dur / 13) * 100;
                      return (
                        <div key={idx} className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-[8px] text-storm leading-tight overflow-hidden" style={{ top: `${top}%`, height: `${h}%`, background: `${(COLOR[t.cat] || COLOR.default)}55`, borderLeft: `2px solid ${COLOR[t.cat] || COLOR.default}` }}>
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-marble/10 overflow-hidden">
                    <div className="h-full transition-all duration-700" style={{ width: `${load}%`, background: MID }} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">{DAYS[sel - 1]} · {selTasks.length} TAKEN</p>
            <div className="flex flex-wrap gap-2">
              {selTasks.map((t, i) => (
                <span key={i} className="flex items-center gap-2 rounded-full border border-marble/20 bg-marble/5 px-3 py-1 text-[11px] text-storm">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLOR[t.cat] || COLOR.default }} />{t.t} {t.title}
                </span>
              ))}
              {selTasks.length === 0 && <span className="text-storm/40 text-xs">Geen taken — vrije dag.</span>}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}