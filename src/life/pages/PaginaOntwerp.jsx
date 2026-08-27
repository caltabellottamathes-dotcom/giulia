import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, CircleDot, Wallet, ListChecks, Banknote, LineChart, HeartPulse, FileText } from "lucide-react";
import { IMAGES } from "@/lib/images";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#003399";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#1a1a1a";
const HERO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "PORTEFEUILLES", label: "Portefeuilles", icon: Wallet },
  { key: "LASTEN", label: "Lasten", icon: ListChecks },
  { key: "INKOMEN", label: "Inkomen", icon: Banknote },
  { key: "FORECAST", label: "Forecast", icon: LineChart },
  { key: "HEALTHY_MONEY", label: "Healthy Money", icon: HeartPulse },
  { key: "DOCUMENTEN", label: "Documenten", icon: FileText },
];

const ITEMS = [
  { n: "01", title: "Payment • Due tomorrow", desc: "A recurring payment is approaching its deadline and has not yet been confirmed." },
  { n: "02", title: "Document • Waiting", desc: "An important document is still missing and is blocking completion of an administrative matter." },
  { n: "03", title: "Appointment • This week", desc: "An upcoming appointment requires preparation before the scheduled date." },
];

/** PaginaOntwerp — kopie van PersonalAdminPage, glazen paneel tot aan de bodem,
 *  witte kaart met links 1/3 editorial (grafisch ontwerp, zwart-op-wit) en rechts
 *  2/3 leeg. */
export default function PaginaOntwerp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("OVERVIEW");
  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-hidden z-[1]">
      {/* Achtergrond */}
      <div className="absolute inset-0">
        <img src={IMAGES.lifePersonalAdmin} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>

      {/* Hero photo — links */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="hidden lg:block absolute left-0 top-[18%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <img src={HERO} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel — links boven (over de hero) */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[20] flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → ONTWERP</p>
        <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">Pagina-Ontwerp</h1>
      </motion.div>

      {/* Glazen paneel — tot aan de bodem */}
      <motion.div initial={{ x: "118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
        className="absolute right-0 top-0 bottom-0 w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -20px_0_70px_-34px_rgba(0,0,0,0.32)] flex z-[15]">
        {/* Linker glas-strook — tabs */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] shrink-0 relative z-30">
          <button onClick={() => navigate("/")} title="Terug naar dashboard" className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col gap-1.5 flex-1">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} title={t.label}
                className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${tab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {tab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            ))}
          </div>
          <div className="text-[8px] uppercase tracking-[0.22em] text-foreground/40 [writing-mode:vertical-rl] rotate-180">LIFE · ONTWERP</div>
        </div>

        {/* Witte kaart — links 1/3 editorial, rechts 2/3 leeg */}
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
          className="relative flex-1 ml-[2.5%] min-w-0">
          <div className="absolute inset-0 rounded-l-[20px] rounded-r-none bg-white flex overflow-hidden shadow-[-28px_24px_64px_-22px_rgba(0,0,0,0.42)]">
            {/* Editorial — linker 1/3 */}
            <div className="w-1/3 h-full overflow-y-auto no-scrollbar border-r" style={{ borderColor: GREY }}>
              <div className="px-6 lg:px-7 py-8 flex flex-col">
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Personal Admin / Current State</p>

                <h2 className="font-display font-bold tracking-[-0.03em] leading-[0.95] mt-6" style={{ color: BLACK, fontSize: "clamp(26px, 2vw, 38px)" }}>
                  Here's where<br />things stand<span style={{ color: BLUE }}>®</span>
                </h2>

                <p className="font-display font-medium tracking-[-0.01em] mt-4 text-[13px]" style={{ color: BLACK }}>A clear view of what's in motion.</p>

                <p className="font-body text-[13px] leading-[1.65] mt-6" style={{ color: INK }}>
                  PersonalAdmin currently has 24 active matters, with most routine administration under control. Several financial commitments are already planned, while a smaller number of open items still require attention in the coming days.
                </p>

                <div className="flex items-center justify-end gap-1.5 mt-6">
                  <ChevronDown className="w-3 h-3" style={{ color: BLUE }} />
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: BLUE }}>(Scroll)</span>
                </div>

                <div className="h-px w-full mt-8" style={{ background: GREY }} />

                <div className="flex items-center justify-between mt-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>Here's how we read a frame</p>
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: BLUE }}>(Scroll)</span>
                </div>

                <div className="mt-10">
                  <h3 className="font-display font-bold tracking-[-0.02em] leading-[1.0]" style={{ color: BLACK, fontSize: "clamp(20px, 1.6vw, 28px)" }}>What needs your attention</h3>
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase mt-3" style={{ color: BLUE }}>03 items need action</p>

                  <div className="mt-8 space-y-6">
                    {ITEMS.map((it) => (
                      <div key={it.n} className="flex gap-5">
                        <span className="font-display font-bold leading-none shrink-0" style={{ color: BLUE, fontSize: "30px" }}>{it.n}</span>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-[13px] leading-tight" style={{ color: BLACK }}>{it.title}</p>
                          <p className="font-body text-[12px] leading-[1.55] mt-1.5" style={{ color: "#333" }}>{it.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t" style={{ borderColor: GREY }}>
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>The rest can wait.</p>
                  <p className="font-body text-[12.5px] leading-[1.6] mt-3" style={{ color: "#333" }}>Most other items are currently on track, with no immediate action required.</p>
                </div>
              </div>
            </div>

            {/* Rechts 2/3 — leeg */}
            <div className="flex-1 min-w-0" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}