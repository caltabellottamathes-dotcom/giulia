import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { IMAGES } from "@/lib/images";
import { hobbyGroups, hobbyHeadline, statusLine, hobbyState, hobbyRhythm, fmtDaysAgo, stateColor } from "@/lib/hobbyUtils";
import { Plus, CalendarPlus, Briefcase, Sparkles, Clock } from "lucide-react";

const BLUE = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand-deep))";

const TYPES = ["music", "creative", "cultural", "sport", "learning", "collecting", "other"];

/** Hobbies paneel — 4 secties: Currently Alive, What you've been into,
 *  Quiet but alive, Quick actions + Add-hobby flow. */
export default function HobbiesPreview() {
  const navigate = useNavigate();
  const [hobbies, setHobbies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "creative", current_thread: "" });

  const load = async () => {
    try {
      const [h, e] = await Promise.all([base44.entities.Hobby.list("-last_activity_date").catch(() => []), base44.entities.CalendarEvent.list("start").catch(() => [])]);
      setHobbies(h || []); setEvents(e || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const g = useMemo(() => hobbyGroups(hobbies), [hobbies]);
  const headline = hobbyHeadline(g);
  const line = statusLine(g);
  const rhythm = useMemo(() => hobbyRhythm(events), [events]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.Hobby.create({ title: form.title.trim(), type: form.type, current_thread: form.current_thread || undefined, status: "active", activity_level: "active" }); setForm({ title: "", type: "creative", current_thread: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const open = (h) => navigate(`/life/hobbies/${h.id}`);
  const logActivity = async (h) => { try { await base44.entities.Hobby.update(h.id, { last_activity_date: new Date().toISOString(), activity_level: "active" }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Hobby's</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{line}</p>
      </div>

      {/* 01 — CURRENTLY ALIVE */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">01 · Nu levend</p>
        {g.active.length ? (
          <div className="flex flex-col gap-2.5">
            {g.active.slice(0, 4).map((h) => (
              <Card key={h.id} accent={BLUE} onClick={() => open(h)}>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden">
                    <img src={h.image || IMAGES.lifeHobbies} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{h.title}</p>
                    <p className="text-[11px] text-ivory/45">{h.current_thread || "actief"} · {fmtDaysAgo(h.last_activity_date)}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: stateColor("active") }}>Active</span>
                </div>
              </Card>
            ))}
          </div>
        ) : <Empty text="Niets nu actief." />}
      </div>

      {/* 02 — WHAT YOU'VE BEEN INTO */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">02 · Waar je mee bezig was</p>
        <div className="glass-card-2 rounded-2xl p-4 flex items-end justify-between gap-2 overflow-x-auto">
          {rhythm.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[44px]">
              <span className={`text-[9px] uppercase tracking-wide font-semibold ${d.label === "—" ? "text-ivory/25" : "text-ivory/70"}`}>{d.label === "—" ? "—" : d.label.split(" ")[0]}</span>
              <span className="w-2 rounded-full" style={{ height: d.label === "—" ? 6 : 34, background: d.label === "—" ? "rgba(255,255,255,0.12)" : BLUE }} />
              <span className="text-[9px] uppercase tracking-wide text-ivory/45 font-semibold">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 03 — QUIET BUT ALIVE */}
      {g.quiet.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">03 · Stil, maar levend</p>
          <div className="flex flex-col gap-1.5">
            {g.quiet.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center justify-between glass-card-2 rounded-xl px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{h.title}</p>
                  <p className="text-[11px] text-ivory/40">{fmtDaysAgo(h.last_activity_date)}</p>
                </div>
                <button onClick={() => logActivity(h)} className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: SAND }}>Reactiveer</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 04 — QUICK ACTIONS */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">04 · Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Hobby" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Log" icon={CalendarPlus} onClick={() => g.active[0] && logActivity(g.active[0])} />
          <ActionBtn label="Projecten" icon={Briefcase} onClick={() => navigate("/life/hobbies?tab=projects")} />
          <ActionBtn label="Giulia" icon={Sparkles} onClick={() => navigate("/chat")} />
          <ActionBtn label="Verken" icon={Clock} onClick={() => navigate("/life/hobbies?tab=explore")} />
        </div>
      </div>

      {/* ADD HOBBY */}
      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Hobby (bv. muziek, fotografie)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-2.5 py-2 text-xs text-ivory outline-none capitalize">
              {TYPES.map((t) => <option key={t} value={t} className="text-charcoal">{t}</option>)}
            </select>
            <input value={form.current_thread} onChange={(e) => setForm((f) => ({ ...f, current_thread: e.target.value }))} placeholder="Waar je nu mee bezig bent" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: "hsl(var(--life-blue))" }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}