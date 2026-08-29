import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import StageSelect from "./StageSelect";

const FREQS = ["weekly", "biweekly", "monthly", "bimonthly", "quarterly", "semiannual", "annual", "once", "variable"];
const STATUSES = [{ v: "expected", l: "Verwacht" }, { v: "received", l: "Ontvangen" }, { v: "partial", l: "Gedeeltelijk" }, { v: "missed", l: "Gemist" }];
const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";
const label = "text-[9px] uppercase tracking-[0.18em] text-ivory/60 font-semibold mb-1 block";
const sub = "text-[9px] text-ivory/50 mb-1 block";

const blank = { description: "", amount: "", frequency: "monthly", expected_date: "", category: "", received_amount: "", status: "expected" };

/** IncomeStage — schuift uit (MediaStage-paneel) om álles rond inkomsten te
 *  beheren: eenmalige én vaste bronnen, aanmaken/bewerken/verwijderen, status
 *  en ontvangen bedrag bijwerken. Opent via giulia:open-income-stage met
 *  detail "new" of een income-id. */
export default function IncomeStage({ incomeId, onClose }) {
  const { toast } = useToast();
  const { data: incomes } = useEntityList("Income", { limit: 200, realtime: true });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const list = incomes || [];
  const oneTime = list.filter((i) => !i.recurring);
  const recurring = list.filter((i) => i.recurring);

  useEffect(() => {
    if (incomeId === "new") { setEditing("new"); setForm(blank); return; }
    if (incomeId) {
      const found = list.find((i) => i.id === incomeId);
      if (found) { setEditing(found); setForm({ ...found }); }
    }
  }, [incomeId]); // eslint-disable-line

  const reload = () => window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === "" || v == null ? 0 : Number(v));
  const isNew = editing === "new" || !editing?.id;

  const save = async () => {
    if (!form.amount) return;
    setBusy(true);
    try {
      const payload = {
        description: form.description || "",
        amount: num(form.amount) ?? 0,
        frequency: form.frequency || "monthly",
        expected_date: form.expected_date || null,
        category: form.category || "",
        received_amount: num(form.received_amount) || null,
        status: form.status || "expected",
        recurring: (form.frequency || "monthly") !== "once",
      };
      if (isNew) { await base44.entities.Income.create(payload); toast({ title: "Inkomen aangemaakt" }); }
      else { await base44.entities.Income.update(editing.id, payload); toast({ title: "Inkomen opgeslagen" }); }
      reload();
      setEditing(null);
      setForm(blank);
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const del = async (i) => {
    setBusy(true);
    try {
      await base44.entities.Income.delete(i.id);
      toast({ title: "Inkomen verwijderd" });
      reload();
      if (editing?.id === i.id) { setEditing(null); setForm(blank); }
    } catch {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const edit = (i) => { setEditing(i); setForm({ ...i }); };

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">Inkomsten beheren</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-display font-bold tracking-[-0.02em]">Inkomstenbronnen</h2>
          <button onClick={() => { setEditing("new"); setForm(blank); }} className="inline-flex items-center gap-1 rounded-full bg-ivory text-charcoal px-3 py-1.5 text-[11px] font-bold transition">
            <Plus className="w-3.5 h-3.5" /> Nieuw
          </button>
        </div>

        {/* editor */}
        {editing && (
          <div className="rounded-2xl bg-white/8 border border-white/12 p-3 space-y-3">
            <p className={label}>{isNew ? "Nieuw inkomen" : "Bewerken"}</p>
            <input className={input} placeholder="Bron / beschrijving" value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div><span className={sub}>Bedrag €</span><input type="number" step="0.01" className={input} value={form.amount ?? ""} onChange={(e) => set("amount", e.target.value)} /></div>
              <div><span className={sub}>Frequentie</span><StageSelect value={form.frequency || "monthly"} onChange={(v) => set("frequency", v)} options={FREQS.map((f) => ({ value: f, label: FREQ_LABELS[f] || f }))} /></div>
              <div><span className={sub}>Verwachte datum</span><input type="date" className={input} value={form.expected_date || ""} onChange={(e) => set("expected_date", e.target.value)} /></div>
              <div><span className={sub}>Categorie</span><input className={input} value={form.category || ""} onChange={(e) => set("category", e.target.value)} /></div>
              <div><span className={sub}>Ontvangen €</span><input type="number" step="0.01" className={input} value={form.received_amount ?? ""} onChange={(e) => set("received_amount", e.target.value)} /></div>
              <div><span className={sub}>Status</span><StageSelect value={form.status || "expected"} onChange={(v) => set("status", v)} options={STATUSES.map((s) => ({ value: s.v, label: s.l }))} /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={busy || !form.amount} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ivory text-charcoal px-3 py-2 text-[12px] font-bold disabled:opacity-50 transition">
                <Save className="w-3.5 h-3.5" />{busy ? "Bezig…" : "Opslaan"}
              </button>
              <button onClick={() => { setEditing(null); setForm(blank); }} className="rounded-full bg-white/10 px-3 py-2 text-[12px] font-bold transition">Annuleer</button>
              {!isNew && <button onClick={() => del(editing)} disabled={busy} className="rounded-full bg-white/10 px-3 py-2 text-[12px] font-bold transition" aria-label="Verwijderen"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        )}

        {/* eenmalig */}
        <div>
          <p className={label}>Eenmalig · {oneTime.length}</p>
          <div className="space-y-1.5">
            {oneTime.length === 0 && <p className="text-[11px] text-ivory/50 italic">Nog geen eenmalige inkomsten.</p>}
            {oneTime.map((i) => (
              <button key={i.id} onClick={() => edit(i)} className="w-full flex items-center gap-2 rounded-xl bg-white/6 hover:bg-white/10 px-2.5 py-2 text-left transition">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "hsl(var(--life-ridge))" }} />
                <span className="flex-1 truncate text-[12px] font-medium">{i.description || i.category || "Inkomen"}</span>
                <span className="text-[10px] uppercase tracking-wide text-ivory/50">1×</span>
                <span className="text-[11px] font-mono tabular-nums text-ivory/70">{fmtEuro(i.amount)}</span>
                <Pencil className="w-3.5 h-3.5 text-ivory/40" />
              </button>
            ))}
          </div>
        </div>

        {/* vast */}
        <div>
          <p className={label}>Vast · {recurring.length}</p>
          <div className="space-y-1.5">
            {recurring.map((i) => (
              <button key={i.id} onClick={() => edit(i)} className="w-full flex items-center gap-2 rounded-xl bg-white/6 hover:bg-white/10 px-2.5 py-2 text-left transition">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "hsl(var(--life-olive))" }} />
                <span className="flex-1 truncate text-[12px] font-medium">{i.description || i.category || "Inkomen"}</span>
                <span className="text-[10px] uppercase tracking-wide text-ivory/50">{FREQ_LABELS[i.frequency] || "Vast"}</span>
                <span className="text-[11px] font-mono tabular-nums text-ivory/70">{fmtEuro(i.amount)}</span>
                <Pencil className="w-3.5 h-3.5 text-ivory/40" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}