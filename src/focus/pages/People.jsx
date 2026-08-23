import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PanelForm from "@/system/components/glass/PanelForm";
import Avatar from "@/system/components/glass/Avatar";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Mail, Phone, Users, Pencil, Trash2, GitMerge } from "lucide-react";
import ImageInput from "@/system/components/glass/ImageInput";
import { groupByLetter } from "@/lib/contacts";

export default function People() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", role: "", email: "", phone: "" });
  const [editContact, setEditContact] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeA, setMergeA] = useState(null);
  const [mergeB, setMergeB] = useState(null);
  const { toast } = useToast();

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

  const doMerge = async () => {
    if (!mergeA || !mergeB || mergeA === mergeB) return;
    const a = contacts.find((c) => c.id === mergeA);
    const b = contacts.find((c) => c.id === mergeB);
    if (!a || !b) return;
    const merged = { ...b };
    ["name", "company", "role", "email", "phone", "avatar", "notes", "relationship_type", "relationship_domain"].forEach((f) => {
      if (!merged[f] && a[f]) merged[f] = a[f];
    });
    merged.project_ids = Array.from(new Set([...(b.project_ids || []), ...(a.project_ids || [])]));
    await base44.entities.Contact.update(b.id, merged).catch(() => {});
    await base44.entities.WhatsAppMessage.updateMany({ contact_id: a.id }, { $set: { contact_id: b.id } }).catch(() => {});
    await base44.entities.Email.updateMany({ contact_id: a.id }, { $set: { contact_id: b.id } }).catch(() => {});
    await base44.entities.Task.updateMany({ contact_id: a.id }, { $set: { contact_id: b.id } }).catch(() => {});
    await base44.entities.Contact.delete(a.id).catch(() => {});
    toast({ title: "Samengevoegd", description: `${a.name} → ${b.name}` });
    setMergeOpen(false); setMergeA(null); setMergeB(null);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="people"
        icon={Users}
        eyebrow="Netwerk"
        title="People Around Me."
        subtitle="Jouw contactomgeving"
        actions={
          <div className="flex gap-2">
            <GlassButton variant="outline" size="md" onClick={() => setMergeOpen(true)}>
              <GitMerge className="h-4 w-4" /> Samenvoegen
            </GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> Nieuw contact
            </GlassButton>
          </div>
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <GlassPanel level={2} className="p-12 text-center">
          <p className="text-sm text-muted-foreground">Geen contacten gevonden{search ? ` voor "${search}"` : ""}</p>
          <GlassButton variant="primary" size="sm" className="mt-4" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> Voeg een contact toe
          </GlassButton>
        </GlassPanel>
      ) : (
        <div className="space-y-5">
          {groupByLetter(filtered).map(({ letter, items }) => (
            <div key={letter}>
              <div className="sticky top-0 z-10 -mx-1 px-3 py-1.5 bg-background/75 backdrop-blur-md flex items-baseline gap-2">
                <span className="text-xs font-display font-bold text-muted-foreground tracking-wider">{letter}</span>
                <span className="text-[11px] text-muted-foreground/70">{items.length}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
                {items.map((contact) => (
                  <GlassPanel key={contact.id} level={1} className="p-3 cursor-pointer hover:scale-[1.02] transition-transform group relative">
                    <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
                      <button onClick={(e) => { e.stopPropagation(); startEdit(contact); }} className="h-6 w-6 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition" aria-label="Bewerk"><Pencil className="h-3 w-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); delContact(contact); }} className="h-6 w-6 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition" aria-label="Verwijder"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <div onClick={() => navigate(`/people/${contact.id}`)} className="flex items-center gap-3">
                      <Avatar src={contact.avatar} name={contact.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-display font-semibold truncate">{contact.name}</h3>
                        <p className="text-[11px] text-muted-foreground truncate">{[contact.role, contact.company].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                    {(contact.phone || contact.email) && (
                      <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-border/30">
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition shrink-0">
                            <Phone className="h-3 w-3" /> <span className="truncate max-w-[90px]">{contact.phone}</span>
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition min-w-0">
                            <Mail className="h-3 w-3" /> <span className="truncate">{contact.email}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </GlassPanel>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PanelForm
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nieuw contact"
        eyebrow="Mensen"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={createContact}>Maak aan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setShowNew(false)}>Annuleer</GlassButton>
        </>}
      >
        {[
          { k: "name", l: "Naam" }, { k: "company", l: "Bedrijf" },
          { k: "role", l: "Functie" }, { k: "email", l: "Email" }, { k: "phone", l: "Telefoon" },
        ].map((f) => (
          <div key={f.k}>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.l}</label>
            <input value={draft[f.k]} onChange={(e) => setDraft({ ...draft, [f.k]: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
          </div>
        ))}
      </PanelForm>

      <PanelForm
        open={!!editContact}
        onClose={() => setEditContact(null)}
        title="Contact bewerken"
        eyebrow="Mensen"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEdit}>Opslaan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setEditContact(null)}>Annuleer</GlassButton>
        </>}
      >
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
      </PanelForm>

      <PanelForm
        open={mergeOpen}
        onClose={() => { setMergeOpen(false); setMergeA(null); setMergeB(null); }}
        title="Contacten samenvoegen"
        eyebrow="Mensen"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={doMerge} disabled={!mergeA || !mergeB || mergeA === mergeB}>Samenvoegen</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => { setMergeOpen(false); setMergeA(null); setMergeB(null); }}>Annuleer</GlassButton>
        </>}
      >
        <p className="text-xs text-muted-foreground mb-3">Kies twee contacten. De tweede behoudt de naam; lege velden worden aangevuld vanuit de eerste. Berichten, e-mails en taken worden overgezet naar het behouden contact.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Van (wordt verwijderd)</label>
            <select value={mergeA || ""} onChange={(e) => setMergeA(e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              <option value="">— kies —</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Naar (wordt behouden)</label>
            <select value={mergeB || ""} onChange={(e) => setMergeB(e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              <option value="">— kies —</option>
              {contacts.filter((c) => c.id !== mergeA).map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>)}
            </select>
          </div>
        </div>
      </PanelForm>
    </div>
  );
}