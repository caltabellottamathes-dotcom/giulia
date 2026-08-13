import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import PageHero from "@/components/glass/PageHero";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { Building2, Calendar, Sparkles, Edit3, UserCircle, Briefcase, CheckSquare, Users, FileText, Brain } from "lucide-react";
import { GIULIA_QUESTIONS } from "@/lib/giuliaQuestions";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { data: projects } = useEntityList("Project");
  const { data: tasks } = useEntityList("Task");
  const { data: contacts } = useEntityList("Contact");
  const { data: notes } = useEntityList("Note");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const name = user?.full_name || "—";
  const email = user?.email || "—";
  const role = user?.role || "user";
  const joined = user?.created_date
    ? new Date(user.created_date).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
    : "—";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "—";
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  const stats = [
    { icon: Briefcase, value: projects.length, label: "Projecten" },
    { icon: CheckSquare, value: tasks.length, label: "Taken" },
    { icon: Users, value: contacts.length, label: "Contacten" },
    { icon: FileText, value: notes.length, label: "Notities" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="profile"
        icon={UserCircle}
        eyebrow="Account"
        title="Profiel"
        subtitle="Jouw account en voorkeuren"
      />

      {/* Profile header */}
      <GlassPanel level={3} className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="h-24 w-24 rounded-2xl bg-charcoal text-ivory flex items-center justify-center text-4xl font-display font-semibold shrink-0">
            {initial}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-medium">{name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {role === "admin" ? "Beheerder" : "Gebruiker"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Lid sinds {joined}</span>
            </div>
          </div>
          <GlassButton variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <Edit3 className="h-4 w-4" /> Voorkeuren
          </GlassButton>
        </div>
      </GlassPanel>

      {/* Profile details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel level={2} className="p-6">
          <h3 className="text-sm font-heading font-medium mb-4">Account informatie</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Naam</span>
              <span className="text-sm">{name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Rol</span>
              <span className="text-sm">{role === "admin" ? "Beheerder" : "Gebruiker"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Tijdzone</span>
              <span className="text-sm">{tz}</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel level={2} className="p-6">
          <h3 className="text-sm font-heading font-medium mb-4">Voorkeuren</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Taal</span>
              <span className="text-sm">Nederlands</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Thema</span>
              <span className="text-sm">Light</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Proactiviteit</span>
              <span className="text-sm">Gebalanceerd</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Stem</span>
              <span className="text-sm">River</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Activity stats — real counts from the user's data */}
      <GlassPanel level={3} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-olive" />
          <h3 className="text-sm font-heading font-medium">Jouw activiteit</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-heading font-light">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      {user?.giulia_answers && Object.keys(user.giulia_answers).length > 0 && (
        <GlassPanel level={3} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-olive" />
            <h3 className="text-sm font-heading font-medium">Wat Giulia over je weet</h3>
          </div>
          <div className="space-y-1">
            {GIULIA_QUESTIONS.filter((q) => user.giulia_answers[q.key]).map((q) => (
              <div key={q.key} className="py-3 border-b border-border/40 last:border-0">
                <p className="text-xs text-muted-foreground mb-1 leading-snug">{q.title}</p>
                <p className="text-sm leading-relaxed">{user.giulia_answers[q.key]}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}