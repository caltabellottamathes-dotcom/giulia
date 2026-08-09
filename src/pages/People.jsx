import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import FloatingPanel from "@/components/glass/FloatingPanel";
import Avatar from "@/components/glass/Avatar";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Mail, Phone, Users } from "lucide-react";

export default function People() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", role: "", email: "", phone: "" });

  const { data: contacts, loading, reload } = useEntityList("Contact");

  const filtered = contacts.filter((c) =>
    !search || (c.name || "").toLowerCase().includes(search.toLowerCase()) || (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const createContact = async () => {
    if (!draft.name.trim()) return;
    await base44.entities.Contact.create({ ...draft, name: draft.name.trim() });
    setDraft({ name: "", company: "", role: "", email: "", phone: "" });
    setShowNew(false);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="people"
        icon={Users}
        eyebrow="Netwerk"
        title="Mensen"
        subtitle="Jouw contactomgeving"
        actions={
          <GlassButton variant="primary" size="md" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Nieuw contact
          </GlassButton>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek contacten..."
          className="w-full glass-1 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-44 rounded-2xl shimmer" />)}
        {!loading && filtered.map((contact) => (
          <GlassPanel key={contact.id} level={2} className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group">
            <div className="flex items-start gap-4 mb-4" onClick={() => navigate(`/people/${contact.id}`)}>
              <Avatar src={contact.avatar} name={contact.name} size="xl" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-display font-semibold group-hover:text-foreground transition-colors">{contact.name}</h3>
                {contact.role && <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>}
                {contact.company && <p className="text-xs text-muted-foreground">{contact.company}</p>}
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-border/40">
              {contact.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> <span className="truncate">{contact.email}</span></div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {contact.phone}</div>
              )}
            </div>
          </GlassPanel>
        ))}
        {!loading && filtered.length === 0 && (
          <GlassPanel level={2} className="p-12 text-center md:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted-foreground">Nog geen contacten</p>
            <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> Voeg je eerste contact toe
            </GlassButton>
          </GlassPanel>
        )}
      </div>

      <FloatingPanel open={showNew} onClose={() => setShowNew(false)} position="right">
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Nieuw contact</h2>
          {[
            { k: "name", l: "Naam" }, { k: "company", l: "Bedrijf" },
            { k: "role", l: "Functie" }, { k: "email", l: "Email" }, { k: "phone", l: "Telefoon" },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.l}</label>
              <input value={draft[f.k]} onChange={(e) => setDraft({ ...draft, [f.k]: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="md" className="flex-1" onClick={createContact}>Maak aan</GlassButton>
            <GlassButton variant="outline" size="md" onClick={() => setShowNew(false)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}