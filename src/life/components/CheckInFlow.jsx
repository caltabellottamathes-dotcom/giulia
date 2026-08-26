import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, ArrowUp, ArrowDown, Minus, ArrowUpDown } from "lucide-react";
import { WINDOWS, buildEntity } from "./checkInConfig";

const DIR_ICON = { Beter: ArrowUp, "Ongeveer hetzelfde": Minus, Moeilijker: ArrowDown, Anders: ArrowUpDown, Hetzelfde: Minus };
const TRAJ_GLYPH = { "Veel hoger": "↑", "Iets hoger": "↗", "Ongeveer hetzelfde": "→", "Iets lager": "↘", "Veel lager": "↓", "Veel meer": "↑", "Iets meer": "↗", "Iets minder": "↘", "Veel minder": "↓" };

function Chip({ label, selected, onClick, accent, dark }) {
  const sel = selected;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2.5 py-1.5 text-[10.5px] font-semibold leading-none transition-all text-left"
      style={{
        background: sel ? accent : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        color: sel ? "#1c1d1a" : dark ? "rgba(255,255,255,0.85)" : "hsl(var(--foreground))",
        border: `1px solid ${sel ? accent : dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)"}`,
        opacity: sel ? 1 : 0.85,
      }}
    >
      {label}
    </button>
  );
}

