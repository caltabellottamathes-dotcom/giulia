import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { hobbyGroups, hobbyHeadline, statusLine, hobbyRhythm, fmtDaysAgo } from "@/lib/hobbyUtils";
import { Plus, CalendarPlus } from "lucide-react";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const TYPES = ["music", "creative", "cultural", "sport", "learning", "collecting", "other"];

export default function HobbiesPreview({ onOpen }) {
  const [hobbies, setHobbies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "creative", current_thread: "" });

  const load = async () => { try { const [h, e] = await Promise.all([base44.entities.Hobby.list("-last_activity_date").catch(() => []), base44.entities.CalendarEvent.list("start").catch(() => [])]); setHobbies(h || []); setEvents(e || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const g = useMemo(() => hobbyGroups(hobbies), [hobbies]);
  const headline = hobbyHeadline(g);
  const rhythm = useMemo(() => hobbyRhythm(events), [events]);

  const add = async () => { if (!form.title.trim()) return; try { await base44.entities.Hobby.create({ title: form.title.trim(), type: form.type, current_thread: form.current_thread || undefined, status: "active", activity_level: "active" }); setForm({ title: "", type: "creative", current_thread: "" }); setShowAdd(false); await load(); } catch { /* ignore */ } };
  const logActivity = async (h) => { try { await base44.entities.Hobby.update(h.id, { last_activity_date: new Date().toISOString(), activity_level: "active" }); await load(); } catch { /* ignore */ } };

  return (
    <PreviewShell index="22" section="HOBBY'S" statement={headline.toUpperCase()} kicker={`${g.active.length} NU LEVEND`} accent={LIGHT}
      context={[
        { label: "ACTIEF", text: `${g.active.length} hobby's zijn nu levend.` },
        { label: "STIL", text: g.quiet.length ? `${g.quiet.length} hobby's wachten op heractivering.` : "Geen stille hobby's." },
        { label: "RITME", text: rhythm.some(d => d.label !== "—") ? "Je hebt deze week actief geweest." : "Nog geen activiteit deze week." },
      ]}
      actions={[{ label: "New Hobby", primary: true, onClick: () => setShowAdd(v => !v) }, { label: "Log Activity", onClick: () => g.active[0] && logActivity(g.active[0]) }, { label: "Open Hobby's", to: "/life/hobbies" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={g.active.length ? 100 : 0} size={140} color={LIGHT} label={String(g.active.length)} sub="ACTIEF" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">RITME · DEZE WEEK</p>
            <div className="flex items-end gap-1.5 h-16">
              {rhythm.map((d, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: d.label === "—" ? "20%" : "100%", background: d.label === "—" ? "rgba(255,255,255,0.08)" : LIGHT }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">ACTIVITEIT · LIVE</p>
            <LiveSparkline color={MID} max={12} intervalMs={1800} />
          </div>
          {showAdd && (
            <div className="rounded-2xl border border-marble/25 bg-marble/8 p-3 space-y-2">
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Hobby naam" className="w-full rounded-lg border border-marble/30 bg-marble/5 px-3 py-2 text-xs text-storm placeholder:text-storm/40 focus:outline-none" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-marble/30 bg-marble/5 px-3 py-2 text-xs text-storm focus:outline-none">
                {TYPES.map(t => <option key={t} value={t} className="text-charcoal capitalize">{t}</option>)}
              </select>
              <button onClick={add} disabled={!form.title.trim()} className="w-full px-3 py-2 rounded-full text-xs font-semibold text-plum disabled:opacity-40 transition" style={{ background: LIGHT }}><Plus className="w-3.5 h-3.5 inline mr-1" />Voeg toe</button>
            </div>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">NU LEVEND · {g.active.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : g.active.length ? g.active.slice(0, 6).map(h => (
              <div key={h.id} onClick={onOpen} className="rounded-2xl border border-marble/20 bg-marble/5 hover:bg-marble/10 p-3.5 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-storm truncate">{h.title}</p>
                    <p className="text-[11px] text-storm/50">{h.current_thread || "actief"} · {fmtDaysAgo(h.last_activity_date)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); logActivity(h); }} className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full border border-marble/30 hover:bg-marble/10 transition" style={{ color: LIGHT }}>Log</button>
                </div>
              </div>
            )) : <p className="text-storm/40 text-sm">Niets nu actief.</p>}
            {g.quiet.length > 0 && (
              <>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">STIL, MAAR LEVEND</p>
                {g.quiet.slice(0, 4).map(h => (
                  <div key={h.id} className="flex items-center justify-between rounded-xl border border-marble/20 bg-marble/5 px-3.5 py-2.5">
                    <div className="min-w-0"><p className="text-sm font-medium text-storm truncate">{h.title}</p><p className="text-[11px] text-storm/40">{fmtDaysAgo(h.last_activity_date)}</p></div>
                    <button onClick={() => logActivity(h)} className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: LIGHT }}>Reactiveer</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}