import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import HouseholdStateViz from "@/life/components/HouseholdStateViz";
import { householdZones, mattersItems, householdHeadline, isAttention, accentFor, tileAccent } from "@/lib/householdUtils";
import { Plus, Wrench, ShoppingCart, Repeat, ListChecks } from "lucide-react";
import { ContextGrid, ActionRow } from "@/self/components/SelfViz";

const TYPES = [{ k: "task", l: "Taak", icon: ListChecks }, { k: "shopping", l: "Boodschap", icon: ShoppingCart }, { k: "maintenance", l: "Onderhoud", icon: Wrench }, { k: "issue", l: "Issue", icon: Plus }];

/** Household panel — grafisch, minimaal, luid. Eén reusachtig cijfer, duidelijke
 *  state-balken, maximaal drie kaarten met één heldere actie, en een minimale
 *  toevoeger. Niets meer dan nodig. */
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
  const accent = tileAccent(zones);
  const sub = matters.length === 0 ? "Niets dringends — het loopt soepel." : matters.length >= 4 ? "Een reset zou rust geven." : "Een paar dingen maken de week makkelijker.";
  const nowItems = items.filter((i) => isAttention(i.status)).slice(0, 3);

  const counts = [
    matters.filter((m) => m.kind === "task").length && `${matters.filter((m) => m.kind === "task").length} taak`,
    matters.filter((m) => m.kind === "shopping").length && `${matters.filter((m) => m.kind === "shopping").length} boodschap`,
    matters.filter((m) => m.kind === "maintenance").length && `${matters.filter((m) => m.kind === "maintenance").length} onderhoud`,
    matters.filter((m) => m.kind === "issue").length && `${matters.filter((m) => m.kind === "issue").length} issue`,
  ].filter(Boolean).join(" · ");

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
    <div className="space-y-6 text-ivory">
      {/* HERO */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Household</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">{headline}</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">{sub}</p>
      </div>

      {/* Reusachtig cijfer + uitsplitsing */}
      <div className="glass-card-2 rounded-2xl p-5 flex items-end gap-5">
        <span className="text-[72px] leading-[0.78] font-display font-semibold tabular-nums transition-colors" style={{ color: accent }}>{matters.length}</span>
        <div className="mb-3 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">dingen waard</p>
          <p className="text-xs text-ivory/45 mt-1.5 truncate">{counts || "alles onder controle"}</p>
        </div>
      </div>

      {/* State-balken */}
      <div className="glass-card-2 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-4">Huidige staat</p>
        <HouseholdStateViz zones={zones} variant="bars" tone="dark" />
      </div>

      {/* Wat nu ertoe doet — duidelijke kaarten, één actie */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Wat nu ertoe doet</p>
        {nowItems.length ? (
          <div className="space-y-2">
            {nowItems.map((i) => (
              <div key={i.id} className="glass-card-2 rounded-2xl p-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-display font-semibold truncate">{i.title}</p>
                  <p className="text-xs text-ivory/55 mt-0.5 italic">{contextFor(i)}</p>
                </div>
                <button onClick={() => complete(i)} className="shrink-0 rounded-full px-4 py-2 text-sm font-bold transition hover:brightness-110" style={{ background: accentFor(i.status), color: "hsl(var(--charcoal))" }}>Nu</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card-2 rounded-2xl p-5"><p className="text-sm text-ivory/70 italic">Alles goed — niets vraagt nu om aandacht.</p></div>
        )}
      </div>

      {/* Minimale toevoeger */}
      <div className="glass-card-2 rounded-2xl p-4">
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="bv. 'De wasmachine maakt een raar geluid'" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {TYPES.map((o) => (
            <button key={o.k} onClick={() => setForm((f) => ({ ...f, kind: o.k }))} className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${form.kind === o.k ? "text-charcoal" : "text-ivory/65 border-white/15"}`} style={form.kind === o.k ? { background: "hsl(var(--life-sand))", borderColor: "hsl(var(--life-sand))" } : {}}>
              <o.icon className="w-3 h-3 inline mr-1" />{o.l}
            </button>
          ))}
        </div>
        <button onClick={addQuick} disabled={!form.title.trim()} className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: "hsl(var(--life-sand))" }}><Plus className="w-4 h-4" /> Toevoegen</button>
      </div>

      {/* Snelle acties — minimaal */}
      <div className="grid grid-cols-4 gap-2">
        {[{ icon: ListChecks, k: "task", l: "Taak" }, { icon: ShoppingCart, k: "shopping", l: "Boodschap" }, { icon: Wrench, k: "maintenance", l: "Onderhoud" }, { icon: Repeat, k: "issue", l: "Issue" }].map((a) => (
          <button key={a.k} onClick={() => setForm({ title: "", kind: a.k })} className="glass-button rounded-xl py-3 text-[10px] font-medium text-ivory/70 hover:text-ivory transition flex flex-col items-center gap-1.5">
            <a.icon className="w-4 h-4" style={{ color: "hsl(var(--life-blue-deep))" }} />
            {a.l}
          </button>
        ))}
      </div>

      <ContextGrid items={[
        { label: "DINGEN WAARD", text: `${matters.length} zaken verdienen nu aandacht.` },
        { label: "STATEN", text: `${zones.length} huishoudzones bijgehouden.` },
        { label: "NU", text: nowItems.length ? `${nowItems.length} items vragen directe actie.` : "Alles onder controle." },
      ]} />
      <ActionRow actions={[
        { label: "Open Household", primary: true, color: "#d8dab3", to: "/life/household" },
      ]} />
    </div>
  );
}

function contextFor(i) {
  if (i.kind === "shopping") return "Je mist iets dat je regelmatig gebruikt.";
  if (i.kind === "maintenance") return i.next_due ? `Volgende: ${new Date(i.next_due).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}` : "Vereist aandacht.";
  if (i.kind === "issue") return i.notes || "Iets dat opgelost moet worden.";
  return "Huishoudelijke taak.";
}