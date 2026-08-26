import React from "react";
import { CheckCircle2, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import AdminObligationCard from "@/life/components/AdminObligationCard";
import { accentFor, daysUntil, fmtDate } from "@/lib/adminUtils";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)] p-4 ${className}`}>{children}</div>
);

const Stat = ({ label, value, color, note }) => (
  <div>
    <p className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color }}>{label}</p>
    <p className="text-3xl font-display font-semibold tabular-nums leading-none mt-1" style={{ color }}>{value}</p>
    <p className="text-[11px] text-muted-foreground mt-1">{note}</p>
  </div>
);

/** AdminStacks — per-tab widget-stapel voor de PersonalAdmin Space page. */
export default function AdminStacks({ tab, data, onDone, onEdit, onDelete }) {
  const { w, events, zones, next, stuck, rep, moneyPayments, renewals, activeDocs, obs, loops } = data;

  if (tab === "OVERVIEW") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Admin weather</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {zones.map((z) => {
              const c = z.status === "urgent" ? "hsl(var(--d-focus-urgent))" : z.status === "soon" ? "hsl(var(--d-focus-deep))" : "hsl(var(--d-focus-deep))";
              return <Stat key={z.key} label={z.label} value={z.count} color={c} note={z.note} />;
            })}
          </div>
        </Card>

        {next && (
          <Card>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-2">Het volgende</p>
            <h3 className="text-xl font-display font-semibold tracking-tight">{next.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{fmtDate(next.due_date)}{Number(next.amount) > 0 ? ` · €${next.amount}` : ""} · {daysUntil(next.due_date) < 0 ? "te laat" : `${daysUntil(next.due_date)} dagen`}</p>
            <button onClick={() => onDone(next)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-3.5 py-1.5 text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Afronden</button>
          </Card>
        )}

        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Geld in beweging · €{Math.round(w.counts.money)}</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {moneyPayments.length === 0 && <p className="text-sm text-muted-foreground italic">Niets op komst.</p>}
            {moneyPayments.map((p, i) => (
              <React.Fragment key={p.id}>
                {i > 0 && <span className="text-muted-foreground/40 shrink-0">→</span>}
                <div className="shrink-0 rounded-xl px-3 py-2 bg-foreground/[0.04]">
                  <p className="text-lg font-display font-semibold tabular-nums" style={{ color: "hsl(var(--d-focus-deep))" }}>€{p.amount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{p.title} · {fmtDate(p.due_date)}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-muted-foreground" /><p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Documentstapel</p></div>
          <p className="text-3xl font-display font-semibold tabular-nums">{activeDocs.length}<span className="text-sm text-muted-foreground font-normal ml-2">documenten · {activeDocs.filter((d) => d.status === "recent").length} in beweging</span></p>
        </Card>

        {stuck && (
          <Card className="border-urgent/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "hsl(var(--d-focus-urgent))" }} />
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: "hsl(var(--d-focus-urgent))" }}>Eén ding zit vast</p>
                <h3 className="text-lg font-display font-semibold tracking-tight mt-0.5">{stuck.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{stuck.notes || "Wachtende"} · {daysUntil(stuck.due_date) < 0 ? `${Math.abs(daysUntil(stuck.due_date))} dagen te laat` : `${daysUntil(stuck.due_date)} dagen`}</p>
                <button onClick={() => onDone(stuck)} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold" style={{ background: "hsl(var(--d-focus-urgent))", color: "hsl(var(--charcoal))" }}><CheckCircle2 className="w-3.5 h-3.5" /> Oplossen</button>
              </div>
            </div>
          </Card>
        )}
      </>
    );
  }

  if (tab === "MONEY") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-1">Geld op komst (30 dagen)</p>
          <p className="text-4xl font-display font-semibold tabular-nums tracking-[-0.03em]" style={{ color: "hsl(var(--d-focus-deep))" }}>€{Math.round(w.counts.money)}</p>
          <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1">
            {moneyPayments.map((p, i) => (
              <React.Fragment key={p.id}>
                {i > 0 && <span className="text-muted-foreground/40 shrink-0">→</span>}
                <div className="shrink-0 rounded-xl px-3.5 py-2.5 bg-foreground/[0.04]">
                  <p className="text-xl font-display font-semibold tabular-nums" style={{ color: "hsl(var(--d-focus-deep))" }}>€{p.amount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{p.title} · {fmtDate(p.due_date)}</p>
                </div>
              </React.Fragment>
            ))}
            {moneyPayments.length === 0 && <p className="text-sm text-muted-foreground italic">Rustige periode.</p>}
          </div>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">De terugkerenden</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Elke maand · {rep.monthly.length}</p>
          <div className="flex flex-wrap gap-2 mt-1.5 mb-3">
            {rep.monthly.length === 0 && <span className="text-sm text-muted-foreground italic">Geen.</span>}
            {rep.monthly.map((o) => <span key={o.id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "hsl(var(--d-focus-light)/0.4)", color: "hsl(var(--d-focus-deep))" }}>{o.title} · €{o.amount}</span>)}
          </div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Elk jaar · {rep.yearly.length}</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {rep.yearly.length === 0 && <span className="text-sm text-muted-foreground italic">Geen.</span>}
            {rep.yearly.map((o) => <span key={o.id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "hsl(var(--d-focus-deep)/0.12)", color: "hsl(var(--d-focus-deep))" }}>{o.title}</span>)}
          </div>
        </Card>
      </>
    );
  }

  if (tab === "DOCUMENTS") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-1">Documenten</p>
          <p className="text-3xl font-display font-semibold tabular-nums">{activeDocs.length}<span className="text-sm text-muted-foreground font-normal ml-2">actief · {activeDocs.filter((d) => d.status === "recent").length} in beweging</span></p>
        </Card>
        {renewals.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Nog geen documenten gekoppeld.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {renewals.slice(0, 4).map((o) => <AdminObligationCard key={o.id} item={o} action="Open" focus onAction={onDone} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </>
    );
  }

  if (tab === "RENEWALS") {
    return (
      <>
        <Card>
          <div className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-muted-foreground" /><p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">De terugkerenden</p></div>
          <p className="text-3xl font-display font-semibold tabular-nums mt-1">{renewals.length}<span className="text-sm text-muted-foreground font-normal ml-2">komen terug</span></p>
        </Card>
        {renewals.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Geen verlengingen of abonnementen.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {renewals.map((o) => <AdminObligationCard key={o.id} item={o} action="Open" focus onAction={onDone} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </>
    );
  }

  if (tab === "OBLIGATIONS") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">Verplichtingen</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="DO" value={data.needsYouCount} color="hsl(var(--d-focus-deep))" note="Vereist actie" />
            <Stat label="WAITING" value={obs.filter((o) => /waiting|wacht/i.test(o.notes || "")).length} color="hsl(var(--d-focus-deep))" note="Wacht op anderen" />
            <Stat label="SCHEDULED" value={events.filter((o) => daysUntil(o.due_date) > 7).length} color="hsl(var(--muted-foreground))" note="Ingepland" />
            <Stat label="WATCHING" value={obs.filter((o) => o.status !== "done").length} color="hsl(var(--muted-foreground))" note="In de gaten" />
          </div>
        </Card>
        {events.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Geen actieve verplichtingen.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {events.map((o) => <AdminObligationCard key={o.id} item={o} action="Open" focus onAction={onDone} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </>
    );
  }

  if (tab === "OPEN") {
    return (
      <>
        <Card>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-1">Openstaand</p>
          <p className="text-3xl font-display font-semibold tabular-nums">{loops.length}<span className="text-sm text-muted-foreground font-normal ml-2">open loops</span></p>
        </Card>
        {loops.length === 0 && <Card><p className="text-sm text-muted-foreground italic">Alles dicht — niets open.</p></Card>}
        <div className="grid sm:grid-cols-2 gap-3">
          {loops.map((o) => (
            <AdminObligationCard key={o.id} item={o} action="Sluit" focus onAction={onDone} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </>
    );
  }

  return null;
}