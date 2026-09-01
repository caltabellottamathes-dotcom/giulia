import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CircleDot, Wallet, ListChecks, Banknote, Lightbulb, HeartPulse, FileText, MessageSquare, Phone, Film } from "lucide-react";
import AdminCard from "./AdminCard";
import ChatStage from "@/giulia/panels/ChatStage";
import VoiceStage from "@/giulia/panels/VoiceStage";
import DocStage from "@/system/panels/DocStage";
import MediaStage from "@/system/panels/MediaStage";
import WalletStage from "@/life/components/finance/WalletStage";
import ExpenseStage from "@/life/components/finance/ExpenseStage";
import IncomeStage from "@/life/components/finance/IncomeStage";
import ReservationStage from "@/life/components/finance/ReservationStage";
import LastenManageList from "@/life/components/finance/LastenManageList";
import AnalysisReportStage from "@/life/components/finance/AnalysisReportStage";
import MattiaSlideOver from "@/giulia/panels/MattiaSlideOver";

const EASE = [0.16, 1, 0.3, 1];
const HERO_VIDEO = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/cbb9adc9f_Mattia_into.mp4";

const TABS = [
{ key: "OVERVIEW", label: "Overview", icon: CircleDot },
{ key: "PORTEFEUILLES", label: "Wallets", icon: Wallet },
{ key: "LASTEN", label: "Lasten", icon: ListChecks },
{ key: "INKOMEN", label: "Inkomen", icon: Banknote },
{ key: "FORECAST", label: "Inzichten", icon: Lightbulb },
{ key: "HEALTHY_MONEY", label: "Healthy Money", icon: HeartPulse },
{ key: "DOCUMENTEN", label: "Documenten", icon: FileText }];


// Multi-functionele stages — het glaspaneel schuift links onder de kaart vandaan.
const STAGE_TABS = [
{ key: "chat", label: "Chat", icon: MessageSquare },
{ key: "voice", label: "Voice", icon: Phone },
{ key: "doc", label: "Document", icon: FileText },
{ key: "media", label: "Media", icon: Film }];


// Relevante pagina's buiten Admin die verbonden zijn of meest nodig op deze pagina.
const RELATED = [
{ label: "Documents", to: "/documents" },
{ label: "Agenda", to: "/agenda" },
{ label: "People", to: "/people" },
{ label: "Approvals", to: "/approvals" }];


