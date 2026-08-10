import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import FloatingPanel from "@/components/glass/FloatingPanel";
import Avatar from "@/components/glass/Avatar";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Mail, Phone, Users, Pencil, Trash2 } from "lucide-react";
import ImageInput from "@/components/glass/ImageInput";

export default function People() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", role: "", email: "", phone: "" });
  const [editContact, setEditContact] = useState(null);
  const [editDraft, setEditDraft] = useState({});

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

  const startEdit = (c) => {
    setEditContact(c);
    setEditDraft({ name: c.name || "", company: c.company || "", role: c.role || "", email: c.email || "", phone: c.phone || "", avatar: c.avatar || "", notes: c.notes || "", relationship_type: c.relationship_type || "" });
  };
  const saveEdit = async () => {
    if (!editContact) return;
    await base44.entities.Contact.update(editContact.id, { ...editDraft, name: editDraft.name.trim() });
    setEditContact(null);
    reload();
  };
  const delContact = async (c) => {
    if (!window.confirm("Contact verwijderen?")) return;
    await base44.entities.Contact.delete(c.id);
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
          <GlassPanel key={contact.id} level={2} className="p-5 cursor-pointer hover:scale-[1.01] transition-transform group relative">
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              <button onClick={(e) => { e.stopPropagation(); startEdit(contact); }} className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition" aria-label="Bewerk"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={(e) => { e.stopPropagation(); delContact(contact); }} className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition" aria-label="Verwijder"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
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

      <FloatingPanel open={!!editContact} onClose={() => setEditContact(null)} position="right">
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Contact bewerken</h2>
          <ImageInput label="Avatar" value={editDraft.avatar || ""} onChange={(url) => setEditDraft({ ...editDraft, avatar: url })} />
          {[
            { k: "name", l: "Naam" }, { k: "company", l: "Bedrijf" },
            { k: "role", l: "Functie" }, { k: "email", l: "Email" }, { k: "phone", l: "Telefoon" },
            { k: "relationship_type", l: "Relatie" },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.l}</label>
              <input value={editDraft[f.k] || ""} onChange={(e) => setEditDraft({ ...editDraft, [f.k]: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notities</label>
            <textarea value={editDraft.notes || ""} onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none min-h-[70px] resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEdit}>Opslaan</GlassButton>
            <GlassButton variant="outline" size="md" onClick={() => setEditContact(null)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}