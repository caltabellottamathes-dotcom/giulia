import React, { useState, useRef, useEffect } from "react";
import { sendQuickCommand, hideCurrentWindow, haptic } from "@/lib/nativeBridge";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

/**
 * QuickCommand — borderless, transparent command-palette page (Tauri window
 * "palette", Ctrl+Shift+Space). A single input whose content is sent straight
 * to functions/interpretInput (source: "command"). Also usable in-browser at
 * /quick. Preserves the minimalist 1px-border brutalism.
 */
export default function QuickCommand() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e) => {
    e?.preventDefault();
    const v = text.trim();
    if (!v || status === "sending") return;
    setStatus("sending");
    try {
      const res = await sendQuickCommand(v);
      if (res?.ok) {
        setStatus("done");
        haptic("success");
        setText("");
        setTimeout(() => { hideCurrentWindow(); setStatus("idle"); }, 600);
      } else {
        setStatus("error"); haptic("error");
        setTimeout(() => setStatus("idle"), 1500);
      }
    } catch {
      setStatus("error"); haptic("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  const placeholder =
    status === "done" ? "Verzonden ✓" :
    status === "error" ? "Mislukt — probeer opnieuw" :
    "Geef Giulia een opdracht…";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(245,241,232,0.92)", backdropFilter: "blur(24px)" }}
    >
      <form onSubmit={submit} className="w-full max-w-xl mx-4 flex items-center gap-3">
        <span className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center shrink-0 border border-white/20">
          <Sparkles className="h-4 w-4 text-olive" />
        </span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none border-b border-border/40 pb-1"
        />
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
        ) : (
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-9 w-9 rounded-xl bg-charcoal text-ivory flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            aria-label="Verzend"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}