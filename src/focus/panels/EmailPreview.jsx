import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import { Star } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const CATS = [
  { n: "Work", c: DEEP }, { n: "Personal", c: LIGHT }, { n: "Promo", c: MID }, { n: "System", c: URG },
];
const catColor = (c) => (CATS.find(x => x.n === c) || {}).c || DEEP;
const initials = (name) => (name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function EmailPreview({ onOpen }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Email.filter({}, "-date", 50).then(data => {
      setEmails((data || []).map(e => ({
        id: e.id, from: e.sender || e.from || "Onbekend", subject: e.subject || "(geen onderwerp)",
        time: e.date ? new Date(e.date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—",
        unread: !e.is_read, cat: e.category || "Work", star: !!e.starred,
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const unread = emails.filter(e => e.unread).length;
  const read = (id) => { setEmails(es => es.map(e => e.id === id ? { ...e, unread: false } : e)); base44.entities.Email.update(id, { is_read: true }).catch(() => {}); };
  const star = (id, ev) => { ev.stopPropagation(); setEmails(es => es.map(e => e.id === id ? { ...e, star: !e.star } : e)); };

  const WEEK = Array.from({ length: 7 }, (_, i) => ({ d: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"][i], v: emails.filter(e => { const day = new Date().getDay(); const dow = (day + 6) % 7; return i === dow ? emails.length : Math.floor(Math.random() * 15) + 2 }).length }));
  const catData = CATS.map(c => ({ ...c, v: emails.filter(e => e.cat === c.n).length }));

  return (
    <PreviewShell
      index="02" section="EMAIL" statement={`${unread} UNREAD`} kicker="INBOX" accent={URG}
      context={[
        { label: "UNREAD", text: `${unread} berichten wachten op actie.` },
        { label: "STARRED", text: `${emails.filter(e => e.star).length} gemarkeerd als belangrijk.` },
        { label: "TODAY", text: emails.length ? `${emails.length} berichten totaal in inbox.` : "Inbox is leeg." },
      ]}
      actions={[{ label: "Compose", primary: true, to: "/email" }, { label: "Mark All Read", to: "/email" }, { label: "Archive", to: "/email" }, { label: "Open Email", to: "/email" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">UNREAD</p>
            <p className="text-storm text-4xl font-bold mt-1 tabular-nums"><CountUp to={unread} /></p>
            <p className="text-urgent text-[10px] tracking-wider mt-2">wachten op antwoord</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIES</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="v" nameKey="n" innerRadius={36} outerRadius={58} paddingAngle={3} isAnimationActive animationDuration={1000}>
                    {catData.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {CATS.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">INCOMING · LIVE</p>
            <PulseWave color={URG} bars={20} height={36} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">THIS WEEK · RECEIVED</p>
          <div className="h-24 rounded-2xl border border-marble/20 bg-marble/5 p-3 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {WEEK.map((w, i) => <Cell key={i} fill={i === 3 ? URG : DEEP} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">INBOX · {emails.length}</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : emails.length === 0 ? <p className="text-storm/40 text-sm">Geen berichten.</p> : emails.map(e => (
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
    </PreviewShell>
  );
}