export default function AdminPage() {
  const [tab, setTab] = useState("OVERVIEW");
  const [stage, setStage] = useState("chat"); // "chat" | "voice" | "doc" | "media"
  const [panelOpen, setPanelOpen] = useState(false);
  const [walletId, setWalletId] = useState(null);
  const [expenseId, setExpenseId] = useState(null);
  const [incomeId, setIncomeId] = useState(null);
  const [mattiaOpen, setMattiaOpen] = useState(false);
  const isStage = panelOpen;
  const [first, setFirst] = useState(true);
  useEffect(() => {const t = setTimeout(() => setFirst(false), 900);return () => clearTimeout(t);}, []);

  // Pauzeer de hero-video zodra de MediaStage opent (stage === "media").
  const heroVideoRef = useRef(null);
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    if (stage === "media") { try { v.pause(); } catch { /* ignore */ } }
    else { v.play().catch(() => {}); }
  }, [stage]);

  // Toolbar (chat/phone) routeert naar dit paneel wanneer op Admin.
  useEffect(() => {
    const h = (e) => {setStage(e.detail);setPanelOpen(true);};
    window.addEventListener("giulia:ontwerp-stage", h);
    return () => window.removeEventListener("giulia:ontwerp-stage", h);
  }, []);

  // Wallet-widget klik → wallet-stage met alle info + editor.
  useEffect(() => {
    const h = (e) => {setWalletId(e.detail);setStage("wallet");setPanelOpen(true);};
    window.addEventListener("giulia:open-wallet", h);
    return () => window.removeEventListener("giulia:open-wallet", h);
  }, []);

  // Last-item klik → expense-stage met alle info + editor/create.
  useEffect(() => {
    const h = (e) => {setExpenseId(e.detail);setStage("expense");setPanelOpen(true);};
    window.addEventListener("giulia:open-expense", h);
    return () => window.removeEventListener("giulia:open-expense", h);
  }, []);

  // Inkomsten-beheer klik → income-stage (alles beheren in het uitgeschoven paneel).
  useEffect(() => {
    const h = (e) => {setIncomeId(e.detail);setStage("income");setPanelOpen(true);};
    window.addEventListener("giulia:open-income-stage", h);
    return () => window.removeEventListener("giulia:open-income-stage", h);
  }, []);

  // Reserveringen-beheer klik → reservation-stage (Doel 1/2 + reserveringen).
  useEffect(() => {
    const h = () => {setStage("reservation");setPanelOpen(true);};
    window.addEventListener("giulia:open-reservation", h);
    return () => window.removeEventListener("giulia:open-reservation", h);
  }, []);

  // Alle lasten beheren → lasten-stage (slide-over).
  useEffect(() => {
    const h = () => {setStage("lasten");setPanelOpen(true);};
    window.addEventListener("giulia:open-lasten", h);
    return () => window.removeEventListener("giulia:open-lasten", h);
  }, []);

  // Bij openen van de pagina: de analyse uitvoeren + het rapport tonen (analyse-stage).
  useEffect(() => {
    const t = setTimeout(() => {setStage("analyse");setPanelOpen(true);}, 1150);
    return () => clearTimeout(t);
  }, []);

  const stageContent =
  stage === "chat" ? <ChatStage /> :
  stage === "voice" ? <VoiceStage /> :
  stage === "doc" ? <DocStage /> :
  stage === "wallet" ? <WalletStage walletId={walletId} onClose={() => setPanelOpen(false)} /> :
  stage === "expense" ? <ExpenseStage expenseId={expenseId} onClose={() => setPanelOpen(false)} /> :
  stage === "income" ? <IncomeStage incomeId={incomeId} onClose={() => setPanelOpen(false)} /> :
  stage === "reservation" ? <ReservationStage onClose={() => setPanelOpen(false)} /> :
  stage === "lasten" ? <LastenManageList onClose={() => setPanelOpen(false)} /> :
  stage === "analyse" ? <AnalysisReportStage tab={tab} onClose={() => setPanelOpen(false)} /> :
  <MediaStage />;

  const tabTitle = TABS.find((t) => t.key === tab)?.label || "Admin";

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]">
      {/* Hero photo — blijft open wanneer het glaspaneel opent */}
      <motion.div initial={{ x: "-118%" }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: EASE }}
      className="hidden lg:block absolute left-0 top-[14%] bottom-0 w-[34%] overflow-hidden rounded-r-[24px] z-[5]">
        <video ref={heroVideoRef} src={HERO_VIDEO} autoPlay loop muted playsInline className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10" />
      </motion.div>

      {/* Titel (per tab) + relevante links — alleen in admin-modus */}
      {!isStage &&
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
      className="hidden lg:flex absolute left-[2.5%] top-[3%] z-[2] flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-life-olive font-semibold">LIFE → ADMIN</p>
          <h1 className="text-[34px] font-display font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{tabTitle}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {RELATED.map((r) =>
          <Link key={r.to} to={r.to}
          className="text-[11px] text-foreground/60 hover:text-foreground underline underline-offset-4 decoration-foreground/20 transition-colors">
                {r.label}
              </Link>
          )}
          </div>
        </motion.div>
      }

      {/* Glazen paneel — schuift naar links wanneer een stage actief is */}
      <motion.div initial={{ x: "118%" }} animate={{ x: isStage ? "-24vw" : 0 }} transition={{ duration: 0.7, ease: EASE, delay: first ? 0.15 : 0 }}
      className="absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px] rounded-r-none shadow-[0_64px_150px_-34px_rgba(0,0,0,0.55), -36px_0_80px_-28px_rgba(0,0,0,0.42)] flex z-[15]"
      style={{ backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)" }}>
        {/* Linker glas-strook — tabs */}
        <div className="hidden lg:flex flex-col items-center gap-1 py-8 w-[88px] mb-[24px] shrink-0 relative z-30">
          <button onClick={() => setPanelOpen((o) => !o)} title={isStage ? "Paneel sluiten" : "Paneel openen"} className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-full glass-1 hover:bg-foreground/8 transition text-foreground/70">
            <ArrowLeft className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isStage ? "rotate-180" : ""}`} />
          </button>
          <div className="flex flex-col gap-1 flex-1">
            {TABS.map((t) =>
            <button key={t.key} onClick={() => {setTab(t.key);setPanelOpen(false);}} title={t.label}
            className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${!isStage && tab === t.key ? "bg-foreground/12 text-foreground" : "text-foreground/55 hover:bg-foreground/8 hover:text-foreground/85"}`}>
                <t.icon className="w-4 h-4" />
                {!isStage && tab === t.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-foreground/70" />}
              </button>
            )}
            <div className="h-px w-6 bg-foreground/15 my-2 mx-auto" />
            {STAGE_TABS.map((s) =>
            <button key={s.key} onClick={() => {setStage(s.key);setPanelOpen(true);}} title={s.label}
            className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition ${isStage && stage === s.key ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <s.icon className="w-4 h-4" />
                {isStage && stage === s.key && <span className="absolute -left-[11px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-white/80" />}
              </button>
            )}
          </div>
          

          
          <div className="text-[8px] uppercase tracking-[0.22em] text-white [writing-mode:vertical-rl] rotate-180">{isStage ? "MATTIA" : "GIULIA · GIULIA"}</div>
        </div>

        {/* Inhoud-wrapper — stage verschijnt links, witte kaart blijft staan */}
        <div className="relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px] min-w-0">
          {/* Stage-kolom — op het glas, links van de witte kaart */}
          <AnimatePresence>
            {isStage &&
            <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}
            className="absolute top-[134px] bottom-[70px] left-0 w-full lg:w-[24vw] z-10 overflow-hidden rounded-l-[20px] rounded-r-none"
            style={{ background: "rgba(20, 28, 33, 0.22)", backdropFilter: "blur(28px) saturate(1.3)", WebkitBackdropFilter: "blur(28px) saturate(1.3)", border: "1px solid rgba(177,190,198,0.18)", boxShadow: "0 18px 48px -20px rgba(0,0,0,0.36)" }}>
                {(stage === "doc" || stage === "media") &&
              <button onClick={() => setPanelOpen(false)} className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors hidden" aria-label="Terug">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
              }
                {stageContent}
              </motion.div>
            }
          </AnimatePresence>

          {/* Witte kaart — schuift tegen om op zijn plek te blijven staan */}
          <motion.div animate={{ x: isStage ? "24vw" : 0 }} transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0 z-20">
            <AnimatePresence initial={false}>
              <AdminCard key={tab} tab={tab} onNavigate={setTab} enterDelay={first ? 0.6 : 0} />
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      <MattiaSlideOver open={mattiaOpen} onClose={() => setMattiaOpen(false)} />
    </div>);

}