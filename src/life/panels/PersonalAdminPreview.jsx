import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, CountUp, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { adminWeather, radarEvents, fmtDate } from "@/lib/adminUtils";
import { Plus, Check } from "lucide-react";

const PLUM = "#301728", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const TYPES = [{ k: "payment", l: "Betaling" }, { k: "contract", l: "Document" }, { k: "renewal", l: "Verlenging" }, { k: "subscription", l: "Abonnement" }];

export default function PersonalAdminPreview({ onOpen }) {
  const [obs, setObs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", type: "payment", due_date: "", amount: "" });

  const load = async () => { try { const o = await base44.entities.AdminObligation.list(); setObs(o || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const w = useMemo(() => adminWeather(obs), [obs]);
  const events = useMemo(() => radarEvents(obs), [obs]);
  const accent = w.counts.overdue > 0 ? URG : w.counts.coming > 0 ? LIGHT : MID;

  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await load(); } catch { /* ignore */ } };
  const add = async () => { if (!form.title.trim()) return; try { await base44.entities.AdminObligation.create({ title: form.title.trim(), type: form.type, due_date: form.due_date || undefined, amount: Number(form.amount) || 0, status: "open" }); setForm({ title: "", type: "payment", due_date: "", amount: "" }); await load(); } catch { /* ignore */ } };

  return (
    <PreviewShell index="23" section="PERSONAL ADMIN" statement="ADMIN WEATHER" kicker={w.headline.replace("ADMIN WEATHER: ", "").toUpperCase()} accent={accent}
      context={[
        { label: "OP KOMST", text: `${w.counts.coming} administratieve zaken op komst.` },
        { label: "TE LAAT", text: w.counts.overdue > 0 ? `${w.counts.overdue} zaken zijn al te laat.` : "Niets te laat." },
        { label: "BEDRAG", text: `€${Math.round(w.counts.money)} aan administratie in de wachtrij.` },
      ]}
      actions={[{ label: "Open Personal Admin", primary: true, to: "/life/personal-admin" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">COMING UP</p>
            <p className="text-storm text-3xl font-bold tabular-nums mt-1" style={{ color: accent }}>€{Math.round(w.counts.money)}</p>
            <p className="text-storm/50 text-[10px] mt-1">{w.counts.coming} zaken · {w.counts.overdue} te laat</p>
          </div>
          <div className="flex flex-col items-center"><AnimatedRing pct={w.counts.coming ? Math.min(100, (w.counts.overdue / Math.max(w.counts.coming, 1)) * 100) : 0} size={120} color={accent} label={String(w.counts.overdue)} sub="TE LAAT" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">ACTIVITEIT · LIVE</p>
            <LiveSparkline color={MID} max={10} intervalMs={2000} />
          </div>
          <div className="rounded-2xl border border-marble/25 bg-marble/8 p-3 space-y-2">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="bv. Verzekering verlengen" className="w-full rounded-lg border border-marble/30 bg-marble/5 px-3 py-2 text-xs text-storm placeholder:text-storm/40 focus:outline-none" />
            <div className="grid grid-cols-2 gap-1.5">
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="rounded-lg border border-marble/30 bg-marble/5 px-2 py-1.5 text-[10px] text-storm focus:outline-none [color-scheme:dark]" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="rounded-lg border border-marble/30 bg-marble/5 px-2 py-1.5 text-[10px] text-storm focus:outline-none">
                {TYPES.map(t => <option key={t.k} value={t.k} className="text-charcoal">{t.l}</option>)}
              </select>
            </div>
            <button onClick={add} disabled={!form.title.trim()} className="w-full px-3 py-2 rounded-full text-xs font-semibold text-plum disabled:opacity-40 transition" style={{ background: LIGHT }}><Plus className="w-3.5 h-3.5 inline mr-1" />Toevoegen</button>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">KOMT NAAR JE TOE · {events.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : events.length ? events.slice(0, 10).map((e, i) => (
              <div key={i} className="rounded-2xl border border-marble/20 bg-marble/5 p-3.5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.overdue ? URG : LIGHT }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm font-medium truncate">{e.title}</p>
                  <p className="text-[11px] text-storm/50">{e.type} · {e.due_date ? fmtDate(e.due_date) : "—"}</p>
                </div>
                {e.amount > 0 && <span className="text-xs text-storm/60 tabular-nums shrink-0">€{e.amount}</span>}
                <button onClick={() => done(e)} className="shrink-0 w-7 h-7 rounded-full border border-marble/30 bg-marble/5 text-storm/70 hover:bg-olive hover:text-plum transition flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
              </div>
            )) : <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5"><p className="text-sm text-storm/60 italic">Rustige periode — niets op komst.</p></div>}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}