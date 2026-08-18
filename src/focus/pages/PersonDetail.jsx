import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import Avatar from "@/system/components/glass/Avatar";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import ImageInput from "@/system/components/glass/ImageInput";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, MessageCircle,
  Briefcase, Sparkles, Pencil, Trash2,
} from "lucide-react";

const sections = ["Profile", "Projects", "Email history", "WhatsApp", "Meetings"];

export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Profile");
  const [contact, setContact] = useState(null);
  const [emails, setEmails] = useState([]);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  const load = async () => {
    try {
      const c = await base44.entities.Contact.get(id);
      setContact(c);
      const [allEmails, allMsgs, allProjects] = await Promise.all([
        base44.entities.Email.list(),
        base44.entities.WhatsAppMessage.list().catch(() => []),
        base44.entities.Project.list(),
      ]);
      setEmails(allEmails.filter((m) => m.contact_id === id));
      setMessages(allMsgs.filter((m) => m.contact_id === id));
      setProjects(allProjects.filter((p) => (c.project_ids || []).includes(p.id)));
    } catch (e) {
      /* not found */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const startEdit = () => {
    if (!contact) return;
    setEditDraft({
      name: contact.name || "", company: contact.company || "", role: contact.role || "",
      email: contact.email || "", phone: contact.phone || "", avatar: contact.avatar || "",
      notes: contact.notes || "", relationship_type: contact.relationship_type || "",
    });
    setEditing(true);
  };
  const saveEdit = async () => {
    await base44.entities.Contact.update(id, { ...editDraft, name: editDraft.name.trim() });
    setEditing(false);
    load();
  };
  const del = async () => {
    if (!window.confirm("Contact verwijderen?")) return;
    await base44.entities.Contact.delete(id);
    navigate("/");
  };

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;
  if (!contact) return (
    <GlassPanel level={2} className="p-12 text-center">
      <p className="text-sm text-muted-foreground">Contact niet gevonden</p>
      <GlassButton variant="outline" size="sm" className="mt-4" onClick={() => navigate("/")}>Terug</GlassButton>
    </GlassPanel>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3 w-3" /> Terug naar contacten
      </button>

      <GlassPanel level={3} className="p-6 lg:p-8 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={startEdit} className="inline-flex items-center gap-1.5 rounded-full glass-1 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition"><Pencil className="h-3.5 w-3.5" /> Bewerk</button>
          <button onClick={del} className="inline-flex items-center gap-1.5 rounded-full glass-1 px-3 py-1.5 text-xs font-semibold text-foreground hover:text-destructive transition"><Trash2 className="h-3.5 w-3.5" /> Verwijder</button>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar src={contact.avatar} name={contact.name} size="xl" className="h-20 w-20 text-2xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-light tracking-tight">{contact.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{contact.role}{contact.company ? ` · ${contact.company}` : ""}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              {contact.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {contact.email}</span>}
              {contact.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {contact.phone}</span>}
              {contact.company && <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {contact.company}</span>}
            </div>
            {contact.notes && <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-2xl">{contact.notes}</p>}
          </div>
        </div>
      </GlassPanel>

      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border/40">
        {sections.map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={cn("px-4 py-2 text-sm whitespace-nowrap transition-all border-b-2 -mb-px", activeSection === s ? "border-olive text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeSection === "Profile" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Overzicht</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-1 rounded-xl p-4"><p className="text-2xl font-heading font-light">{emails.length}</p><p className="text-xs text-muted-foreground">Emails</p></div>
                <div className="glass-1 rounded-xl p-4"><p className="text-2xl font-heading font-light">{messages.length}</p><p className="text-xs text-muted-foreground">WhatsApp</p></div>
                <div className="glass-1 rounded-xl p-4"><p className="text-2xl font-heading font-light">{projects.length}</p><p className="text-xs text-muted-foreground">Projecten</p></div>
              </div>
            </GlassPanel>
          )}
          {activeSection === "Projects" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Gekoppelde projecten</h2>
              <div className="space-y-2">
                {projects.length === 0 && <p className="text-sm text-muted-foreground">Geen gekoppelde projecten.</p>}
                {projects.map((project) => (
                  <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1"><p className="text-sm font-medium">{project.title}</p><p className="text-xs text-muted-foreground">{project.category}</p></div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
          {activeSection === "Email history" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Email geschiedenis</h2>
              <div className="space-y-2">
                {emails.length === 0 && <p className="text-sm text-muted-foreground">Geen emails.</p>}
                {emails.map((email) => (
                  <div key={email.id} className="p-3 rounded-xl hover:bg-foreground/[0.02] transition-colors cursor-pointer" onClick={() => navigate("/email")}>
                    <p className="text-sm font-medium">{email.subject}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{email.body}</p>
                    {email.timestamp && <p className="text-[10px] text-muted-foreground mt-1">{new Date(email.timestamp).toLocaleString("nl-NL")}</p>}
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
          {activeSection === "WhatsApp" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">WhatsApp geschiedenis</h2>
              <div className="space-y-2">
                {messages.length === 0 && <p className="text-sm text-muted-foreground">Geen berichten.</p>}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.direction === "sent" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[70%] rounded-xl px-3 py-2 text-sm", msg.direction === "sent" ? "bg-olive/15" : "glass-1")}>{msg.message}</div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}
          {activeSection === "Meetings" && (
            <GlassPanel level={2} className="p-6">
              <h2 className="text-sm font-heading font-medium mb-4">Afspraken</h2>
              <p className="text-sm text-muted-foreground">Afspraken worden via de agenda en projecten bijgehouden.</p>
            </GlassPanel>
          )}
        </div>

        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-olive" />
              <h3 className="text-sm font-heading font-medium">Giulia context</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {contact.name} is betrokken bij {projects.length} projecten, {emails.length} emails en {messages.length} WhatsApp-berichten.
              {contact.relationship_type && ` Relatie: ${contact.relationship_type}.`}
            </p>
          </GlassPanel>
        </div>
      </div>

      <FloatingPanel open={editing} onClose={() => setEditing(false)} position="right">
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
            <GlassButton variant="outline" size="md" onClick={() => setEditing(false)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}