export default function CheckInFlow({ window: win, onSave, onDone, theme = "dark", accent }) {
  const w = WINDOWS[win] || WINDOWS.orient;
  const ACC = accent || w.accent;
  const dark = theme === "dark";
  const ink = dark ? "rgba(255,255,255,0.92)" : "hsl(var(--foreground))";
  const sub = dark ? "rgba(255,255,255,0.55)" : "hsl(var(--muted-foreground))";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const questions = w.questions;
  const q = questions[step];
  const isLast = step === questions.length - 1;

  const setA = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));
  const toggleMulti = (k, opt, max) =>
    setAnswers((a) => {
      const cur = a[k] || [];
      if (cur.includes(opt)) return { ...a, [k]: cur.filter((x) => x !== opt) };
      if (max && cur.length >= max) return { ...a, [k]: [...cur.slice(cur.length - max + 1), opt] };
      return { ...a, [k]: [...cur, opt] };
    });

  const partFilled = (p) => {
    const v = answers[p.key];
    if (p.optional) return true;
    if (p.type === "multi") return Array.isArray(v) && v.length > 0;
    if (p.type === "text") return typeof v === "string" && v.trim() !== "";
    return v != null && v !== "";
  };

  const stepAnswered = (() => {
    if (q.type === "composite") return q.parts.every(partFilled);
    if (q.optional) return true;
    if (q.type === "battery") return answers.energy != null;
    const v = answers[q.key];
    if (Array.isArray(v)) return v.length > 0;
    return v != null && (typeof v !== "string" || v.trim() !== "");
  })();

  const next = async () => {
    if (!stepAnswered || saving) return;
    if (isLast) {
      setSaving(true);
      try {
        const entity = buildEntity(answers, win);
        await onSave(entity);
        onDone?.();
      } catch {
        setSaving(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const renderSingle = (key, opts) => (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <Chip key={o} label={o} selected={answers[key] === o} onClick={() => setA(key, answers[key] === o ? null : o)} accent={ACC} dark={dark} />
      ))}
    </div>
  );
  const renderMulti = (key, opts, max) => (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => {
        const cur = answers[key] || [];
        const on = cur.includes(o);
        return (
          <Chip key={o} label={o} selected={on} onClick={() => toggleMulti(key, o, max)} accent={ACC} dark={dark} />
        );
      })}
      {max && <span className="text-[9px] self-center" style={{ color: sub }}>max {max}</span>}
    </div>
  );
  const renderText = (key, placeholder, noneOption) => {
    const none = noneOption && answers[key] === noneOption;
    return (
      <div className="space-y-2">
        {noneOption && (
          <label className="flex items-center gap-2 text-[10.5px] cursor-pointer" style={{ color: ink }}>
            <input type="checkbox" checked={none} onChange={(e) => setA(key, e.target.checked ? noneOption : "")} style={{ accentColor: ACC }} />
            {noneOption}
          </label>
        )}
        <textarea
          value={none ? "" : answers[key] || ""}
          disabled={none}
          onChange={(e) => setA(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-2xl px-3 py-2.5 text-[12px] outline-none resize-none disabled:opacity-40"
          style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)"}`, color: ink, minHeight: 72 }}
        />
      </div>
    );
  };
  const renderBattery = (key, opts) => (
    <div className="space-y-1.5">
      {opts.map((o) => {
        const on = answers.energy === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => { setA("energy", o.v); setA("capacity", o.v); }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all"
            style={{ background: on ? ACC : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${on ? ACC : dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}`, opacity: on ? 1 : 0.8 }}
          >
            <span className="shrink-0 w-10 text-[11px] font-bold tabular-nums" style={{ color: on ? "#1c1d1a" : ink }}>{o.v}%</span>
            <span className="flex-1">
              <span className="block text-[11px] font-semibold" style={{ color: on ? "#1c1d1a" : ink }}>{o.l}</span>
              <span className="block text-[9.5px]" style={{ color: on ? "rgba(28,29,26,0.7)" : sub }}>{o.d}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
  const renderDirection = (key, opts) => (
    <div className="grid grid-cols-2 gap-1.5">
      {opts.map((o) => {
        const Icon = DIR_ICON[o] || Minus;
        const on = answers[key] === o;
        return (
          <button key={o} type="button" onClick={() => setA(key, on ? null : o)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all"
            style={{ background: on ? ACC : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${on ? ACC : dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}`, color: on ? "#1c1d1a" : ink }}>
            <Icon className="h-3.5 w-3.5" /> {o}
          </button>
        );
      })}
    </div>
  );
  const renderTrajectory = (key, opts) => (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => setA(key, answers[key] === o ? null : o)} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10.5px] font-semibold transition-all"
          style={{ background: answers[key] === o ? ACC : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", border: `1px solid ${answers[key] === o ? ACC : dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}`, color: answers[key] === o ? "#1c1d1a" : ink }}>
          <span className="text-[13px] leading-none">{TRAJ_GLYPH[o] || "→"}</span> {o}
        </button>
      ))}
    </div>
  );

  const renderPart = (p) => {
    let input = null;
    if (p.type === "single") input = renderSingle(p.key, p.options);
    else if (p.type === "multi") input = renderMulti(p.key, p.options, p.max);
    else if (p.type === "text") input = renderText(p.key, p.placeholder, p.noneOption);
    else if (p.type === "direction") input = renderDirection(p.key, p.options);
    else if (p.type === "trajectory") input = renderTrajectory(p.key, p.options);
    return (
      <div key={p.key} className="space-y-1.5">
        {p.label && <p className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: sub }}>{p.label}{p.optional ? " (optioneel)" : ""}</p>}
        {input}
      </div>
    );
  };

  const renderQuestion = (qq) => {
    if (qq.type === "composite") return <div className="space-y-3">{qq.parts.map(renderPart)}</div>;
    if (qq.type === "single") return renderSingle(qq.key, qq.options);
    if (qq.type === "multi") return renderMulti(qq.key, qq.options, qq.max);
    if (qq.type === "text") return renderText(qq.key, qq.placeholder, qq.noneOption);
    if (qq.type === "battery") return renderBattery(qq.key, qq.options);
    if (qq.type === "direction") return renderDirection(qq.key, qq.options);
    if (qq.type === "trajectory") return renderTrajectory(qq.key, qq.options);
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* window header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <h3 className="text-[20px] font-display font-black tracking-[-0.03em] leading-none" style={{ color: ACC }}>{w.label}</h3>
          <p className="text-[9.5px] uppercase tracking-[0.16em] mt-0.5" style={{ color: sub }}>{w.time} · {w.subtitle}</p>
        </div>
        <span className="text-[9px] font-mono tabular-nums" style={{ color: sub }}>{step + 1}/{questions.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-2.5">
            <p className="text-[13px] font-semibold leading-snug" style={{ color: ink }}>{q.prompt}{q.optional ? " (optioneel)" : ""}</p>
            {renderQuestion(q)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* nav */}
      <div className="flex items-center gap-2 mt-2 shrink-0">
        {step > 0 && (
          <button type="button" onClick={back} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-semibold transition" style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: ink }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Terug
          </button>
        )}
        <button type="button" onClick={next} disabled={!stepAnswered || saving} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40" style={{ background: ACC, color: "#1c1d1a" }}>
          {isLast ? <>Inchecken <Check className="h-4 w-4" /></> : <>Volgende <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}