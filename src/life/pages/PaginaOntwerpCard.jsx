import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];
const BLUE = "#b1bfc7";
const GREY = "#CCCCCC";
const BLACK = "#000000";
const INK = "#595c64";
const CARD = "#f5f5f4";
const SHADOW = "0_16px_34px_-18px_rgba(0,0,0,0.20)";
const NUM_COLORS = ["#d0d9dd", "#595c64", "#d8dab3"];

const BounceBalls = ({ color = "#000", colors, count, size = "clamp(7px, 0.55vw, 10px)", ml = "7px" }) => {
  const n = count || (colors ? colors.length : 1);
  return (
    <span className="inline-flex items-end gap-[3px] align-baseline" style={{ marginLeft: ml }} aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="ontwerp-dot-bounce inline-block rounded-full bg-current" style={{ color: colors ? colors[i] : color, width: size, height: size, animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
};

const TAB_CONTENT = {
  OVERVIEW: {
    eyebrow: "Personal Admin | current_state_",
    title1: "Here's where",
    title2: "things stand",
    subtitle: "A clear view of what's in motion.",
    body: "PersonalAdmin currently holds 24 active matters, with most routine administration under control. Several financial commitments are already scheduled for the weeks ahead, while a smaller set of open items still asks for your attention in the coming days. Nothing is urgent — yet a few threads are worth following up before they quietly grow.",
    section2: "On what matters | now_",
    heading1: "What needs",
    heading2: "your attention...",
    itemsLabel: "03_actions_need_action_",
    items: [
      { n: "01", title: "Payment • Due tomorrow", desc: "A recurring payment is approaching its deadline and has not yet been confirmed." },
      { n: "02", title: "Document • Waiting", desc: "An important document is still missing and is blocking completion of an administrative matter." },
      { n: "03", title: "Appointment • This week", desc: "An upcoming appointment requires preparation before the scheduled date." },
    ],
    restLabel: "The rest can wait.",
    rest: "Most other items are currently on track, with no immediate action required.",
  },
  PORTEFEUILLES: {
    eyebrow: "Personal Admin | Portefeuilles",
    title1: "Six pots,",
    title2: "each with a job.",
    subtitle: "Every euro already has a destination.",
    body: "Your portefeuilles hold the reservations for fixed costs, the buffer for the unexpected, and the savings for what's next. Most pots are on track; a couple are running behind their recommended monthly reservation.",
    section2: "Pots to watch",
    heading1: "Which pots",
    heading2: "need catching up...",
    itemsLabel: "02 pots behind",
    items: [
      { n: "01", title: "Wonen • Under-reserved", desc: "The monthly reservation is below the recommended amount for the coming quarter." },
      { n: "02", title: "Onvoorzien • Buffer low", desc: "The unexpected buffer is thinner than desired after a recent expense." },
    ],
    restLabel: "The rest can wait.",
    rest: "The other four pots are healthy and need no action right now.",
  },
  LASTEN: {
    eyebrow: "Personal Admin | Lasten",
    title1: "What's due,",
    title2: "and when.",
    subtitle: "A clear schedule of outgoing commitments.",
    body: "Several financial commitments are already scheduled for the weeks ahead. Most are routine and will be paid automatically; a smaller set still asks for a manual confirmation before their deadline.",
    section2: "On what matters | now_",
    heading1: "Payments",
    heading2: "coming up...",
    itemsLabel: "03 payments due",
    items: [
      { n: "01", title: "Payment • Due tomorrow", desc: "A recurring payment is approaching its deadline and has not yet been confirmed." },
      { n: "02", title: "Invoice • Due this week", desc: "An open invoice needs to be paid before the end of the week." },
      { n: "03", title: "Subscription • Renews soon", desc: "A subscription renews shortly and can still be cancelled if no longer needed." },
    ],
    restLabel: "The rest can wait.",
    rest: "All other recurring payments are scheduled and require no action.",
  },
  INKOMEN: {
    eyebrow: "Personal Admin | Inkomen",
    title1: "What comes",
    title2: "in, and when.",
    subtitle: "A steady view of incoming streams.",
    body: "Your income streams are mostly recurring and arrive on a predictable rhythm. One source is still marked as expected and has not yet been received this month.",
    section2: "On what matters | now_",
    heading1: "Income",
    heading2: "to confirm...",
    itemsLabel: "01 stream pending",
    items: [
      { n: "01", title: "Income • Expected", desc: "A recurring income payment is expected this week and has not yet been received." },
    ],
    restLabel: "The rest can wait.",
    rest: "All other income streams have arrived on time this month.",
  },
  FORECAST: {
    eyebrow: "Personal Admin | Forecast",
    title1: "Where",
    title2: "you're heading.",
    subtitle: "A forward look at balances and pressure points.",
    body: "The forecast shows steady balance development across most portefeuilles for the coming weeks. One pot is projected to dip below its buffer before the next top-up.",
    section2: "On what matters | now_",
    heading1: "Pressure",
    heading2: "points ahead...",
    itemsLabel: "01 forecast flag",
    items: [
      { n: "01", title: "Forecast • Buffer dip", desc: "A pot is projected to dip below its desired buffer within the next month." },
    ],
    restLabel: "The rest can wait.",
    rest: "All other projections remain within their healthy range.",
  },
  HEALTHY_MONEY: {
    eyebrow: "Personal Admin | Healthy Money",
    title1: "Having money",
    title2: "is not spending it.",
    subtitle: "A quiet check between what you have and what you can spend.",
    body: "Most of your balance is already reserved for a destination. Before an impulse buy, it's worth checking whether the amount is free to spend or already spoken for.",
    section2: "On what matters | now_",
    heading1: "Before",
    heading2: "you spend...",
    itemsLabel: "01 impulse check",
    items: [
      { n: "01", title: "Impulse • Can I afford this", desc: "A quick check of whether an unplanned purchase fits within your free room." },
    ],
    restLabel: "The rest can wait.",
    rest: "Your reserved money is protected and not available for impulse spending.",
  },
  DOCUMENTEN: {
    eyebrow: "Personal Admin | Documenten",
    title1: "What's filed,",
    title2: "what's missing.",
    subtitle: "A calm overview of your financial documents.",
    body: "Most financial documents are filed and connected to their matters. One document is still missing and is blocking the completion of an administrative item.",
    section2: "On what matters | now_",
    heading1: "Documents",
    heading2: "to chase...",
    itemsLabel: "01 document missing",
    items: [
      { n: "01", title: "Document • Missing", desc: "An important document is still missing and is blocking an administrative matter." },
    ],
    restLabel: "The rest can wait.",
    rest: "All other documents are filed and require no action.",
  },
};

export default function OntwerpWhiteCard({ tab }) {
  const c = TAB_CONTENT[tab] || TAB_CONTENT.OVERVIEW;
  const navigate = useNavigate();
  const h2Clean = c.heading2.replace(/\.+$/, "");
  const [eyeA, ...eyeRest] = c.eyebrow.split("|");
  const eyeB = eyeRest.length ? " | " + eyeRest.join("|").trim() : "";
  const [s2a, ...s2rest] = c.section2.split("|");
  const s2b = s2rest.length ? " | " + s2rest.join("|").trim() : "";
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-0 rounded-t-[20px] rounded-l-[20px] rounded-r-none bg-white flex overflow-hidden shadow-[-40px_8px_64px_-18px_rgba(0,0,0,0.55)]"
    >
      {/* Editorial — left ~42% */}
      <div className="w-[42%] h-full flex flex-col overflow-hidden border-r" style={{ borderColor: GREY }}>
        <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{eyeA.trim()}</span>{eyeB}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°1</span>
          </div>

          <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.92] mt-6" style={{ color: BLACK, fontSize: "clamp(34px, 3vw, 54px)", textShadow: "0 0 18px rgba(177,191,199,0.7), 0 0 38px rgba(177,191,199,0.4)" }}>
            {c.title1}<br />{c.title2}<span aria-hidden className="ontwerp-dot-bounce inline-block rounded-full bg-current ml-[6px] align-baseline" style={{ color: BLUE, width: "clamp(8px, 0.7vw, 13px)", height: "clamp(8px, 0.7vw, 13px)" }} />
          </h2>

          <div className="ml-[80px] mt-8 space-y-2">
            <p className="font-display font-medium tracking-[-0.05em] text-[12px]" style={{ color: BLACK }}>{c.subtitle}</p>
            <p className="font-body text-[12px] leading-[1.5]" style={{ color: INK }}>{c.body}</p>
          </div>

          {/* Witruimte — duwt de kop + lijn + items naar beneden */}
          <div className="flex-1 min-h-8" />

          {/* What needs your attention — boven de lijn, links uitgelijnd, zwart, 2 regels, BounceBalls i.p.v. ... */}
          <h3 className="font-display font-bold tracking-[-0.025em] leading-[0.98] mb-5" style={{ color: BLACK, fontSize: "clamp(24px, 1.9vw, 38px)" }}>
            {c.heading1}<br />{h2Clean}<BounceBalls colors={NUM_COLORS} />
          </h3>

          <div className="h-px w-full" style={{ background: "#d8dab3" }} />
          <div className="flex items-center justify-between mt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}><span className="font-bold">{s2a.trim()}</span>{s2b}</p>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>N°2</span>
          </div>

          {/* Items — knoppen die meteen navigeren naar de actieplek, op 80px (lijn met body) */}
          <div className="mt-4 ml-[80px] space-y-3">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: BLUE }}>{c.itemsLabel}</p>
            {c.items.map((it, idx) => (
              <button key={it.n} onClick={() => navigate(`/life/personal-admin?tab=${tab}`)} className="flex gap-3 items-end text-left w-full hover:opacity-70 transition">
                <span className="inline-flex items-end gap-[5px] shrink-0">
                  <BounceBalls color={NUM_COLORS[idx % 3]} count={idx + 1} ml="0" />
                  <span className="font-display font-bold leading-none" style={{ color: NUM_COLORS[idx % 3], fontSize: "30px" }}>{it.n}</span>
                </span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-[13px] leading-tight" style={{ color: BLACK }}>{it.title}</p>
                  <p className="font-body text-[12px] leading-[1.4] mt-1" style={{ color: "#333" }}>{it.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t" style={{ borderColor: GREY }}>
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase" style={{ color: "#abab69" }}>{c.restLabel}</p>
            <p className="font-body text-[12.5px] leading-[1.4] mt-3" style={{ color: "#333" }}>{c.rest}</p>
          </div>
        </div>
      </div>

      {/* Rechts — bento met 4 zwevende kaarten (zelfde voor elke tab) */}
      <div className="flex-1 min-w-0 p-6 flex flex-col gap-4">
        <div className="flex-[1.4] rounded-[18px]" style={{ background: CARD, boxShadow: SHADOW }} />
        <div className="flex-[0.5] rounded-[18px]" style={{ background: CARD, boxShadow: SHADOW }} />
        <div className="flex-1 flex gap-4">
          <div className="flex-[0.9] rounded-[18px]" style={{ background: CARD, boxShadow: SHADOW }} />
          <div className="flex-[1.5] rounded-[18px]" style={{ background: CARD, boxShadow: SHADOW }} />
        </div>
      </div>
    </motion.div>
  );
}