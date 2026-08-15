import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import HouseholdStateViz from "@/components/life/HouseholdStateViz";
import { householdZones, mattersItems, householdHeadline, isAttention, statusLabel } from "@/lib/householdUtils";
import { Plus, Wrench, ShoppingCart, Repeat, ListChecks } from "lucide-react";

const SAND = "hsl(var(--life-sand))";
const BLUE = "hsl(var(--life-blue-deep))";

/** Household panel — snelle huishoudelijke werkruimte. Huidige staat, wat nu
 *  ertoe doet, en snelle acties + compacte creator. */
export default function HouseholdPreview() {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", kind: "task" });

  const load = async () => {
    try {
      const [it, t] = await Promise.all([
        base44.entities.HouseholdItem.list().catch(() => []),
        base44.entities.Task.filter({ domain: "life" }).catch(() => []),
      ]);
      setItems(it || []); setTasks(t || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const zones = useMemo(() => householdZones(items), [items]);
  const matters = useMemo(() => mattersItems(items, tasks), [items, tasks]);
  const headline = householdHeadline(matters, items);
  const sub = matters.length === 0 ? "Niets dringends — het loopt soepel." : matters.length >= 4 ? "Een reset zou rust geven." : "Een paar dingen maken de week makkelijker.";

  const nowItems = items.filter((i) => isAttention(i.status)).slice(0, 4);

  const complete = async (i) => { try { await base44.entities.HouseholdItem.update(i.id, { status: "done", last_done: new Date().toISOString() }); await load(); } catch { /* ignore */ } };
  const addQuick = async () => {
    if (!form.title.trim()) return;
    try {
      if (form.kind === "task") await base44.entities.Task.create({ title: form.title.trim(), domain: "life", status: "today" });
      else await base44.entities.HouseholdItem.create({ title: form.title.trim(), kind: form.kind, status: form.kind === "issue" ? "open" : "needs_attention" });
      setForm({ title: "", kind: "task" }); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-7 text-ivory">
      {/* HEADER */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Household</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">{headline}</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">{sub}</p>
      </div>

      {/* CURRENT STATE */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Huidige staat</p>
        <div className="glass-card-2 rounded-2xl p-4">
          <HouseholdStateViz zones={zones} compact tone="dark" />
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-ivory/10">
            {zones.map((z) => (
              <div key={z.key} className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-ivory/55 font-semibold">{z.label}</p>
                <p className="text-xs mt-0.5" style={{ color: isAttention(z.status) ? SAND : "hsl(var(--ivory) / 0.5)" }}>{statusLabel(z.status)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT MATTERS NOW */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Wat nu ertoe doet</p>
        {nowItems.length ? (
          <div className="space-y-2">
            {nowItems.map((i) => (
              <div key={i.id} className="glass-card-2 rounded-2xl p-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-display font-semibold truncate">{i.title}</p>
                  <p className="text-xs text-ivory/55 mt-0.5 italic">{contextFor(i)}</p>
                </div>
                <button onClick={() => complete(i)} className="shrink-0 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory">Nu</button>
                <button onClick={() => complete(i)} className="shrink-0 rounded-full glass-button px-3 py-1.5 text-xs font-medium text-ivory/60">Later</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl p-5"><p className="text-sm text-ivory/70 italic">Alles goed — niets vraagt nu om aandacht.</p></div>
        )}
      </div>

      {/* QUICK ADD */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Snel toevoegen</p>
        <div className="glass-card-2 rounded-2xl p-4 space-y-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="bv. 'De wasmachine maakt een raar geluid'" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex flex-wrap gap-1.5">
            {[{ k: "task", l: "Taak", icon: ListChecks }, { k: "shopping", l: "Boodschap", icon: ShoppingCart }, { k: "maintenance", l: "Onderhoud", icon: Wrench }, { k: "issue", l: "Issue", icon: Plus }].map((o) => (
              <button key={o.k} onClick={() => setForm((f) => ({ ...f, kind: o.k }))} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${form.kind === o.k ? "text-charcoal" : "text-ivory/65 border-white/15"}`} style={form.kind === o.k ? { background: SAND, borderColor: SAND } : {}}>
                <o.icon className="w-3 h-3 inline mr-1" />{o.l}
              </button>
            ))}
          </div>
          <button onClick={addQuick} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAND }}><Plus className="w-4 h-4" /> Toevoegen</button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Snelle acties</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setForm({ title: "", kind: "task" })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><ListChecks className="w-4 h-4" style={{ color: BLUE }} /> Taak</button>
          <button onClick={() => setForm({ title: "", kind: "shopping" })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><ShoppingCart className="w-4 h-4" style={{ color: BLUE }} /> Boodschap</button>
          <button onClick={() => setForm({ title: "", kind: "maintenance" })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Wrench className="w-4 h-4" style={{ color: BLUE }} /> Onderhoud</button>
          <button onClick={() => setForm({ title: "", kind: "issue" })} className="glass-button rounded-xl px-4 py-3 text-left text-sm text-ivory hover:bg-white/10 transition flex items-center gap-2"><Repeat className="w-4 h-4" style={{ color: BLUE }} /> Routine</button>
        </div>
      </div>
    </div>
  );
}

function contextFor(i) {
  if (i.kind === "shopping") return "Je mist iets dat je regelmatig gebruikt.";
  if (i.kind === "maintenance") return i.next_due ? `Volgende: ${new Date(i.next_due).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}` : "Vereist aandacht.";
  if (i.kind === "issue") return i.notes || "Iets dat opgelost moet worden.";
  return "Huishoudelijke taak.";
}