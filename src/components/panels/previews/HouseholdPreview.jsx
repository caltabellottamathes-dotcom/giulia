import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { Plus, Check, CalendarPlus } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";

const today = () => new Date().toLocaleDateString("sv-SE");

/** Household panel — huishoudtaken (Tasks domain=life, category=household). */
export default function HouseholdPreview() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      const [t, e] = await Promise.all([
        base44.entities.Task.list("deadline").catch(() => []),
        base44.entities.CalendarEvent.list("start").catch(() => []),
      ]);
      setTasks(t || []); setEvents(e || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const household = useMemo(
    () => (tasks || []).filter((t) => t.domain === "life" && t.category === "household" && t.status !== "completed" && t.status !== "archived"),
    [tasks]
  );
  const todayUpcoming = household.filter((t) => t.deadline === today() || t.deadline === new Date(Date.now() + 86400000).toLocaleDateString("sv-SE"));

  const complete = async (t) => { try { await base44.entities.Task.update(t.id, { status: "completed" }); await load(); } catch { /* ignore */ } };
  const addTask = async (cat = "household") => {
    if (!title.trim()) return;
    try { await base44.entities.Task.create({ title: title.trim(), domain: "life", category: cat, status: "today", priority: "medium" }); setTitle(""); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const planMaintenance = async () => {
    if (!title.trim()) return;
    const start = new Date(Date.now() + 2 * 86400000); start.setHours(10, 0, 0, 0);
    try { await base44.entities.CalendarEvent.create({ title: title.trim(), start: start.toISOString(), end: new Date(start.getTime() + 2 * 3600000).toISOString(), domain: "life" }); setTitle(""); await load(); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Huishouden</SectionLabel>
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-charcoal transition" style={{ background: BLUE }}><Plus className="w-3.5 h-3.5" /> Toevoegen</button>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-3 animate-fade-up">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Taak of boodschap…" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addTask("household")} className="rounded-full glass-button px-3 py-1.5 text-xs text-ivory">Huishoudtaak</button>
            <button onClick={() => addTask("grocery")} className="rounded-full glass-button px-3 py-1.5 text-xs text-ivory">Boodschap</button>
            <button onClick={planMaintenance} className="inline-flex items-center gap-1.5 rounded-full glass-button px-3 py-1.5 text-xs text-ivory"><CalendarPlus className="w-3.5 h-3.5" /> Onderhoud plannen</button>
          </div>
        </div>
      )}

      {todayUpcoming.length > 0 && (
        <p className="text-[11px] font-semibold" style={{ color: SAND }}>{todayUpcoming.length} vandaag/morgen</p>
      )}

      {loading ? <Empty text="Laden…" /> : household.length ? (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 -mr-1">
          {household.map((t) => (
            <Card key={t.id} accent={t.deadline === today() ? SAND : BLUE}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ivory flex-1 truncate">{t.title}</p>
                {t.category === "grocery" && <span className="text-[9px] uppercase tracking-wide text-ivory/40">boodschap</span>}
              </div>
              {t.deadline && <p className="text-[11px] text-ivory/45 mt-0.5">t/m {t.deadline}</p>}
              <div className="mt-2 flex items-center gap-2">
                <ActionBtn label="Afronden" icon={Check} onClick={() => complete(t)} />
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty text="Huis is op orde" />}
    </div>
  );
}