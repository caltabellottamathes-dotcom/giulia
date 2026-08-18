import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { ContextGrid, ActionRow, OpenLink, LiveBarChart } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

const SORTS = [{ key: "alfabet", label: "Alfabet" }, { key: "categorie", label: "Categorie" }, { key: "recent", label: "Recent" }];
const initials = (n) => (n || "").split(" ").map((w) => w[0]).slice(0, 2).join("");
const CAT_TONE = { Klant: FOCUS.deep, Team: FOCUS.mid, Leverancier: FOCUS.light, Overig: "rgba(255,255,255,0.4)" };
const catOf = (c) => c.relationship_type || "Overig";

export default function PeoplePreview({ onOpen }) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("alfabet");
  const [query, setQuery] = useState("");

  useEffect(() => { (async () => { try { const data = await base44.entities.Contact.filter({}, "name", 60); setContacts(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const filtered = useMemo(() => contacts.filter((c) => (c.name || "").toLowerCase().includes(query.toLowerCase()) || (c.company || "").toLowerCase().includes(query.toLowerCase())), [contacts, query]);

  const groups = useMemo(() => {
    if (sort === "alfabet") { const m = {}; filtered.forEach((c) => { const k = (c.name || "?")[0].toUpperCase(); (m[k] = m[k] || []).push(c); }); return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])); }
    if (sort === "categorie") { const m = {}; filtered.forEach((c) => { const k = catOf(c); (m[k] = m[k] || []).push(c); }); return Object.entries(m); }
    return [["Recent", [...filtered].sort((a, b) => (b.last_contact_date || "").localeCompare(a.last_contact_date || ""))]];
  }, [filtered, sort]);

  // Category distribution chart
  const catData = useMemo(() => { const m = {}; contacts.forEach((c) => { const k = catOf(c); m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([n, v]) => ({ label: n.slice(0, 4).toUpperCase(), value: v, c: CAT_TONE[n] || "rgba(255,255,255,0.4)" })); }, [contacts]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>People</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{contacts.length} contacten</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{catData.length} categorieën</p>
        </div>
        <OpenLink to="/people" label="Open Contacten" color={FOCUS.light} />
      </div>

      {/* Category chart */}
      {catData.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-5">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Verdeling per categorie</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={catData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {catData.map((d, i) => <Cell key={i} fill={d.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl glass-card-2 border border-white/15 px-3 py-2 w-fit">
          <Search className="w-4 h-4 text-ivory/55" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op naam of bedrijf…" className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none w-44 sm:w-56" />
        </div>
        <div className="flex gap-1.5">
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${sort === s.key ? "text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`} style={sort === s.key ? { background: FOCUS.light } : {}}>{s.label}</button>
          ))}
        </div>
      </div>

      <SectionLabel>Contacten</SectionLabel>
      {loading ? <Empty text="Laden…" /> : filtered.length === 0 ? <Empty text="Geen contacten gevonden." /> : (
        <div className="flex flex-col gap-5 max-h-[420px] overflow-y-auto pr-1 -mr-1">
          {groups.map(([label, items]) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-ivory/45 text-xs font-semibold uppercase tracking-wide">{label}</span>
                <div className="flex-1 h-px bg-ivory/12" />
                <span className="text-ivory/35 text-[10px] tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {items.map((c, i) => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} onClick={onOpen} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    {c.avatar ? <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" /> : <div className="w-9 h-9 rounded-full glass-button text-ivory flex items-center justify-center text-xs font-medium shrink-0" style={{ background: `${FOCUS.light}20` }}>{initials(c.name)}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-ivory text-sm font-medium truncate">{c.name}</p>
                      <p className="text-ivory/50 text-xs truncate">{[c.role, c.company].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="text-[10px] hidden sm:block" style={{ color: CAT_TONE[catOf(c)] || "rgba(255,255,255,0.4)" }}>{catOf(c)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ContextGrid items={[
        { label: "TOTAAL", text: `${contacts.length} contacten in je netwerk.` },
        { label: "CATEGORIEËN", text: `${catData.length} verschillende relatie-types.` },
        { label: "LAATSTE", text: contacts[0] ? `${contacts[0].name} — meest recent contact.` : "Nog geen contacten." },
      ]} />
      <ActionRow actions={[
        { label: "Open Contacten", primary: true, color: FOCUS.light, to: "/people" },
      ]} />
    </div>
  );
}