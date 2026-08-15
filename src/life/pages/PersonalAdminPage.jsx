import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import AdminTimeline from "@/life/components/AdminTimeline";
import AdminObligationCard from "@/life/components/AdminObligationCard";
import { IMAGES } from "@/lib/images";
import { adminWeather, radarEvents, comingUp, weatherZones, repeaters, friction, nextThing, openLoops, needsYouList, accentFor, daysUntil, fmtDate, isActive } from "@/lib/adminUtils";
import { Shield, Wallet, FileText, RefreshCw, ListChecks, CircleDot, Plus, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { logLifeActivity } from "@/lib/lifeActivity";
import LifeActivityFeed from "@/life/components/LifeActivityFeed";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "MONEY", label: "Geld", icon: Wallet },
  { key: "DOCUMENTS", label: "Documenten", icon: FileText },
  { key: "RENEWALS", label: "Verlengingen", icon: RefreshCw },
  { key: "OBLIGATIONS", label: "Verplichtingen", icon: ListChecks },
  { key: "OPEN", label: "Open", icon: CircleDot },
];

export default function PersonalAdminPage() {
  const [obs, setObs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => (new URLSearchParams(window.location.search).get("tab") || "overview").toUpperCase());

  const load = async () => { try { const [o, d] = await Promise.all([base44.entities.AdminObligation.list().catch(() => []), base44.entities.Document.list().catch(() => [])]); setObs(o || []); setDocs(d || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const w = useMemo(() => adminWeather(obs), [obs]);
  const events = useMemo(() => radarEvents(obs), [obs]);
  const zones = useMemo(() => weatherZones(obs), [obs]);
  const next = useMemo(() => nextThing(obs), [obs]);
  const stuck = useMemo(() => friction(obs), [obs]);
  const rep = useMemo(() => repeaters(obs), [obs]);
  const loops = useMemo(() => openLoops(obs), [obs]);
  const moneyPayments = useMemo(() => comingUp(obs).filter((o) => Number(o.amount) > 0), [obs]);
  const renewals = useMemo(() => obs.filter((o) => ["renewal", "subscription", "insurance"].includes(o.type)), [obs]);
  const activeDocs = useMemo(() => (docs || []).filter((d) => d.status !== "archived"), [docs]);

  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await logLifeActivity("Admin", "completed", `${o.title} afgerekend`); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-personaladmin" image={IMAGES.lifePersonalAdmin} icon={Shield} eyebrow="LIFE → ADMIN" title="Personal Admin" subtitle={w.counts.overdue === 0 ? "Your administrative life, currently behaving itself." : `${w.counts.overdue} te laat · ${w.counts.coming} op komst · ${w.counts.needsYou} vereist jou`}
        actions={<GlassButton variant="primary" size="md" onClick={() => alert("Toevoegen")}><Plus className="h-4 w-4" /> Toevoegen</GlassButton>} />

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition flex items-center gap-1.5" style={tab === t.key ? { background: "hsl(var(--life-blue))", color: "hsl(var(--charcoal))" } : {}} >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "OVERVIEW" && (
        <div className="space-y-4">
          {/* HERO */}
          <div className="relative rounded-3xl overflow-hidden">
            <img src={IMAGES.lifePersonalAdmin} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-charcoal/20" />
            <div className="relative p-6 lg:p-8 grid lg:grid-cols-2 gap-6 items-center min-h-[220px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Admin weather</p>
                <h2 className="text-5xl lg:text-6xl font-display font-semibold tracking-[-0.03em] text-ivory mt-1.5">{w.headline.replace("ADMIN WEATHER: ", "MOSTLY ").replace("MOSTLY QUIET FOR NOW", "QUIET FOR NOW")}</h2>
                <p className="text-sm text-ivory/70 mt-2">{w.counts.overdue} te laat · {w.counts.coming} op komst · {w.counts.needsYou} vereist jou</p>
              </div>
              <div className="w-full max-w-sm"><div className="glass-card rounded-2xl p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold mb-3">Op komst</p><AdminTimeline events={events} max={5} tone="dark" onSelect={done} /></div></div>
            </div>
          </div>

          {/* Admin weather zones */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {zones.map((z) => {
              const c = z.status === "urgent" ? "hsl(var(--urgent))" : z.status === "soon" ? "hsl(var(--life-sand))" : "hsl(var(--life-blue))";
              return (
                <GlassPanel key={z.key} level={2} className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: c }}>{z.label}</p>
                  <p className="text-4xl font-display font-semibold tabular-nums mt-1.5" style={{ color: c }}>{z.count}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{z.note}</p>
                </GlassPanel>
              );
            })}
          </div>

          {/* The next thing */}
          {next && (
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Het volgende</p>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-2">
                <div>
                  <h3 className="text-3xl font-display font-semibold tracking-tight">{next.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{fmtDate(next.due_date)}{Number(next.amount) > 0 ? ` · €${next.amount}` : ""}</p>
                  <div className="flex items-center gap-3 mt-4">
                    {["Document", "Renewal", "Payment"].map((s, i) => (
                      <span key={s} className="inline-flex items-center gap-1.5 text-xs">
                        <span className={`w-2 h-2 rounded-full ${i < 2 ? "" : "animate-pulse-soft"}`} style={{ background: i < 2 ? "hsl(var(--life-blue-deep))" : "hsl(var(--foreground)/0.2)" }} />
                        {s} {i < 2 ? "✓" : "○"}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-2xl font-display font-semibold" style={{ color: accentFor(daysUntil(next.due_date) < 0 ? "urgent" : daysUntil(next.due_date) <= 7 ? "soon" : "later") }}>{daysUntil(next.due_date) < 0 ? "TE LAAT" : daysUntil(next.due_date) <= 7 ? "KLAAR" : "OP KOERS"}</span>
              </div>
              <div className="mt-5 pt-4 border-t border-foreground/8"><GlassButton variant="primary" size="sm" onClick={() => done(next)}><CheckCircle2 className="h-3.5 w-3.5" /> Afronden</GlassButton></div>
            </GlassPanel>
          )}

          {/* Money in motion */}
          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Geld in beweging</p>
            <p className="text-5xl font-display font-semibold tabular-nums tracking-[-0.03em] mt-1.5" style={{ color: "hsl(var(--life-blue-deep))" }}>€{Math.round(w.counts.money)}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-0.5">OP KOMST</p>
            <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1">
              {moneyPayments.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <span className="text-muted-foreground/40">→</span>}
                  <div className="shrink-0 rounded-2xl px-3.5 py-2.5" style={{ background: "hsl(var(--foreground)/0.04)" }}>
                    <p className="text-lg font-display font-semibold tabular-nums" style={{ color: "hsl(var(--life-blue-deep))" }}>€{p.amount}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{p.title} · {fmtDate(p.due_date)}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </GlassPanel>

          {/* Document stack */}
          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Documentstapel</p>
            <div className="relative h-28">
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute rounded-2xl border border-foreground/8" style={{ width: `calc(100% - ${i * 36}px)`, height: 72, left: i * 18, top: i * 14, background: "hsl(var(--card))", boxShadow: "0 14px 30px -22px rgba(0,0,0,0.3)" }} />
              ))}
              <div className="absolute right-2 bottom-2 text-right">
                <p className="text-3xl font-display font-semibold tabular-nums">{activeDocs.length}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">documenten</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-3">{activeDocs.filter((d) => d.status === "recent").length} in beweging</p>
          </GlassPanel>

          {/* Administrative friction */}
          {stuck && (
            <GlassPanel level={2} className="p-6" >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-1" style={{ color: "hsl(var(--urgent))" }} />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: "hsl(var(--urgent))" }}>Eén ding zit vast</p>
                  <h3 className="text-2xl font-display font-semibold tracking-tight mt-1">{stuck.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{stuck.notes || "Wachtende"} · {daysUntil(stuck.due_date) < 0 ? `${Math.abs(daysUntil(stuck.due_date))} dagen te laat` : `${daysUntil(stuck.due_date)} dagen`}</p>
                  <p className="text-sm text-muted-foreground italic mt-2">Je hebt hier twee keer over gesproken, maar er is niets gebeurd.</p>
                  <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => done(stuck)} style={{ background: "hsl(var(--urgent))" }}><CheckCircle2 className="h-3.5 w-3.5" /> Oplossen</GlassButton>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
      )}

      {tab === "MONEY" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.hourglassJacket} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Geld</p>
                <h2 className="text-5xl font-display font-semibold tabular-nums tracking-[-0.03em] text-ivory mt-1">€{Math.round(w.counts.money)}</h2>
                <p className="text-sm text-ivory/70 mt-1">Beweegt door de komende 30 dagen</p>
              </div>
            </div>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Geldstroom</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {moneyPayments.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <span className="text-muted-foreground/40 shrink-0">→</span>}
                  <div className="shrink-0 rounded-2xl px-4 py-3" style={{ background: "hsl(var(--foreground)/0.04)" }}>
                    <p className="text-2xl font-display font-semibold tabular-nums" style={{ fontSize: `${16 + Math.min(24, Number(p.amount) / 24)}px`, color: "hsl(var(--life-blue-deep))" }}>€{p.amount}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mt-0.5">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{fmtDate(p.due_date)}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </GlassPanel>

          <div className="grid sm:grid-cols-2 gap-4">
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">De terugkerenden</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Elke maand</p>
              <div className="flex flex-wrap gap-2 mt-1.5 mb-4">{rep.monthly.map((o) => <span key={o.id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "hsl(var(--life-sand)/0.25)", color: "hsl(var(--life-sand-deep))" }}>{o.title} · €{o.amount}</span>)}</div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Elk jaar</p>
              <div className="flex flex-wrap gap-2 mt-1.5">{rep.yearly.map((o) => <span key={o.id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "hsl(var(--life-blue)/0.3)", color: "hsl(var(--life-blue-deep))" }}>{o.title}</span>)}</div>
              <p className="text-xs text-muted-foreground italic mt-4">{rep.monthly.length + rep.yearly.length} terugkerende betalingen gedetecteerd</p>
            </GlassPanel>
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Geldpieken</p>
              <p className="text-4xl font-display font-semibold tabular-nums mt-1.5" style={{ color: "hsl(var(--life-sand-deep))" }}>€{Math.round(w.counts.money - 503 - 39)}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mt-0.5">MEER DAN GEBRUIKELIJK</p>
              <p className="text-sm text-muted-foreground mt-3">Verzekering verlenging en jaarabonnement maken augustus/september zwaarder dan normaal.</p>
            </GlassPanel>
          </div>
        </div>
      )}

      {tab === "DOCUMENTS" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.chairsScattered} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Documenten</p>
                  <h2 className="text-5xl font-display font-semibold tabular-nums text-ivory mt-1">{activeDocs.length}</h2>
                  <p className="text-sm text-ivory/70 mt-1">actief · {activeDocs.filter((d) => d.status === "recent").length} in beweging</p>
                </div>
              </div>
            </div>
          </div>

          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Document-constellatie</p>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              {["Insurance", "Policy", "Renewal", "€142", "18 SEP"].map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && <span className="text-muted-foreground/40">↓</span>}
                  <span className="rounded-full px-3 py-1.5 font-medium" style={{ background: i === 0 ? "hsl(var(--life-blue)/0.3)" : "hsl(var(--foreground)/0.05)", color: i === 0 ? "hsl(var(--life-blue-deep))" : "hsl(var(--foreground))" }}>{s}</span>
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic mt-4">Een document is geen los bestand — het is een administratieve constellatie.</p>
          </GlassPanel>

          <div className="grid sm:grid-cols-2 gap-4">
            {renewals.slice(0, 4).map((o) => (
              <AdminObligationCard key={o.id} item={o} action="Open" onAction={done} />
            ))}
          </div>
        </div>
      )}

      {tab === "RENEWALS" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.loungeChairs} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">De terugkerenden</p>
                  <h2 className="text-5xl font-display font-semibold tabular-nums text-ivory mt-1">{renewals.length}</h2>
                  <p className="text-sm text-ivory/70 mt-1">komen terug</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-ivory/70 text-sm"><RefreshCw className="w-4 h-4" /> {renewals.length} terugkerend</div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {renewals.map((o) => (
              <div key={o.id}>
                <AdminObligationCard item={o} action="Open" onAction={done}
                  extra={<div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-wide font-semibold text-muted-foreground">
                    <span>Laatst</span><span style={{ color: "hsl(var(--life-blue-deep))" }}>Nu</span><span>Volgende</span>
                  </div>} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "OBLIGATIONS" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.walkChairsHigh} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Dingen die je de wereld verschuldigd bent</p>
                <h2 className="text-4xl font-display font-semibold text-ivory mt-1">{obs.filter(isActive).length} actieve verplichtingen</h2>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "DO", count: needsYouList(obs).length, c: "hsl(var(--life-sand-deep))", note: "Vereist actie" },
              { label: "WAITING", count: obs.filter((o) => /waiting|wacht/i.test(o.notes || "")).length, c: "hsl(var(--life-blue-deep))", note: "Wacht op anderen" },
              { label: "SCHEDULED", count: comingUp(obs).filter((o) => daysUntil(o.due_date) > 7).length, c: "hsl(var(--life-blue))", note: "Ingepland" },
              { label: "WATCHING", count: obs.filter(isActive).length, c: "hsl(var(--muted-foreground))", note: "In de gaten" },
            ].map((z) => (
              <GlassPanel key={z.label} level={2} className="p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: z.c }}>{z.label}</p>
                <p className="text-4xl font-display font-semibold tabular-nums mt-1.5" style={{ color: z.c }}>{z.count}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{z.note}</p>
              </GlassPanel>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingUp(obs).map((o) => <AdminObligationCard key={o.id} item={o} action="Open" onAction={done} />)}
          </div>
        </div>
      )}

      {tab === "OPEN" && (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden h-44">
            <img src={IMAGES.topDownWalk} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Nog niet af</p>
                <h2 className="text-4xl font-display font-semibold text-ivory mt-1">{loops.length} openstaande situaties</h2>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {loops.map((o) => (
              <GlassPanel key={o.id} level={2} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-lg font-display font-semibold truncate">{o.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{o.notes || "Vereist actie"}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide font-semibold" style={{ background: "hsl(var(--urgent)/0.18)", color: "hsl(var(--urgent))" }}>
                    <CircleDot className="w-3 h-3" /> OPEN LOOP
                  </span>
                </div>
                <button onClick={() => done(o)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "hsl(var(--life-blue-deep))" }}><CheckCircle2 className="w-3.5 h-3.5" /> Sluit → CLOSED</button>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      <LifeActivityFeed />
    </div>
  );
}