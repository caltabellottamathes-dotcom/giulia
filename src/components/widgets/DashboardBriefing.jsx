import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowRight, Bell } from "lucide-react";

/**
 * DashboardBriefing — the three glanceable bars above the widget grid:
 * "Vandaag" (top 3 from DailyPlan), "Veranderd" (last 24h of agent + activity),
 * "Wacht op jou" (pending approvals, unread mail/whatsapp, needs-info threads).
 */
export default function DashboardBriefing() {
  const [plan, setPlan] = useState(null);
  const [changed, setChanged] = useState([]);
  const [waiting, setWaiting] = useState({ approvals: 0, emails: 0, whatsapp: 0, threads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toLocaleDateString("sv-SE");
      const since = Date.now() - 24 * 3600 * 1000;
      const [plans, activity, msgs, approvals, emails, wa, threads] = await Promise.all([
        base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
        base44.entities.Activity.list("-created_date", 8).catch(() => []),
        base44.entities.Message.list("-created_date", 24).catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
        base44.entities.Thread.filter({ needs_info: true }).catch(() => []),
      ]);
      setPlan(plans[0] || null);
      const recentMsgs = (msgs || []).filter((m) => m.agent_source && new Date(m.created_date).getTime() > since).slice(0, 4);
      const recentAct = (activity || []).filter((a) => new Date(a.created_date || a.timestamp).getTime() > since).slice(0, 4);
      setChanged([...recentMsgs, ...recentAct].slice(0, 5));
      setWaiting({ approvals: approvals.length, emails: emails.length, whatsapp: wa.length, threads: threads.length });
      setLoading(false);
    })();
  }, []);

  const priorities = (plan?.priorities || []).slice(0, 3);

  const Card = ({ title, linkTo, linkLabel, children, icon }) => (
    <div className="glass-dark rounded-2xl p-5 float-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/70">{title}</h3>
        {linkTo ? (
          <Link to={linkTo} className="text-[10px] text-ivory/55 hover:text-ivory inline-flex items-center gap-1">{linkLabel} <ArrowRight className="h-3 w-3" /></Link>
        ) : icon}
      </div>
      {children}
    </div>
  );

  return (
    <div className="px-5 lg:px-10 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Card title="Vandaag" linkTo="/chat" linkLabel="Giulia">
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : priorities.length ? (
            <ol className="space-y-2.5">
              {priorities.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xl font-display font-bold text-ivory/35 leading-none mt-0.5">{i + 1}</span>
                  <span className="text-sm leading-snug text-ivory/90">{p}</span>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-ivory/55">Giulia stelt je prioriteiten samen om 07:00.</p>}
        </Card>

        <Card title="Veranderd" linkTo="/activity" linkLabel="Alles">
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : changed.length ? (
            <ul className="space-y-2">
              {changed.map((c) => (
                <li key={c.id} className="flex items-start gap-2 text-ivory/85">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-ivory/45 mt-1 shrink-0 w-16 truncate">{c.agent_source || c.source || "systeem"}</span>
                  <span className="text-sm leading-snug truncate">{c.content || c.description}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ivory/55">Niets nieuws in de afgelopen 24 uur.</p>}
        </Card>

        <Card title="Wacht op jou" icon={<Bell className="h-3.5 w-3.5 text-ivory/55" />}>
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : (
            <div className="space-y-2.5">
              <Link to="/approvals" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory">
                <span>Goedkeuringen</span><span className="font-display font-bold text-ivory">{waiting.approvals}</span>
              </Link>
              <Link to="/email" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory">
                <span>Ongelezen email</span><span className="font-display font-bold text-ivory">{waiting.emails}</span>
              </Link>
              <Link to="/whatsapp" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory">
                <span>WhatsApp</span><span className="font-display font-bold text-ivory">{waiting.whatsapp}</span>
              </Link>
              {waiting.threads > 0 && (
                <div className="flex items-center justify-between text-sm text-ivory/85"><span>Wacht op info</span><span className="font-display font-bold text-ivory">{waiting.threads}</span></div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}