import React, { useEffect, useState } from "react";
import {
  Folder, FolderPlus, Pencil, Trash2, ChevronRight, Briefcase, HardDrive,
} from "lucide-react";
import { isInternalDrag, readDrag } from "./dnd";

/** SidebarTree — mappen-zijbalk van de FILES-pagina: geneste map-boom met
 *  drag & drop, Projects-sectie en de pinned Lokaal-map. */

function TreeRow({ folder, depth, count, active, expanded, hasKids, onNavigate, onToggleExpand, onRename, onDelete, onDropFiles, onDropFolder }) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`group relative flex items-center gap-1.5 rounded-xl pr-2 transition ${active ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}
      style={{ paddingLeft: 6 + depth * 14 }}
      onDragOver={(e) => { if (isInternalDrag(e) && !over) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const d = readDrag(e);
        if (!d) return;
        if (d.type === "files") onDropFiles(d.ids, folder.path);
        else onDropFolder(d.path, folder.path);
      }}
    >
      {hasKids ? (
        <button onClick={(e) => { e.stopPropagation(); onToggleExpand(folder.path); }} className="shrink-0 h-6 w-5 flex items-center justify-center text-foreground/40 hover:text-foreground">
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      ) : (
        <span className="h-6 w-5 shrink-0" />
      )}
      <button onClick={() => onNavigate(folder.path)} className="flex items-center gap-2 flex-1 min-w-0 text-left py-1.5">
        <Folder className={`h-3.5 w-3.5 shrink-0 ${over ? "text-olive" : "opacity-70"}`} />
        <span className="text-[13px] font-medium truncate">{folder.name}</span>
      </button>
      <span className="text-[10px] font-mono text-foreground/35 tabular-nums shrink-0">{count}</span>
      <span className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button onClick={(e) => { e.stopPropagation(); onRename(folder); }} className="h-5 w-5 rounded-full hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground" title="Hernoem map">
          <Pencil className="h-2.5 w-2.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(folder); }} className="h-5 w-5 rounded-full hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-destructive" title="Verwijder map">
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </span>
    </div>
  );
}

export default function SidebarTree({
  tree, folderCounts, path, onNavigate, onCreateFolder, onRenameFolder, onDeleteFolder, onDropFiles, onDropFolder,
  projects, projectCount, activeProject, onSelectProject,
  activeLocal, onSelectLocal, localCount, projectsCount,
}) {
  const [expanded, setExpanded] = useState(() => new Set());
  const [projectsOpen, setProjectsOpen] = useState(true);

  // bovenliggende mappen van het huidige pad automatisch uitklappen
  useEffect(() => {
    if (!path) return;
    const parts = path.split("/").filter(Boolean);
    setExpanded((prev) => {
      const next = new Set(prev);
      parts.slice(0, -1).forEach((_, i) => next.add(parts.slice(0, i + 1).join("/")));
      return next;
    });
  }, [path]);

  const toggleExpand = (p) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });

  const renderLevel = (parent, depth) =>
    tree.children(parent).map((f) => {
      const kids = tree.children(f.path);
      const isExpanded = expanded.has(f.path);
      return (
        <div key={f.id}>
          <TreeRow
            folder={f}
            depth={depth}
            count={folderCounts[f.path] || 0}
            active={path === f.path}
            hasKids={kids.length > 0}
            expanded={isExpanded}
            onNavigate={onNavigate}
            onToggleExpand={toggleExpand}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            onDropFiles={onDropFiles}
            onDropFolder={onDropFolder}
          />
          {isExpanded && kids.length > 0 && renderLevel(f.path, depth + 1)}
        </div>
      );
    });

  return (
    <div className="w-[210px] shrink-0 border-r border-foreground/10 flex flex-col">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-foreground/45">Mappen</p>
        <button
          onClick={onCreateFolder}
          className="h-7 w-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center text-foreground/60 transition"
          title="Nieuwe map"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        <button
          onClick={() => onNavigate("")}
          className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-2 transition ${!activeProject && !activeLocal && !path ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}
        >
          <Folder className="h-3.5 w-3.5 opacity-70" />
          <span className="text-[13px] font-medium flex-1 text-left">Bibliotheek</span>
        </button>
        {renderLevel("", 0)}

        {/* Lokaal — map op je schijf, geen upload */}
        <div className="pt-3">
          <button
            onClick={onSelectLocal}
            className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-2 transition ${activeLocal ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}
          >
            <HardDrive className="h-3.5 w-3.5 opacity-70" />
            <span className="text-[13px] font-medium flex-1 text-left">Lokaal</span>
            <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{localCount}</span>
          </button>
        </div>

        {/* Projects — één bovenmap, automatisch een submap per project */}
        <div className="pt-3">
          <button
            onClick={() => setProjectsOpen((v) => !v)}
            className="group flex items-center gap-2 w-full rounded-xl px-2.5 py-2 text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground transition"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${projectsOpen ? "rotate-90" : ""}`} />
            <Briefcase className="h-3.5 w-3.5 opacity-70" />
            <span className="text-[13px] font-medium flex-1 text-left">Projects</span>
            <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{projectsCount}</span>
          </button>
          {projectsOpen && (
            <div className="ml-3 pl-2 border-l border-foreground/10 space-y-0.5">
              {projects.length === 0 && (
                <p className="px-2.5 py-1.5 text-[11px] text-foreground/35">Nog geen projecten</p>
              )}
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-2 transition ${activeProject?.id === p.id ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}
                >
                  <Folder className="h-3.5 w-3.5 opacity-70" />
                  <span className="text-[13px] font-medium flex-1 text-left truncate">{p.title || "Naamloos project"}</span>
                  <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{projectCount(p.id)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}