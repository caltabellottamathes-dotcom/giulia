import React from "react";
import { motion } from "framer-motion";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { Layers, GitBranch, AlertTriangle } from "lucide-react";

const CLASS_COLOR = {
  project_info: "text-charcoal",
  theme_info: "text-olive",
  requirement: "text-steel",
  objective: "text-powder",
  task: "text-sand-deep",
  milestone: "text-olive",
  decision: "text-plum",
  deadline: "text-urgent",
  person: "text-blue-grey",
  document: "text-steel/70",
  knowledge: "text-olive/70",
  note: "text-muted-foreground",
  insight: "text-giulia-dust",
  open_question: "text-urgent",
  dependency: "text-steel",
};

/** IngestStructure — §38 STRUCTURE-pane: de themes-boom + geclassificeerde
 *  items die GIULIA uit de bron heeft herkend. */
export default function IngestStructure({ source }) {
  const pu = source.project_understanding || {};
  const themes = pu.themes || [];
  const items = (source.proposed_records || []).map((r) => ({
    ...r,
    classification: r.classification || (pu.items?.[r.index]?.classification) || "",
  }));

  // Build tree: top-level themes + their subthemes
  const topLevel = themes.filter((t) => !t.parent_title);
  const childrenOf = (title) => themes.filter((t) => t.parent_title === title);

  const itemsForTheme = (title) => items.filter((r) => (r.theme_title || "").toLowerCase() === (title || "").toLowerCase());
  const orphanItems = items.filter((r) => !r.theme_title);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <GlassPanel level={2} className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-olive" />
          <h3 className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">Projectstructuur</h3>
        </div>
        <p className="text-sm text-foreground/80">
          {source.detected_project_id ? (
            <>GIULIA koppelt deze bron aan een <span className="text-olive font-medium">bestaand project</span>. </>
          ) : source.overall_subject ? (
            <>Onderwerp: <span className="text-foreground font-medium">{source.overall_subject}</span>. </>
          ) : null}
          {themes.length} theme{themes.length === 1 ? "" : "s"}, {items.length} item{items.length === 1 ? "" : "s"} herkend.
        </p>
        {source.purpose && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{source.purpose}</p>}
      </GlassPanel>

      {themes.length > 0 && (
        <div className="space-y-2">
          {topLevel.map((t) => (
            <ThemeNode key={t.title} theme={t} children={childrenOf(t.title)} items={itemsForTheme(t.title)} allThemes={themes} itemsForTheme={itemsForTheme} />
          ))}
        </div>
      )}

      {orphanItems.length > 0 && (
        <GlassPanel level={1} className="p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-2">Projectniveau (zonder theme)</p>
          <div className="space-y-1.5">
            {orphanItems.map((r) => <ItemRow key={r.index} item={r} />)}
          </div>
        </GlassPanel>
      )}

      {themes.length === 0 && items.length > 0 && (
        <GlassPanel level={1} className="p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-2">Gekende items</p>
          <div className="space-y-1.5">
            {items.map((r) => <ItemRow key={r.index} item={r} />)}
          </div>
        </GlassPanel>
      )}
    </motion.div>
  );
}

function ThemeNode({ theme, children = [], items = [], allThemes, itemsForTheme }) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl glass-1 p-4">
      <div className="flex items-start gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-olive mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{theme.title}</p>
          {theme.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{theme.description}</p>}
          {theme.purpose && <p className="text-[10px] text-olive/80 mt-0.5">Doel: {theme.purpose}</p>}
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5 ml-6">
          {items.map((r) => <ItemRow key={r.index} item={r} />)}
        </div>
      )}
      {children.length > 0 && (
        <div className="ml-6 mt-3 space-y-2 border-l border-border/40 pl-3">
          {children.map((c) => (
            <ThemeNode key={c.title} theme={c} children={[]} items={itemsForTheme(c.title)} allThemes={allThemes} itemsForTheme={itemsForTheme} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ItemRow({ item }) {
  const cls = item.entity_class || "";
  const color = CLASS_COLOR[item.classification] || "text-muted-foreground";
  const validation = item.validation || {};
  return (
    <div className="flex items-center gap-2 rounded-lg bg-foreground/[0.03] px-2.5 py-1.5">
      <span className={`text-[9px] uppercase tracking-wider font-bold shrink-0 ${color}`}>{item.classification || cls}</span>
      <span className="text-xs text-foreground/85 flex-1 truncate">{item.title || item.fields?.name}</span>
      {item.decision === "CONFLICT" && <AlertTriangle className="w-3 h-3 text-urgent shrink-0" />}
      {validation.errors && validation.errors.length > 0 && (
        <span className="text-[9px] text-urgent shrink-0" title={validation.errors.join("; ")}>⚠</span>
      )}
    </div>
  );
}