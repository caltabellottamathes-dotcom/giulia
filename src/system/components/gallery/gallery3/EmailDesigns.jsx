import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";
import { IMAGES } from "@/lib/images";
import { RefreshCw, Check } from "lucide-react";

/* ANALYSE — Email: aantal ongelezen, aantal belangrijk, inbox-meter, volgende
 * afzender, sync, markeer gelezen. Focus: ongelezen-druk + urgentie + triage.
 * D2 "Inbox-drukmeter" (3:4) — verticale meter vult met ongelezen vs gelezen;
 * urgente mails bovenaan met afzender+onderwerp. Motion: meter vult.
 * D3 "Thread-rivier" (16:6) — horizontale stroom van mails; ongelezen
 * verheven, gelezen plat. Tik = markeer gelezen. Motion: rivier drijft. */

export function EmailDesign2() {
  const { data: emails, reload } = useEntityList("Email", { filter: { folder: { $in: ["inbox", "important"] } }, sort: "-timestamp" });
  const [syncing, setSyncing] = useState(false);
  const list = emails || [];
  const unread = list.filter((e) => e.status === "unread");
  const urgent = unread.filter((e) => e.important);
  const pct = list.length ? Math.min(100, (unread.length / list.length) * 100) : 0;
  const sync = async () => { setSyncing(true); try { await base44.functions.invoke("syncGmail", {}); reload(); } catch {} setSyncing(false); };
  const read = async (e) => { try { await base44.entities.Email.update(e.id, { status: "read" }); reload(); } catch {} };

  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("ridge") }}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Who's Texting? · druk</p>
          <button onClick={sync} className="text-ivory/70 hover:text-ivory"><RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} /></button>
        </div>
        <div className="flex items-baseline gap-2">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-display font-bold leading-none">{unread.length}</motion.span>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-55 mb-1.5">ongelezen</span>
        </div>
        <p className="text-[10px] opacity-55 mt-0.5">{urgent.length} belangrijk · {list.length} totaal</p>
        <p className="text-[9px] uppercase tracking-wider opacity-45 mt-4 mb-1.5">Urgent bovenaan</p>
        <div className="flex-1 space-y-1.5 overflow-hidden min-h-0">
          {(urgent.length ? urgent : unread).slice(0, 4).map((e, i) => (
            <motion.button key={e.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} onClick={() => read(e)} className="w-full text-left glass-1 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: e.important ? "var(--tile-accent)" : "rgba(255,255,255,0.4)" }} />
                <span className="text-[10px] font-semibold truncate flex-1">{e.sender || "?"}</span>
              </div>
              <p className="text-[9px] opacity-60 truncate pl-3">{e.subject}</p>
            </motion.button>
          ))}
          {unread.length === 0 && <p className="text-xs opacity-40 text-center mt-6">Inbox rustig</p>}
        </div>
      </div>
      <div className="w-8 shrink-0 ml-2 flex flex-col justify-end">
        <div className="relative w-2.5 rounded-full bg-ivory/10 overflow-hidden h-full">
          <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ duration: 1 }} className="absolute bottom-0 inset-x-0 rounded-full" style={{ background: "var(--tile-accent)" }} />
        </div>
      </div>
    </div>
  );
}

export function EmailDesign3() {
  const { data: emails, reload } = useEntityList("Email", { filter: { folder: "inbox" }, sort: "-timestamp" });
  const list = (emails || []).slice(0, 9);
  const read = async (e) => { try { await base44.entities.Email.update(e.id, { status: "read" }); reload(); } catch {} };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/6", ...accentVars("ridge") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Who's Texting? · stroom</p>
        <span className="text-[10px] tabular-nums opacity-50">{list.filter((e) => e.status === "unread").length} ongelezen</span>
      </div>
      <div className="relative h-[calc(100%-2rem)] flex items-end gap-1.5 overflow-hidden">
        {list.map((e, i) => {
          const un = e.status === "unread";
          return (
            <motion.button key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => read(e)}
              className="flex-1 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/10" style={{ height: un ? "100%" : "55%", background: un ? (e.important ? "var(--tile-accent)" : "rgba(255,255,255,0.16)") : "rgba(255,255,255,0.06)" }}>
              <span className="block text-[9px] font-semibold truncate">{e.sender || "?"}</span>
              <span className="block text-[8px] opacity-65 truncate">{e.subject}</span>
            </motion.button>
          );
        })}
        {list.length === 0 && <p className="text-xs opacity-40">Postvak leeg</p>}
      </div>
    </div>
  );
}

export default { Design2: EmailDesign2, Design3: EmailDesign3 };