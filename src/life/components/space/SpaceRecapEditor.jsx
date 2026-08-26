import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Sparkles } from "lucide-react";

const inputCls = "w-full rounded-xl glass-1 px-3 py-2 text-sm outline-none";
const labelCls = "text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground";

const EMPTY = { eyebrow: "", title: "", subtitle: "", body: "", footerLeft: "", footerRight: "", attentionTitle: "", attentionBadge: "", items: [], restTitle: "", restBody: "" };

/** SpaceRecapEditor — slide-over om de editorial recap per tab handmatig te
 *  bewerken. Opent met de huidige data; Opslaan schrijft weg; GIULIA
 *  regenereert een nieuwe versie in het formulier. */
export default function SpaceRecapEditor({ open, data, onClose, onSave, onRegenerate }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open && data) setForm({ ...EMPTY, ...data, items: Array.isArray(data.items) ? data.items.map((it) => ({ ...it })) : [] });
  }, [open, data]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], [k]: v }; return { ...f, items }; });
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { title: "", sub: "" }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }));

  const regen = async () => {
    const r = await onRegenerate?.();
    if (r && r.title) setForm({ ...EMPTY, ...r, items: Array.isArray(r.items) ? r.items.map((it) => ({ ...it })) : [] });
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute right-0 top-0 bottom-0 w-full max-w-md glass-2 rounded-l-[28px] p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 left-4 inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 hover:bg-foreground/10 transition"><X className="w-4 h-4" /></button>

        <div className="mt-2 mb-6">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-life-olive">Editorial recap — handmatig</p>
          <h2 className="text-xl font-display font-semibold mt-1">Bewerk de recap</h2>
        </div>

        <div className="space-y-4">
          <div>
            <p className={labelCls + " mb-1"}>Eyebrow</p>
            <input className={inputCls} value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} placeholder="PERSONAL ADMIN / CURRENT STATE" />
          </div>
          <div>
            <p className={labelCls + " mb-1"}>Titel (FULL CAPS)</p>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="HERE'S WHERE THINGS STAND." />
          </div>
          <div>
            <p className={labelCls + " mb-1"}>Ondertitel</p>
            <input className={inputCls} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="A CLEAR VIEW OF WHAT'S IN MOTION." />
          </div>
          <div>
            <p className={labelCls + " mb-1"}>Body</p>
            <textarea className={inputCls + " min-h-[70px] resize-y"} value={form.body} onChange={(e) => set("body", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelCls + " mb-1"}>Footer links</p>
              <input className={inputCls} value={form.footerLeft} onChange={(e) => set("footerLeft", e.target.value)} placeholder="HERE'S HOW WE READ A FRAME" />
            </div>
            <div>
              <p className={labelCls + " mb-1"}>Footer rechts</p>
              <input className={inputCls} value={form.footerRight} onChange={(e) => set("footerRight", e.target.value)} placeholder="(SCROLL)" />
            </div>
          </div>

          <div className="pt-2 border-t border-foreground/10">
            <div className="flex items-center justify-between mb-2">
              <p className={labelCls}>Aandacht-items</p>
              <button onClick={addItem} className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-semibold"><Plus className="w-3 h-3" />Item</button>
            </div>
            <div className="space-y-2">
              {form.items.length === 0 && <p className="text-xs text-muted-foreground italic">Geen items — laat het aandachtsblok leeg.</p>}
              {form.items.map((it, i) => (
                <div key={i} className="rounded-xl glass-1 p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-life-olive tabular-nums w-5">{String(i + 1).padStart(2, "0")}</span>
                    <input className={inputCls + " flex-1"} value={it.title} onChange={(e) => setItem(i, "title", e.target.value)} placeholder="Payment • Due tomorrow" />
                    <button onClick={() => removeItem(i)} className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea className={inputCls + " min-h-[44px] resize-y"} value={it.sub} onChange={(e) => setItem(i, "sub", e.target.value)} placeholder="Korte uitleg…" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={labelCls + " mb-1"}>Aandacht-titel</p>
              <input className={inputCls} value={form.attentionTitle} onChange={(e) => set("attentionTitle", e.target.value)} placeholder="WHAT NEEDS YOUR ATTENTION" />
            </div>
            <div>
              <p className={labelCls + " mb-1"}>Aandacht-badge</p>
              <input className={inputCls} value={form.attentionBadge} onChange={(e) => set("attentionBadge", e.target.value)} placeholder="03 ITEMS NEED ACTION" />
            </div>
          </div>
          <div>
            <p className={labelCls + " mb-1"}>Afsluitende titel</p>
            <input className={inputCls} value={form.restTitle} onChange={(e) => set("restTitle", e.target.value)} placeholder="THE REST CAN WAIT." />
          </div>
          <div>
            <p className={labelCls + " mb-1"}>Afsluitende tekst</p>
            <textarea className={inputCls + " min-h-[50px] resize-y"} value={form.restBody} onChange={(e) => set("restBody", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 mt-6 sticky bottom-0 pb-1">
          <button onClick={regen} className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 text-foreground px-4 py-2 text-xs font-semibold"><Sparkles className="w-3.5 h-3.5" />GIULIA</button>
          <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 rounded-full bg-plum text-ivory px-5 py-2 text-xs font-semibold ml-auto">Opslaan</button>
        </div>
      </motion.div>
    </div>
  );
}