import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sparkles, Check, X, Mail, MessageCircle, Calendar, CheckSquare,
  FileText, Zap, RefreshCw, Clock, AlertCircle,
} from "lucide-react";

const SOURCE_META = {
  giulia: { icon: Sparkles, label: "Giulia" },
  giuliaLeader: { icon: Sparkles, label: "Giulia" },
  manageTasks: { icon: CheckSquare, label: "Task-agent" },
  startGiulia: { icon: Zap, label: "Opstart" },
  syncGmail: { icon: Mail, label: "Gmail-sync" },
  syncCalendar: { icon: Calendar, label: "Agenda-sync" },
  syncDrive: { icon: FileText, label: "Drive-sync" },
  manageCommunication: { icon: MessageCircle, label: "Communicatie" },
  manageProjects: { icon: FileText, label: "Projecten" },
  runProactivity: { icon: Sparkles, label: "Proactief" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "zojuist";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} u`;
  return `${Math.floor(s / 86400)} d`;
}

/**
 * SocialFeed — alles wat achter de schermen is afgespoeld (Activity), je open
 * todos (Task) en wachtende goedkeuringen (Approval), samengevoegd in één
 * real-time sociale feed. Scroll doorheen de pagina; swipe een kaart naar
 * rechts/links om te acteren (taak afronden, goedkeuring goed/af keuren,
 * update wegvegen). Tap-knoppen voor goedkeuringen werken ook.
 */
export default function SocialFeed() {
  const [activity, setActivity] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const [a, ap, t] = await Promise.all([
      base44.entities.Activity.list("-created_date", 24).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }, "-created_date", 8).catch(() => []),
      base44.entities.Task.filter(
        { status: { $in: ["today", "upcoming", "overdue", "waiting", "todo", "in_progress", "gepland", "actief"] } },
        "-created_date", 12
      ).catch(() => []),
    ]);
    setActivity(a || []);
    setApprovals(ap || []);
    setTasks(t || []);
  }, []);

  useEffect(() => {
    load();
    const unsubs = [];
    ["Activity", "Approval", "Task"].forEach((n) => {
      try {
        const u = base44.entities[n]?.subscribe?.(() => load());
        if (u) unsubs.push(u);
      } catch { /* ignore */ }
    });
    return () => { unsubs.forEach((u) => { try { u(); } catch { /* ignore */ } }); };
  }, [load]);

  const feed = useMemo(() => {
    const items = [];
    approvals.forEach((a) => items.push({ kind: "approval", id: "ap" + a.id, date: a.created_date, data: a }));
    tasks.forEach((t) => items.push({ kind: "task", id: "tk" + t.id, date: t.created_date, data: t }));
    activity.forEach((a) => items.push({ kind: "activity", id: "ac" + a.id, date: a.created_date || a.timestamp, data: a }));
    items.sort((x, y) => new Date(y.date || 0) - new Date(x.date || 0));
    return items.filter((it) => !dismissed.has(it.id));
  }, [activity, approvals, tasks, dismissed]);

  const decide = useCallback(async (ap, action) => {
    if (busy) return;
    setBusy(true);
    setDismissed((s) => new Set(s).add("ap" + ap.id));
    try {
      await base44.functions.invoke("executeApproval", { approval_id: ap.id, action });
      toast({ title: action === "approve" ? "Goedgekeurd" : "Verworpen" });
    } catch {
      toast({ title: "Mislukt", variant: "destructive" });
      setDismissed((s) => { const n = new Set(s); n.delete("ap" + ap.id); return n; });
    }
    setBusy(false);
    load();
  }, [busy, toast, load]);

  const completeTask = useCallback(async (t) => {
    setDismissed((s) => new Set(s).add("tk" + t.id));
    try {
      await base44.entities.Task.update(t.id, { status: "completed" });
      toast({ title: "Taak voltooid", description: t.title });
    } catch {
      setDismissed((s) => { const n = new Set(s); n.delete("tk" + t.id); return n; });
    }
    load();
  }, [toast, load]);

  const dismiss = useCallback((id) => setDismissed((s) => new Set(s).add(id)), []);

  const onDragEnd = (item, info) => {
    if (info.offset.x > 120) {
      if (item.kind === "task") completeTask(item.data);
      else if (item.kind === "approval") decide(item.data, "approve");
      else dismiss(item.id);
    } else if (info.offset.x < -120) {
      if (item.kind === "approval") decide(item.data, "reject");
      else dismiss(item.id);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-olive font-semibold">Achter de schermen</p>
          <h2 className="text-lg font-display font-semibold">Wat er nieuw is</h2>
        </div>
        <button onClick={load} className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition" aria-label="Vernieuw">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-1">
        Swipe een taak → om af te ronden · een goedkeuring →/← om goed/af te keuren
      </p>

      {feed.length === 0 ? (
        <div className="glass-2 rounded-2xl p-10 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Alles is bij — niets nieuws.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {feed.slice(0, 16).map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                onDragEnd={onDragEnd}
                onApprove={(ap) => decide(ap, "approve")}
                onReject={(ap) => decide(ap, "reject")}
                onComplete={completeTask}
                busy={busy}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function FeedCard({ item, onDragEnd, onApprove, onReject, onComplete, busy }) {
  const stop = (e) => e.stopPropagation();

  if (item.kind === "approval") {
    const a = item.data;
    return (
      <motion.div
        layout
        exit={{ opacity: 0, x: 300, transition: { duration: 0.25 } }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.6}
        onDragEnd={(e, info) => onDragEnd(item, info)}
        className="relative glass-2 rounded-2xl p-4 cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4 w-4 text-olive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[10px] uppercase tracking-wider text-olive font-semibold">Ter goedkeuring</p>
              <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full ${a.assignee === "giulia" ? "bg-steel/25 text-foreground/70" : "bg-olive/20 text-foreground"}`}>
                {a.assignee === "giulia" ? "Giulia" : "Jij"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(a.created_date)}</span>
            </div>
            <p className="text-sm font-medium">{a.description || a.title}</p>
            {a.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>}
            <div className="flex gap-2 mt-3" onPointerDown={stop}>
              <button onClick={() => onApprove(a)} disabled={busy} className="flex-1 h-9 rounded-xl bg-olive text-ivory text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Goed
              </button>
              <button onClick={() => onReject(a)} disabled={busy} className="flex-1 h-9 rounded-xl glass-1 text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                <X className="h-3.5 w-3.5" /> Af
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (item.kind === "task") {
    const t = item.data;
    return (
      <motion.div
        layout
        exit={{ opacity: 0, x: 300, transition: { duration: 0.25 } }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -160, right: 160 }}
        dragElastic={0.6}
        onDragEnd={(e, info) => onDragEnd(item, info)}
        className="relative glass-2 rounded-2xl p-4 cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div className="flex items-center gap-3">
          <button onPointerDown={stop} onClick={() => onComplete(t)} className="h-6 w-6 rounded-md border-2 border-border/80 hover:border-olive shrink-0 flex items-center justify-center transition" aria-label="Rond af">
            <Check className="h-3.5 w-3.5 text-transparent group-hover:text-olive" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{t.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {t.priority && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.priority}</span>}
              {t.deadline && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(t.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
              {t.delegated_to_giulia && <span className="text-[9px] uppercase tracking-wider font-semibold text-olive">Giulia</span>}
              <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(t.created_date)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const a = item.data;
  const meta = SOURCE_META[a.source] || { icon: Sparkles, label: a.source || "Giulia" };
  const Icon = meta.icon;
  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: -300, transition: { duration: 0.25 } }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: -160, right: 160 }}
      dragElastic={0.6}
      onDragEnd={(e, info) => onDragEnd(item, info)}
      className="relative glass-1 rounded-2xl p-4 cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl glass-1 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-olive" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[10px] uppercase tracking-wider text-olive font-semibold">{meta.label}</p>
            <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(a.created_date || a.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground/85">{a.description}</p>
        </div>
      </div>
    </motion.div>
  );
}