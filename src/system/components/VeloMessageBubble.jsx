import React, { useState } from "react";
import { ChevronDown, Check, Loader2, AlertCircle } from "lucide-react";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: { icon: Loader2, spin: true, text: "wacht", cls: "text-ivory/50" },
  running: { icon: Loader2, spin: true, text: "draait", cls: "text-ivory/50" },
  in_progress: { icon: Loader2, spin: true, text: "bezig", cls: "text-ivory/50" },
  completed: { icon: Check, text: "klaar", cls: "text-olive" },
  success: { icon: Check, text: "ok", cls: "text-olive" },
  failed: { icon: AlertCircle, text: "mislukt", cls: "text-red-400" },
  error: { icon: AlertCircle, text: "fout", cls: "text-red-400" },
};

function parseMaybe(v) {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
}

function ToolCall({ tc }) {
  const [open, setOpen] = useState(false);
  const proj = tc.display_projection || {};
  const hide = proj.hide_details && proj.details_redacted;
  const status = STATUS[tc.status] || STATUS.pending;
  const parsed = parseMaybe(tc.results);
  const failed = tc.status === "failed" || tc.status === "error"
    || (parsed && typeof parsed === "object" && parsed.success === false)
    || (typeof tc.results === "string" && /error|failed/i.test(tc.results));
  const label = hide
    ? (failed ? (proj.error_label || "mislukt") : (tc.status === "pending" || tc.status === "running" || tc.status === "in_progress" ? (proj.active_label || "bezig") : (proj.label || "klaar")))
    : status.text;
  const parsedArgs = parseMaybe(tc.arguments_string);
  return (
    <div className="mt-2 text-xs">
      <button onClick={() => !hide && setOpen((o) => !o)} className={cn("flex items-center gap-1.5", hide && "cursor-default")}>
        {failed ? <AlertCircle className="h-3 w-3 text-red-400" /> : <status.icon className={cn("h-3 w-3", status.spin && "animate-spin", status.cls)} />}
        <span className="font-medium text-ivory/80">{tc.name}</span>
        {!hide && <ChevronDown className={cn("h-3 w-3 text-ivory/40 transition-transform", open && "rotate-180")} />}
        <span className={cn("ml-1", failed ? "text-red-400" : status.cls)}>{label}</span>
      </button>
      {open && !hide && (
        <div className="ml-4 mt-1 space-y-1">
          {parsedArgs != null && (
            <div>
              <p className="text-ivory/40 uppercase tracking-wide text-[9px] mb-0.5">Parameters</p>
              <pre className="text-ivory/70 whitespace-pre-wrap break-all">{typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}</pre>
            </div>
          )}
          {parsed != null && (
            <div>
              <p className="text-ivory/40 uppercase tracking-wide text-[9px] mb-0.5">Result</p>
              <pre className="text-ivory/70 whitespace-pre-wrap break-all">{typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VeloMessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={cn("max-w-[85%] break-words", isUser ? "rounded-[18px] rounded-br-md px-4 py-2.5 text-sm bg-foreground text-background" : "chat-bubble rounded-[18px] rounded-bl-md px-4 py-2.5 text-sm text-ivory [&_pre]:overflow-x-auto [&_pre]:max-w-full")}>
        {message.content ? (isUser ? <p className="leading-relaxed">{message.content}</p> : <ChatMarkdown>{message.content}</ChatMarkdown>) : null}
        {message.tool_calls?.map((tc, i) => <ToolCall key={i} tc={tc} />)}
      </div>
    </div>
  );
}