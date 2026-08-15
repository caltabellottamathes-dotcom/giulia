import React, { useState, useEffect } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import Avatar from "@/system/components/glass/Avatar";
import PanelForm from "@/system/components/glass/PanelForm";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Link2 } from "lucide-react";

/** People — contacts linked to the project (via contact.project_ids). */
export default function PeopleSection({ project }) {
  const [contacts, setContacts] = useState([]);
  const [linkOpen, setLinkOpen] = useState(false);

  const load = async () => setContacts(await base44.entities.Contact.list());
  useEffect(() => { load(); }, [project.id]);

  const linked = contacts.filter((c) => (c.project_ids || []).includes(project.id));
  const available = contacts.filter((c) => !(c.project_ids || []).includes(project.id));

  const link = async (c) => {
    await base44.entities.Contact.update(c.id, { project_ids: [...(c.project_ids || []), project.id] });
    load();
  };
  const unlink = async (c) => {
    await base44.entities.Contact.update(c.id, { project_ids: (c.project_ids || []).filter((x) => x !== project.id) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold">Betrokkenen</h2>
        <GlassButton variant="glass" size="sm" onClick={() => setLinkOpen(true)}><Link2 className="h-3.5 w-3.5" /> Koppel contact</GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {linked.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-4 group flex items-center gap-3">
            <Avatar src={c.avatar} name={c.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{c.name}</p>
              {c.role && <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>}
              {c.company && <p className="text-[11px] text-muted-foreground truncate">{c.company}</p>}
            </div>
            <button onClick={() => unlink(c)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {linked.length === 0 && (
          <GlassPanel level={1} className="p-8 text-center md:col-span-3">
            <p className="text-sm text-muted-foreground">Nog geen personen gekoppeld aan dit project.</p>
          </GlassPanel>
        )}
      </div>

      <PanelForm
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        eyebrow="Personen"
        title="Koppel een contact"
        width={460}
        footer={<button onClick={() => setLinkOpen(false)} className="ml-auto px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Sluiten</button>}
      >
        <div className="space-y-1.5">
          {available.map((c) => (
            <button key={c.id} onClick={() => link(c)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-foreground/[0.04] transition text-left">
              <Avatar src={c.avatar} name={c.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{c.name}</p>
                {c.role && <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>}
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          {available.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Alle contacten zijn al gekoppeld.</p>}
        </div>
      </PanelForm>
    </div>
  );
}