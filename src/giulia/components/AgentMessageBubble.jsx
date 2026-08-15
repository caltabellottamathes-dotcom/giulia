import React, { useState } from "react";
import { CheckCircle2, Loader2, XCircle, ChevronDown, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatMarkdown from "@/system/components/glass/ChatMarkdown";

function statusMeta(status) {
  if (status === "completed" || status === "success") return { Icon: CheckCircle2, cls: "text-emerald-600", label: "uitgevoerd" };
  if (status === "failed" || status === "error") return { Icon: XCircle, cls: "text-red-500", label: "mislukt" };
  return { Icon: Loader2, cls: "text-muted-foreground animate-spin", label: "uitvoeren" };
}

function FunctionChip({ toolCall }) {
  const [open, setOpen] = useState(false);
  const { Icon, cls, label } = statusMeta(toolCall.status);
  const dp = toolCall.display_projection || {};
  const hide = dp.hide_details && dp.details_redacted;
  let args = toolCall.arguments_string || "";
  try { args = JSON.stringify(JSON.parse(args), null, 2); } catch { /* raw */ }
  let results = toolCall.results;
  try { results = JSON.stringify(JSON.parse(results), null, 2); } catch { /* raw */ }
  const chipLabel = dp.label || toolCall.name;
  return (
    <div className="mt-2 border border-border/40 rounded-lg overflow-hidden bg-background/40">
      <button onClick={() => !hide && setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-xs">
        {hide ? <Icon className={cn("h-3.5 w-3.5", cls)} /> : open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{chipLabel}</span>
        <span className={cn("ml-auto", cls)}>{hide ? (dp.label || label) : label}</span>
      </button>
      {!hide && open && (
        <div className="px-3 pb-2 space-y-2 text-[11px]">
          {args && (<div><div className="text-muted-foreground mb-1">Parameters:</div><pre className="whitespace-pre-wrap break-words bg-muted/30 rounded p-2">{args}</pre></div>)}
          {results && (<div><div className="text-muted-foreground mb-1">Result:</div><pre className="whitespace-pre-wrap break-words bg-muted/30 rounded p-2">{results}</pre></div>)}
        </div>
      )}
    </div>
  );
}

export default function AgentMessageBubble({ message, isUser, avatar }) {
  const toolCalls = message.tool_calls || [];
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="h-8 w-8 rounded-full bg-charcoal flex items-center justify-center shrink-0 text-[10px] font-semibold text-ivory">SC</div>
      ) : (
        <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
      )}
      <div className={cn("max-w-[78%]", isUser ? "items-end" : "items-start", "flex flex-col")}>
        {!isUser && toolCalls.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 px-1">
            <Wrench className="h-3 w-3" /> CORE
          </span>
        )}
        {message.content && (
          <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed", isUser ? "bg-foreground/8 text-foreground" : "glass-1 text-foreground")}>
            {isUser ? message.content : <ChatMarkdown className="prose prose-sm max-w-none">{message.content}</ChatMarkdown>}
          </div>
        )}
        {toolCalls.map((tc, i) => <FunctionChip key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}