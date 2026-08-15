import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { SectionLabel } from "../../system/panels/previewParts";
import { Plus } from "lucide-react";

const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-white/30";
const STATUSES = [
  { key: "planning", label: "Planning" },
  { key: "idea", label: "Idee" },
  { key: "in_progress", label: "Lopend" },
  { key: "review", label: "Review" },
];

/** "Project toevoegen" paneel — dashboard-indeling (naar /slick home), GIULIA-glass. */
export default function ProjectAddPanel({ open, onClose, onSaved }) {
  const { closeModule } = usePanel();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", status: "planning", deadline: "", category: "", color: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const p = await base44.entities.Project.create({
        title: form.title.trim(),
        description: form.description,
        status: form.status,
        deadline: form.deadline || undefined,
        category: form.category,
        color: form.color,
        progress: 0,
      });
      onSaved?.();
      onClose?.();
      closeModule();
      navigate(`/projects/${p.id}`);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="right" level={4} width={760} showOverlay={false} className="z-[60]">
      <div className="flex flex-col h-full">
        <div className="px-7 pt-14 pb-8 overflow-y-auto">
          <p className="text-ivory/55 text-[10px] uppercase tracking-[0.24em]">Nieuw</p>
          <h1 className="text-ivory text-2xl font-display font-semibold tracking-tight mt-1">Project toevoegen</h1>

          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            <div className="lg:w-2/5 flex flex-col justify-between min-h-[220px]">
              <div>
                <h2 className="text-ivory text-xl font-display font-semibold leading-tight tracking-tight">Start een nieuw project.</h2>
                <p className="text-ivory/65 text-sm mt-4 leading-relaxed max-w-xs">Geef het een naam, een richting en een deadline. Giulia helpt je van hieruit met de planning.</p>
              </div>
              <button
                onClick={submit}
                disabled={saving || !form.title.trim()}
                className="self-start px-5 py-2.5 rounded-full bg-sand text-charcoal text-sm font-semibold hover:brightness-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_20px_rgba(210,185,140,0.35)]"
              >
                <Plus className="w-4 h-4" /> {saving ? "Aanmaken…" : "Aanmaken"}
              </button>
            </div>
            <div className="hidden lg:block w-px bg-ivory/15" />
            <div className="lg:w-3/5 flex flex-col gap-4">
              <SectionLabel>Gegevens</SectionLabel>
              <div>
                <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Titel</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Naam van het project" className={inputCls} />
              </div>
              <div>
                <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Omschrijving</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Korte omschrijving" rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                    {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Categorie</label>
                  <input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="bv. Marktonderzoek" className={inputCls} />
                </div>
                <div>
                  <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Kleur</label>
                  <input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="#868564" className={inputCls} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}