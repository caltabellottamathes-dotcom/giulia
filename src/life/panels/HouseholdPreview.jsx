import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { householdZones, mattersItems, householdHeadline, isAttention, accentFor } from "@/lib/householdUtils";
import { Plus, Wrench, ShoppingCart, Repeat, ListChecks } from "lucide-react";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const TYPES = [{ k: "task", l: "Taak", icon: ListChecks }, { k: "shopping", l: "Boodschap", icon: ShoppingCart }, { k: "maintenance", l: "Onderhoud", icon: Wrench }, { k: "issue", l: "Issue", icon: Plus }];

export default function HouseholdPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", kind: "task" });

  const load = async () => {
    try { const [it, t] = await Promise.all([base44.entities.HouseholdItem.list().catch(() => []), base44.entities.Task.filter({ domain: "life" }).catch(() => [])]); setItems(it || []); setTasks(t || []); } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const zones = useMemo(() => householdZones(items), [items]);
  const matters = useMemo(() => mattersItems(items, tasks), [items, tasks]);
  const headline = householdHeadline(matters, items);
  const nowItems = items.filter(i => isAttention(i.status)).slice(0, 4);

  const complete = async (i) => { try { await base44.entities.HouseholdItem.update(i.id, { status: "done", last_done: new Date().toISOString() }); await load(); } catch { /* ignore */ } };
  const addQuick = async () => { if (!form.title.trim()) return; try { if (form.kind === "task") await base44.entities.Task.create({ title: form.title.trim(), domain: "life", status: "today" }); else await base44.entities.HouseholdItem.create({ title: form.title.trim(), kind: form.kind, status: form.kind === "issue" ? "open" : "needs_attention" }); setForm({ title: "", kind: "task" }); await load(); } catch { /* ignore */ } };

  return (
    <PreviewShell index="21" section="HOUSEHOLD" statement={headline.toUpperCase()} kicker="WAT NU ERTOE DOET" accent={LIGHT}
      context={[
        { label: "DINGEN WAARD", text: `${matters.length} zaken verdienen nu aandacht.` },
        { label: "STATEN", text: `${zones.length} huishoudzones bijgehouden.` },
        { label: "NU", text: nowItems.length ? `${nowItems.length} items vragen directe actie.` : "Alles onder controle." },
      ]}
      actions={[{ label: "Open Household", primary: true, to: "/life/household" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">DINGEN WAARD</p>
            <p className="text-storm text-4xl font-bold tabular-nums mt-1" style={{ color: matters.length > 3 ? URG : LIGHT }}><CountUp to={matters.length} /></p>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">RITME · LIVE</p>
            <PulseWave color={LIGHT} bars={18} height={36} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">SNEL TOEVOEGEN</p>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="bv. 'Wasmachine maakt geluid'" className="w-full rounded-xl border border-marble/30 bg-marble/5 px-3 py-2 text-xs text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand mb-2" />
            <div className="grid grid-cols-2 gap-1.5">
              {TYPES.map(o => (
                <button key={o.k} onClick={() => setForm(f => ({ ...f, kind: o.k }))} className={`rounded-lg px-2 py-1.5 text-[10px] border transition ${form.kind === o.k ? "bg-sand text-storm border-sand" : "border-marble/30 bg-marble/5 text-storm/70"}`}><o.icon className="w-3 h-3 inline mr-1" />{o.l}</button>
              ))}
            </div>
            <button onClick={addQuick} disabled={!form.title.trim()} className="mt-2 w-full px-3 py-2 rounded-full text-xs font-semibold text-plum disabled:opacity-40 transition" style={{ background: LIGHT }}><Plus className="w-3.5 h-3.5 inline mr-1" />Toevoegen</button>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">WAT NU ERTOE DOET · {nowItems.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : nowItems.length ? nowItems.map(i => (
              <div key={i.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-3.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-storm truncate">{i.title}</p>
                  <p className="text-[11px] text-storm/50 mt-0.5">{i.kind || "taak"}</p>
                </div>
                <button onClick={() => complete(i)} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-plum transition hover:brightness-110" style={{ background: accentFor(i.status) === "hsl(var(--urgent))" ? URG : LIGHT }}>Nu</button>
              </div>
            )) : <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5"><p className="text-sm text-storm/60 italic">Alles goed — niets vraagt nu om aandacht.</p></div>}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}