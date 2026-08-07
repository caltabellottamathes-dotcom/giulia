import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import { mockContacts, mockProjects, mockEmails, mockEvents, mockWhatsApp } from "@/lib/mockData";
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, MessageCircle,
  Briefcase, FileText, Sparkles,
} from "lucide-react";

const sections = ["Profile", "Projects", "Email history", "WhatsApp", "Meetings", "Notes", "Interaction history"];

export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Profile");

  const contact = mockContacts.find((c) => c.id === id) || mockContacts[0];
  const emails = mockEmails.filter((m) => m.contact_id === contact.id);
  const events = mockEvents.filter((e) => e.attendees?.includes(contact.id));
  const messages = mockWhatsApp.filter((m) => m.contact_id === contact.id);
  const projects = mockProjects.filter((p) =>
    emails.some((m) => m.project_id === p.id) || events.some((e) => e.project_id === p.id)
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <button
        onClick={() => navigate("/people")}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Terug naar contacten
      </button>

      {/* Profile header */}
      <GlassPanel level={3} className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={contact.avatar} name={contact.name} size="xl" className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-light tracking-tight">{contact.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{contact.role} · {contact.company}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {contact.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {contact.phone}</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {contact.company}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <GlassButton variant="primary" size="sm"><Mail className="h-4 w-4" /> Email</GlassButton>
            <GlassButton variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> WhatsApp</GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* Section tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={cn(
              "px-4 py-2 text-sm whitespace-nowrap transition-all border-b-2 -mb-px",
              activeSection === s ? "border-olive text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeSection === "Profile" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Overzicht</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-1 rounded-xl p-4">
                  <p className="text-2xl font-heading font-light">{emails.length}</p>
                  <p className="text-xs text-muted-foreground">Emails</p>
                </div>
                <div className="glass-1 rounded-xl p-4">
                  <p className="text-2xl font-heading font-light">{messages.length}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp berichten</p>
                </div>
                <div className="glass-1 rounded-xl p-4">
                  <p className="text-2xl font-heading font-light">{events.length}</p>
                  <p className="text-xs text-muted-foreground">Afspraken</p>
                </div>
                <div className="glass-1 rounded-xl p-4">
                  <p className="text-2xl font-heading font-light">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Gedeelde projecten</p>
                </div>
              </div>
            </GlassPanel>
          )}

          {activeSection === "Projects" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Gekoppelde projecten</h2>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                  >
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Email history" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Email geschiedenis</h2>
              <div className="space-y-2">
                {emails.map((email) => (
                  <div key={email.id} className="p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                    <p className="text-sm font-medium">{email.subject}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{email.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(email.timestamp).toLocaleString("nl-NL")}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "WhatsApp" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">WhatsApp geschiedenis</h2>
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.direction === "sent" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[70%] rounded-xl px-3 py-2 text-sm", msg.direction === "sent" ? "bg-olive/15" : "glass-1")}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {activeSection === "Meetings" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Afspraken</h2>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.start).toLocaleString("nl-NL")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {["Notes", "Interaction history"].includes(activeSection) && (
            <GlassPanel level={2} className="p-6 text-center">
              <p className="text-sm text-muted-foreground">{activeSection} — binnenkort beschikbaar</p>
            </GlassPanel>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-heading font-medium">Giulia context</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {contact.name} is betrokken bij {projects.length} projecten. Laatste contact: {emails[0] ? new Date(emails[0].timestamp).toLocaleDateString("nl-NL") : "onbekend"}.
            </p>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Snelkoppelingen</h3>
            <div className="space-y-1">
              <button onClick={() => navigate("/email")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> {emails.length} emails
              </button>
              <button onClick={() => navigate("/whatsapp")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" /> {messages.length} berichten
              </button>
              <button onClick={() => navigate("/agenda")} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/[0.03] text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="h-4 w-4" /> {events.length} afspraken
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}