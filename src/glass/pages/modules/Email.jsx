import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import { Star } from "lucide-react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";

const PLUM = "#301728", URG = "#d5e24a", OLIVE = "#d8dab3", SAND = "#94925D";

const WEEK = [
  { d: "Ma", v: 12 }, { d: "Di", v: 18 }, { d: "Wo", v: 9 }, { d: "Do", v: 24 }, { d: "Vr", v: 16 }, { d: "Za", v: 6 }, { d: "Zo", v: 4 },
];
const CATS = [
  { n: "Work", v: 42, c: PLUM },
  { n: "Personal", v: 18, c: OLIVE },
  { n: "Promo", v: 12, c: SAND },
  { n: "System", v: 8, c: URG },
];

const INITIAL = [
  { id: 1, from: "Giulia Visser", subject: "Update Marktanalyse rapport", time: "14:32", unread: true, cat: "Work", star: true },
  { id: 2, from: "Notion", subject: "Weekly digest is ready", time: "12:10", unread: true, cat: "System", star: false },
  { id: 3, from: "F. de Boer", subject: "Concept Brons feedback", time: "11:48", unread: true, cat: "Work", star: true },
  { id: 4, from: "LinkedIn", subject: "5 nieuwe connecties deze week", time: "09:20", unread: false, cat: "Promo", star: false },
  { id: 5, from: "Centrum West", subject: "Vergaderruimte bevestigd", time: "gisteren", unread: true, cat: "Personal", star: false },
  { id: 6, from: "Calendar", subject: "Herinnering: 14:00 afspraak", time: "gisteren", unread: false, cat: "System", star: false },
];

const catColor = (c) => (CATS.find(x => x.n === c) || {}).c || PLUM;
const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function Email() {
  const [emails, setEmails] = useState(INITIAL);
  const unread = emails.filter(e => e.unread).length;
  const read = (id) => setEmails(es => es.map(e => e.id === id ? { ...e, unread: false } : e));
  const star = (id, ev) => { ev.stopPropagation(); setEmails(es => es.map(e => e.id === id ? { ...e, star: !e.star } : e)); };

  return (
    <ModuleShell
      index="02" section="EMAIL" statement={`${unread} UNREAD`} kicker="INBOX"
      context={[
        { label: "UNREAD", text: `${unread} berichten wachten op actie.` },
        { label: "STARRED", text: `${emails.filter(e => e.star).length} gemarkeerd als belangrijk.` },
        { label: "TODAY", text: "Piekmoment op donderdag — 24 berichten ontvangen." },
      ]}
      actions={[{ label: "Compose", primary: true }, { label: "Mark All Read" }, { label: "Archive" }, { label: "Open Email" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">UNREAD</p>
            <p className="text-storm text-5xl font-bold mt-1 tabular-nums"><CountUp to={unread} /></p>
            <p className="text-urgent text-[10px] tracking-wider mt-2">wachten op antwoord</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIES</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATS} dataKey="v" nameKey="n" innerRadius={42} outerRadius={68} paddingAngle={3} isAnimationActive animationDuration={1000}>
                    {CATS.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {CATS.map(c => (
                <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">INCOMING · LIVE</p>
            <PulseWave color={URG} bars={22} height={40} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">THIS WEEK · RECEIVED</p>
          <div className="h-32 rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {WEEK.map((w, i) => <Cell key={i} fill={i === 3 ? URG : PLUM} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3 mt-4">INBOX · {emails.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {emails.map(e => (
              <button key={e.id} onClick={() => read(e.id)} className="w-full flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-2.5 text-left transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${e.unread ? "bg-urgent" : "bg-transparent"}`} />
                <span className="w-8 h-8 rounded-full bg-plum/40 text-storm text-[10px] font-semibold flex items-center justify-center shrink-0">{initials(e.from)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${e.unread ? "text-storm font-semibold" : "text-storm/60"}`}>{e.from}</p>
                  <p className="text-[11px] text-storm/50 truncate">{e.subject}</p>
                </div>
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: catColor(e.cat) }} />
                <span className="text-[10px] text-storm/40 tabular-nums w-12 text-right shrink-0">{e.time}</span>
                <span onClick={(ev) => star(e.id, ev)} className={`shrink-0 ${e.star ? "text-urgent" : "text-storm/30 hover:text-storm/60"}`}><Star className="w-4 h-4" fill={e.star ? "currentColor" : "none"} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}