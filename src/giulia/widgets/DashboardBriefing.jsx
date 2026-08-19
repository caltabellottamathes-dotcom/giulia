import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowRight, Bell } from "lucide-react";
import { fetchUnifiedAttention, DOMAIN_META } from "@/lib/unifiedStream";

/**
 * DashboardBriefing — de drie versmolten blikken boven de widget-grid:
 * "Vandaag · alles" (DailyPlan + events over alle domeinen heen),
 * "Veranderd" (laatste 24u activiteit + berichten, domein-getagd),
 * "Wacht op jou · alles" (approvals/email/whatsapp/threads + SELF-behoeften + LIFE-aandacht).
 */
export default function DashboardBriefing() {
  const [plan, setPlan] = useState(null);
  const [att, setAtt] = useState(null);
  const [changed, setChanged] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toLocaleDateString("sv-SE");
      const since = Date.now() - 24 * 3600 * 1000;
      const [plans, activity, msgs, attention] = await Promise.all([
        base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
        base44.entities.Activity.list("-created_date", 8).catch(() => []),
        base44.entities.Message.list("-created_date", 24).catch(() => []),
        fetchUnifiedAttention(),
      ]);
      setPlan(plans[0] || null);
      setAtt(attention);
      const recentMsgs = (msgs || []).filter((m) => m.agent_source && new Date(m.created_date).getTime() > since).slice(0, 4);
      const recentAct = (activity || []).filter((a) => new Date(a.created_date || a.timestamp).getTime() > since).slice(0, 4);
      setChanged([...recentMsgs, ...recentAct].slice(0, 5));
      setLoading(false);
    })();
  }, []);

  const priorities = (plan?.priorities || []).slice(0, 3);
  const todayEvents = att?.events || [];
  const waiting = att ? {
    approvals: att.approvals.length,
    emails: att.unreadEmails.length,
    whatsapp: att.unreadWhatsapps.length,
    threads: att.openThreads.length,
    needs: att.selfNeeds.length,
    life: att.lifeItemsDue.length,
  } : { approvals: 0, emails: 0, whatsapp: 0, threads: 0, needs: 0, life: 0 };

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
        <Card title="Vandaag · alles" linkTo="/chat" linkLabel="Giulia">
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : (
            <div className="space-y-2">
              {priorities.length > 0 && (
                <ol className="space-y-1.5">
                  {priorities.slice(0, 2).map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-base font-display font-bold text-ivory/35 leading-none mt-0.5">{i + 1}</span>
                      <span className="text-sm leading-snug text-ivory/90">{p}</span>
                    </li>
                  ))}
                </ol>
              )}
              {todayEvents.length > 0 ? (
                <div className="pt-1.5 border-t border-ivory/10 space-y-1">
                  {todayEvents.slice(0, 3).map((e) => {
                    const meta = DOMAIN_META[e.domain || "focus"] || DOMAIN_META.focus;
                    return (
                      <div key={e.id} className="flex items-center gap-2 text-ivory/85">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                        <span className="text-xs leading-snug truncate flex-1">{e.title}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: meta.color }}>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : priorities.length === 0 && <p className="text-sm text-ivory/55">Giulia stelt je prioriteiten samen om 07:00.</p>}
            </div>
          )}
        </Card>

        <Card title="Veranderd" linkTo="/activity" linkLabel="Alles">
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : changed.length ? (
            <ul className="space-y-2">
              {changed.map((c) => {
                const meta = DOMAIN_META[c.domain || "focus"] || DOMAIN_META.focus;
                return (
                  <li key={c.id} className="flex items-start gap-2 text-ivory/85">
                    <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: meta.color }} />
                    <span className="text-[9px] uppercase tracking-wider font-bold mt-1 shrink-0 w-12 truncate" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-sm leading-snug truncate">{c.content || c.description}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-ivory/55">Niets nieuws in de afgelopen 24 uur.</p>}
        </Card>

        <Card title="Wacht op jou · alles" icon={<Bell className="h-3.5 w-3.5 text-ivory/55" />}>
          {loading ? <div className="h-16 rounded-xl bg-ivory/5 animate-pulse" /> : (
            <div className="space-y-2">
              <Link to="/approvals" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory"><span>Goedkeuringen</span><span className="font-display font-bold text-ivory">{waiting.approvals}</span></Link>
              <Link to="/email" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory"><span>Ongelezen email</span><span className="font-display font-bold text-ivory">{waiting.emails}</span></Link>
              <Link to="/whatsapp" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory"><span>WhatsApp</span><span className="font-display font-bold text-ivory">{waiting.whatsapp}</span></Link>
              {waiting.needs > 0 && <Link to="/life/daily-state" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory"><span>SELF behoeften</span><span className="font-display font-bold text-ivory">{waiting.needs}</span></Link>}
              {waiting.life > 0 && <Link to="/life/household" className="flex items-center justify-between text-sm text-ivory/85 hover:text-ivory"><span>LIFE aandacht</span><span className="font-display font-bold text-ivory">{waiting.life}</span></Link>}
              {waiting.threads > 0 && <div className="flex items-center justify-between text-sm text-ivory/85"><span>Wacht op info</span><span className="font-display font-bold text-ivory">{waiting.threads}</span></div>}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}