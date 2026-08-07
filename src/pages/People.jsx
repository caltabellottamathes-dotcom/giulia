import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import Avatar from "@/components/glass/Avatar";
import { mockContacts, mockProjects, mockEmails, mockEvents } from "@/lib/mockData";
import { Search, Plus, Mail, Phone, Building2, ArrowRight } from "lucide-react";

export default function People() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockContacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">People</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw contactomgeving</p>
        </div>
        <GlassButton variant="primary" size="md">
          <Plus className="h-4 w-4" /> Nieuw contact
        </GlassButton>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek contacten..."
          className="w-full glass-1 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
        />
      </div>

      {/* Contact grid — editorial */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => {
          const contactProjects = mockProjects.filter((p) =>
            mockEmails.some((m) => m.contact_id === contact.id && m.project_id === p.id)
          );
          return (
            <GlassPanel
              key={contact.id}
              level={2}
              className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group"
            >
              <div className="flex items-start gap-4 mb-4" onClick={() => navigate(`/people/${contact.id}`)}>
                <Avatar src={contact.avatar} name={contact.name} size="xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-heading font-medium group-hover:text-foreground transition-colors">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>
                  <p className="text-xs text-muted-foreground">{contact.company}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1.5 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {contact.phone}
                </div>
              </div>
              {contactProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gekoppelde projecten</p>
                  <div className="flex flex-wrap gap-1">
                    {contactProjects.slice(0, 2).map((p) => (
                      <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full glass-1 text-muted-foreground">{p.title}</span>
                    ))}
                  </div>
                </div>
              )}
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}