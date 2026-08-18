import React, { useState } from "react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { AnimatedRing } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const CATS = ["Onderzoek", "Concept", "Identiteit", "Afspraken"];
const TEAM = ["Giulia", "F. de Boer", "T. Bakker", "S. Kaya", "R. de Wit"];

export default function ProjectAddPanel() {
  const [name, setName] = useState("");
  const [cat, setCat] = useState(null);
  const [members, setMembers] = useState([]);
  const [deadline, setDeadline] = useState("");
  const filled = [name, cat, members.length > 0, deadline].filter(Boolean).length;
  const pct = Math.round((filled / 4) * 100);
  const toggleMember = (m) => setMembers(ms => ms.includes(m) ? ms.filter(x => x !== m) : [...ms, m]);

  return (
    <ModuleShell index="08" section="NEW PROJECT" statement="AANMAKEN" kicker="SETUP"
      context={[
        { label: "VOORTGANG", text: `${pct}% van de velden ingevuld.` },
        { label: "TEAM", text: `${members.length} lid${members.length === 1 ? "" : "leden"} geselecteerd.` },
        { label: "STATUS", text: pct === 100 ? "Klaar om aan te maken." : "Vul alle velden in." },
      ]}
      actions={[{ label: "Create", primary: true }, { label: "Save Draft" }, { label: "Cancel" }, { label: "Open Projecten" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div>
            <label className="text-storm/50 text-[10px] tracking-[0.25em]">PROJECTNAAM</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="bv. Concept Brons lancering" className="w-full mt-2 rounded-xl border border-marble/30 bg-marble/5 px-4 py-3 text-sm text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand" />
          </div>
          <div>
            <label className="text-storm/50 text-[10px] tracking-[0.25em]">CATEGORIE</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-xs border transition-colors ${cat === c ? "bg-sand text-storm border-sand" : "border-marble/30 bg-marble/5 text-storm/70 hover:bg-marble/10"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-storm/50 text-[10px] tracking-[0.25em]">TEAM</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TEAM.map(m => (
                <button key={m} onClick={() => toggleMember(m)} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${members.includes(m) ? "bg-olive text-plum border-olive" : "border-marble/30 bg-marble/5 text-storm/70 hover:bg-marble/10"}`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-storm/50 text-[10px] tracking-[0.25em]">DEADLINE</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full mt-2 rounded-xl border border-marble/30 bg-marble/5 px-4 py-3 text-sm text-storm focus:outline-none focus:border-sand [color-scheme:dark]" />
          </div>
        </div>
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={pct} size={180} color={pct === 100 ? URG : SAND} label={`${pct}%`} sub="COMPLETE" /></div>
          <div className="rounded-2xl border border-marble/25 bg-marble/8 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PREVIEW</p>
            <p className="text-storm text-lg font-semibold">{name || "Naamloos project"}</p>
            <p className="text-storm/50 text-xs mt-1">{cat || "Geen categorie"} · {deadline || "Geen deadline"}</p>
            <div className="flex -space-x-2 mt-4 items-center">
              {members.map(m => <span key={m} className="w-8 h-8 rounded-full bg-plum/50 border-2 border-metal text-storm text-[10px] font-semibold flex items-center justify-center">{m[0]}</span>)}
              {members.length === 0 && <span className="text-storm/40 text-xs">Geen teamleden</span>}
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}