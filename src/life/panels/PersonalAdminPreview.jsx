import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AdminTimeline from "@/life/components/AdminTimeline";
import { adminWeather, radarEvents, weatherMap, fmtDate } from "@/lib/adminUtils";
import { IMAGES } from "@/lib/images";
import { Plus, FileText, CreditCard, RefreshCw, Sparkles } from "lucide-react";

const TYPES = [{ k: "payment", l: "Betaling" }, { k: "contract", l: "Document" }, { k: "renewal", l: "Verlenging" }, { k: "subscription", l: "Abonnement" }];

/** Personal Admin panel — levende cockpit. Foto-header, reusachtig bedrag,
 *  heldere deadline-tijdlijn (geen abstracte radar meer), admin-weerkaart en
 *  minimale controls. Alles geanimeerd en direct leesbaar. */
export default function PersonalAdminPreview() {
  const [obs, setObs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", type: "payment", due_date: "", amount: "" });

  const load = async () => { try { const o = await base44.entities.AdminObligation.list(); setObs(o || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const w = useMemo(() => adminWeather(obs), [obs]);
  const events = useMemo(() => radarEvents(obs), [obs]);
  const wmap = useMemo(() => weatherMap(obs), [obs]);
  const accent = w.counts.overdue > 0 ? "hsl(var(--urgent))" : w.counts.coming > 0 ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))";
  const clear = w.headline.replace("ADMIN WEATHER: ", "");

  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await load(); } catch { /* ignore */ } };
  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.AdminObligation.create({ title: form.title.trim(), type: form.type, due_date: form.due_date || undefined, amount: Number(form.amount) || 0, status: "open" }); setForm({ title: "", type: "payment", due_date: "", amount: "" }); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      {/* Foto-header */}
      <div className="relative h-16 rounded-2xl overflow-hidden">
        <img src={IMAGES.lifePersonalAdmin} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent" />
        <div className="absolute inset-0 px-4 flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/85">Personal Admin</h3>
          <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: accent }}>{w.counts.coming} op komst</span>
        </div>
      </div>

      <div>
        <h2 className="text-[34px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">ADMIN WEATHER</h2>
        <p className="text-xl font-display font-semibold mt-1" style={{ color: "hsl(var(--life-blue))" }}>{clear}</p>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{w.sub}</p>
      </div>

      {/* Reusachtig bedrag */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card-2 rounded-2xl p-5 flex items-end gap-5">
        <span className="text-[64px] leading-[0.78] font-display font-semibold tabular-nums" style={{ color: accent }}>€{Math.round(w.counts.money)}</span>
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">COMING UP</p>
          <p className="text-xs text-ivory/45 mt-1">{w.counts.coming} zaken · {w.counts.overdue} te laat · {w.counts.needsYou} vereist jou</p>
        </div>
      </motion.div>

      {/* Heldere deadline-tijdlijn */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Komt naar je toe</p>
        <div className="glass-card-2 rounded-2xl p-5">
          <AdminTimeline events={events} tone="dark" onSelect={done} />
        </div>
      </div>

      {/* Admin-weerkaart */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Admin weerkaart</p>
        <div className="glass-card-2 rounded-2xl p-4 flex items-end gap-3 overflow-x-auto">
          {wmap.length ? wmap.map((d) => (
            <div key={d.date} className="shrink-0 flex flex-col items-center gap-1.5 min-w-[44px]">
              <div className="flex flex-col-reverse gap-1 h-16 justify-end">
                {Array.from({ length: d.density }).map((_, i) => <span key={i} className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))" }} />)}
              </div>
              <span className="text-[9px] uppercase tracking-wide text-ivory/55 font-semibold">{fmtDate(d.date)}</span>
            </div>
          )) : <p className="text-sm text-ivory/55 italic px-2">Rustige periode.</p>}
        </div>
      </div>

      {/* Snel toevoegen */}
      <div className="glass-card-2 rounded-2xl p-4">
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="bv. 'Verzekering verlengen'" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
        <div className="grid grid-cols-3 gap-2 mt-2.5">
          <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-2.5 py-2 text-xs text-ivory outline-none" />
          <input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="€" className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-2.5 py-2 text-xs text-ivory outline-none">
            {TYPES.map((t) => <option key={t.k} value={t.k} className="text-charcoal">{t.l}</option>)}
          </select>
        </div>
        <button onClick={add} disabled={!form.title.trim()} className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: "hsl(var(--life-sand))" }}><Plus className="w-4 h-4" /> Toevoegen</button>
      </div>

      {/* Snelle controls */}
      <div className="grid grid-cols-5 gap-2">
        {[{ icon: Plus, l: "Add" }, { icon: CreditCard, l: "Pay" }, { icon: FileText, l: "Doc" }, { icon: RefreshCw, l: "Renew" }, { icon: Sparkles, l: "Giulia" }].map((a) => (
          <button key={a.l} onClick={() => setForm({ title: "", type: a.l === "Pay" ? "payment" : a.l === "Doc" ? "contract" : a.l === "Renew" ? "renewal" : "subscription", due_date: "", amount: "" })} className="glass-button rounded-xl py-3 text-[10px] font-medium text-ivory/70 hover:text-ivory transition flex flex-col items-center gap-1.5">
            <a.icon className="w-4 h-4" style={{ color: "hsl(var(--life-blue-deep))" }} />
            {a.l}
          </button>
        ))}
      </div>
    </div>
  );
}