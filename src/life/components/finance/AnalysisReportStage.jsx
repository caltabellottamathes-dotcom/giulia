import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ACCENT = "hsl(var(--life-olive))";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];
const pad2 = (n) => String(n).padStart(2, "0");

const md = {
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-white/80">{children}</em>,
  p: ({ children }) => <p className="text-[13px] leading-[1.65] text-ivory/90 mb-2.5 last:mb-0">{children}</p>,
  h1: ({ children }) => <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold text-ivory/65 mt-4 mb-1.5">{children}</h4>,
  h2: ({ children }) => <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold text-ivory/65 mt-4 mb-1.5">{children}</h4>,
  h3: ({ children }) => <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold text-ivory/65 mt-4 mb-1.5">{children}</h4>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-[13px] text-ivory/85 mb-2">{children}</ul>,
  li: ({ children }) => <li className="leading-[1.5]">{children}</li>
};

/** AnalysisReportStage — Giulia's gestructureerd analyse-rapport per tab, in
 *  gewone taal met een grappige toon, opgemaakt met bold/italics & wallet-kleuren.
 *  Opent automatisch bij binnenkomst; toont cache direct en ververst op de
 *  achtergrond wanneer de analyse ouder is dan 6 uur. */
export default function AnalysisReportStage({ tab, onClose }) {
  const [ed, setEd] = useState(null);
  const [pots, setPots] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEd(null);
    (async () => {
      const list = await base44.entities.AdminEditorial.list("-generated_at", 50).catch(() => []);
      if (cancelled) return;
      const found = (list || []).find((e) => e.tab === tab) || null;
      setEd(found);
      if (!found) {
        setBusy(true);
        await base44.functions.invoke("generateAdminEditorial", {}).catch(() => {});
        if (cancelled) return;
        const list2 = await base44.entities.AdminEditorial.list("-generated_at", 50).catch(() => []);
        if (cancelled) return;
        setEd((list2 || []).find((e) => e.tab === tab) || null);
        setBusy(false);
      } else {
        const stale = !found.generated_at || Date.now() - new Date(found.generated_at).getTime() > 6 * 3600 * 1000;
        if (stale) {
          setBusy(true);
          base44.functions.invoke("generateAdminEditorial", {}).catch(() => {}).then(async () => {
            const list2 = await base44.entities.AdminEditorial.list("-generated_at", 50).catch(() => []);
            if (cancelled) return;
            setEd((list2 || []).find((e) => e.tab === tab) || found);
            setBusy(false);
          });
        }
      }
    })();
    return () => {cancelled = true;};
  }, [tab]);

  useEffect(() => {
    base44.entities.Portfolio.list().then((p) => setPots((p || []).filter((x) => !x.archived))).catch(() => {});
  }, []);

  const colorOf = (id) => pots.find((p) => p.id === id)?.color || null;
  const itemColor = (it) => colorOf(it.to_id) || colorOf(it.from_id) || NUM_COLORS[0];
  const items = Array.isArray(ed?.items) ? ed.items : [];

  const renew = async () => {
    setBusy(true);
    await base44.functions.invoke("generateAdminEditorial", {}).catch(() => {});
    const list = await base44.entities.AdminEditorial.list("-generated_at", 50).catch(() => []);
    setEd((list || []).find((e) => e.tab === tab) || ed);
    setBusy(false);
    window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
  };

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <button onClick={renew} title="Giulia opnieuw laten analyseren" className="p-1 rounded-full hover:bg-white/10 transition text-ivory/70">
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-5 opacity-100">
        {busy && !ed ?
        <div className="h-full flex flex-col items-center justify-center gap-3 py-24">
            <div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/60">Giulia analyseert…</p>
          </div> :
        ed ?
        <div className="space-y-3">
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: ACCENT }}>{ed.eyebrow || "Analyse"}</p>
            <h2 className="font-display font-bold uppercase tracking-[-0.03em] leading-[0.95] text-[24px]">{ed.title1}<br />{ed.title2}</h2>
            <div className="h-px w-10" style={{ background: ACCENT }} />

            {ed.body && <div className="pt-1"><ReactMarkdown components={md}>{ed.body}</ReactMarkdown></div>}

            {ed.proposal &&
          <div className="pt-3 mt-1 border-t border-white/12">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: ACCENT }}>Giulia adviseert</p>
                <ReactMarkdown components={md}>{ed.proposal}</ReactMarkdown>
              </div>
          }

            {items.length > 0 &&
          <div className="pt-3 mt-1 border-t border-white/12 space-y-3">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: ACCENT }}>{ed.items_label || "Actiepunten"}</p>
                {items.map((it, idx) => {
              const ic = itemColor(it);
              return (
                <div key={it.n || idx} className="flex gap-3 items-start">
                      <span className="font-display font-bold leading-none shrink-0" style={{ color: ic, fontSize: "22px" }}>{it.n || pad2(idx + 1)}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: ic }}>{it.title}</p>
                        {it.desc && <p className="text-[12px] text-ivory/70 leading-[1.5] mt-1">{it.desc}</p>}
                      </div>
                    </div>);

            })}
              </div>
          }

            <div className="pt-4 mt-2 border-t border-white/12">
              <p className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: "#abab69" }}>Le reste peut attendre</p>
            </div>
          </div> :

        <p className="text-[12px] text-ivory/50 italic py-10 text-center">Nog geen analyse.</p>
        }
      </div>
    </div>);

}