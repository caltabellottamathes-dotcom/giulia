import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { Plus, CalendarPlus, CheckSquare, Briefcase } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";

/** Hobbies panel — hobby's als ankerpunt; activiteiten/taken/projecten
 *  schrijven naar de centrale CalendarEvent/Task/Project met domain='life'. */
export default function HobbiesPreview() {
  const navigate = useNavigate();
  const { closeModule } = usePanel();
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    try { const data = await base44.entities.Hobby.list().catch(() => []); setHobbies(data || []); } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (hobbies || []).filter((h) => h.status !== "inactive"), [hobbies]);

  const addHobby = async () => {
    if (!title.trim()) return;
    try { await base44.entities.Hobby.create({ title: title.trim(), category: category || undefined, status: "active" }); setTitle(""); setCategory(""); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const open = (h) => { closeModule(); navigate(`/life/hobbies/${h.id}`); };
  const addActivity = async (h) => {
    const start = new Date(Date.now() + 86400000); start.setHours(19, 0, 0, 0);
    try { await base44.entities.CalendarEvent.create({ title: `${h.title}`, start: start.toISOString(), end: new Date(start.getTime() + 2 * 3600000).toISOString(), domain: "life", status: "tentative" }); await base44.entities.Hobby.update(h.id, { last_activity_date: new Date().toISOString() }); } catch { /* ignore */ }
  };
  const addTask = async (h) => { try { await base44.entities.Task.create({ title: `${h.title} — oefenen`, domain: "life", status: "today", priority: "medium" }); } catch { /* ignore */ } };
  const addProject = async (h) => { try { const p = await base44.entities.Project.create({ title: `${h.title} project`, domain: "life", status: "in_progress" }); await base44.entities.Hobby.update(h.id, { linked_project_id: p.id }); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Hobby's</SectionLabel>
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-charcoal transition" style={{ background: BLUE }}><Plus className="w-3.5 h-3.5" /> Hobby</button>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-3 animate-fade-up">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hobby (bv. gitaar, schilderen)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categorie (optioneel)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <button onClick={addHobby} disabled={!title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}

      {loading ? <Empty text="Laden…" /> : active.length ? (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 -mr-1">
          {active.map((h) => (
            <Card key={h.id} accent={BLUE} onClick={() => open(h)}>
              <p className="text-sm font-medium text-ivory">{h.title}</p>
              {h.category && <p className="text-[11px] text-ivory/45 mt-0.5">{h.category}</p>}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <ActionBtn label="Activiteit" icon={CalendarPlus} onClick={(e) => { e.stopPropagation?.(); addActivity(h); }} />
                <ActionBtn label="Taak" icon={CheckSquare} onClick={() => addTask(h)} />
                <ActionBtn label="Project" icon={Briefcase} onClick={() => addProject(h)} />
                {h.linked_project_id && <span className="ml-auto text-[10px] text-ivory/40">heeft project</span>}
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty text="Nog geen hobby's" />}

      <div className="rounded-2xl glass-card-2 p-4">
        <SectionLabel>Giulia</SectionLabel>
        <p className="text-sm text-ivory/80 mt-2 leading-relaxed" style={{ color: SAND }}>
          {active.length ? "Wat jou energie geeft verdient ook plek in je week. Plan één vast moment — het wordt sneller een gewoonte dan je denkt." : "Voeg een hobby toe — Giulia helpt er vaste tijd voor vrij te maken."}
        </p>
      </div>
    </div>
  );
}