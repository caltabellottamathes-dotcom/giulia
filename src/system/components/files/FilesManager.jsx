import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useFolderTree } from "@/lib/useFolderTree";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload, Loader2, FolderPlus, ChevronRight, Trash2, Folder, Check,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import SidebarTree from "@/system/components/files/SidebarTree";
import FolderTile from "@/system/components/files/FolderTile";
import FileTile from "@/system/components/files/FileTile";
import LocalBrowser from "@/system/components/files/LocalBrowser";
import { isInternalDrag, readDrag } from "@/system/components/files/dnd";

const KIND_TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
  { key: "doc", label: "Docs" },
];

/** FilesManager — de witte hoofdkaart van de Files-pagina, nu een echte
 *  verkenner: geneste mappen (incl. lege), hernoemen, verplaatsen via drag
 *  & drop (bestanden én mappen), multi-select, OS-bestanden erin slepen,
 *  project-mappen en de lokale schijf-map. */
export default function FilesManager({ onSendToGiulia }) {
  const { items, loading, uploading, upload, remove, removeMany, rename, moveMany, setProjectFile, reload } = useMediaLibrary();
  const tree = useFolderTree();
  const { openMedia } = useMediaViewer();
  const { toast } = useToast();

  const fileRef = useRef(null);
  const [tab, setTab] = useState("all");
  const [path, setPath] = useState("");        // huidige cloud-map-pad
  const [project, setProject] = useState(null); // project-filter
  const [mode, setMode] = useState("cloud");   // cloud | local
  const [selection, setSelection] = useState(new Set());
  const [osDrag, setOsDrag] = useState(false);
  const [sending, setSending] = useState(null);
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try { const list = await base44.entities.Project.list("-updated_date", 200); setProjects(list || []); }
    catch { setProjects([]); }
  };
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    const h = () => loadProjects();
    window.addEventListener("giulia:projects-reload", h);
    return () => window.removeEventListener("giulia:projects-reload", h);
  }, []);

  // Legacy map-paden die alleen op bestanden staan registreren als echte mappen
  useEffect(() => {
    if (loading || tree.loading) return;
    const paths = [...new Set((items || []).map((i) => i.folder).filter(Boolean))];
    tree.ensurePaths(paths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loading, tree.loading]);

  // Afstammeling-telling per map-pad (voor tegels en de zijbalk)
  const folderCounts = useMemo(() => {
    const agg = {};
    (items || []).forEach((i) => {
      if (!i.folder || i.project_id) return;
      const parts = i.folder.split("/");
      for (let k = 1; k <= parts.length; k++) {
        const p = parts.slice(0, k).join("/");
        agg[p] = (agg[p] || 0) + 1;
      }
    });
    return agg;
  }, [items]);

  const scopeItems = useMemo(() => {
    const list = items || [];
    if (project) return list.filter((i) => i.project_id === project.id);
    if (!path) return list.filter((i) => !i.folder && !i.project_id);
    return list.filter((i) => i.folder === path && !i.project_id);
  }, [items, path, project]);

  const counts = {
    all: scopeItems.length,
    image: scopeItems.filter((i) => kindOfUpload(i) === "image").length,
    video: scopeItems.filter((i) => kindOfUpload(i) === "video").length,
    music: scopeItems.filter((i) => kindOfUpload(i) === "music").length,
    doc: scopeItems.filter((i) => kindOfUpload(i) === "doc").length,
  };
  const visible = tab === "all" ? scopeItems : scopeItems.filter((i) => kindOfUpload(i) === tab);
  const childFolders = useMemo(() => tree.children(path), [tree, path]);

  /* ── Acties ──────────────────────────────────────────────────── */

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    for (const f of files) await upload(f, project ? `Projects/${project.id}` : path);
    e.target.value = "";
  };

  const onOSDrop = async (e) => {
    e.preventDefault();
    setOsDrag(false);
    if (isInternalDrag(e)) return;
    const files = [...(e.dataTransfer.files || [])];
    if (!files.length) return;
    for (const f of files) await upload(f, project ? `Projects/${project.id}` : path);
    toast({ title: `${files.length} geüpload`, description: project ? project.title : path || "Bibliotheek" });
  };

  const open = (item) => openMedia({ name: item.filename, url: item.file_url, type: kindOfUpload(item) });

  const doRenameFile = (item) => {
    const name = window.prompt("Hernoem bestand", item.filename);
    if (name && name.trim()) rename(item.id, name.trim());
  };

  const doCreateFolder = async (parentPath = path) => {
    const name = window.prompt(parentPath ? `Naam van de nieuwe map in “${parentPath.split("/").pop()}”` : "Naam van de nieuwe map");
    if (!name || !name.trim()) return;
    const r = await tree.createFolder(name.trim(), parentPath);
    if (r.error) toast({ title: r.error, variant: "destructive" });
    else toast({ title: "Map aangemaakt", description: r.folder.path });
  };

  const doRenameFolder = async (folder) => {
    const name = window.prompt("Map hernoemen", folder.name);
    if (!name || !name.trim() || name.trim() === folder.name) return;
    const r = await tree.renameFolder(folder.path, name.trim());
    if (r.error) { toast({ title: r.error, variant: "destructive" }); return; }
    reload();
    if (path === folder.path || path.startsWith(`${folder.path}/`)) setPath(r.newPath);
    toast({ title: "Map hernoemd", description: r.newPath });
  };

  const doDeleteFolder = async (folder) => {
    const n = folderCounts[folder.path] || 0;
    if (!window.confirm(`Map “${folder.name}” verwijderen?\n\n${n ? `Alle ${n} bestanden en submappen erin worden definitief verwijderd.` : "De map is leeg."}`)) return;
    const r = await tree.deleteFolder(folder.path);
    if (r.error) { toast({ title: r.error, variant: "destructive" }); return; }
    reload();
    if (path === folder.path || path.startsWith(`${folder.path}/`)) setPath(folder.parent_path || "");
    setSelection(new Set());
    toast({ title: "Map verwijderd", description: r.files ? `${r.files} bestanden mee verwijderd` : folder.path });
  };

  const moveFiles = async (ids, dest) => {
    if (!ids || !ids.length) return;
    await moveMany(ids, dest);
    setSelection(new Set());
    toast({ title: ids.length === 1 ? "Verplaatst" : `${ids.length} bestanden verplaatst`, description: dest || "Niet-ingedeeld" });
  };

  const moveFolderDrop = async (src, dest) => {
    if (!src || src === dest) return;
    const r = await tree.moveFolder(src, dest || "");
    if (r.error) { toast({ title: r.error, variant: "destructive" }); return; }
    reload();
    if (path === src || path.startsWith(`${src}/`)) setPath(r.newPath);
    toast({ title: "Map verplaatst", description: `${src} → ${dest || "Bibliotheek"}` });
  };

  const sendToGiulia = async (item) => {
    setSending(item.id);
    try {
      await base44.functions.invoke("chatWithGiulia", {
        message: `Ik deel dit bestand met je: ${item.filename}`,
        file_urls: [item.file_url],
        attachments: [{ url: item.file_url, name: item.filename, type: kindOfUpload(item) }],
        source: "chat",
        persist: true,
      });
      toast({ title: "Verzonden naar GIULIA", description: item.filename });
      onSendToGiulia?.();
    } catch {
      toast({ title: "Verzenden mislukt", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  const toggleSelect = (id) =>
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const selectAllVisible = () =>
    setSelection((prev) => (prev.size === visible.length ? new Set() : new Set(visible.map((i) => i.id))));

  const deleteSelected = async () => {
    const ids = [...selection];
    if (!ids.length) return;
    if (!window.confirm(`${ids.length} bestand${ids.length === 1 ? "" : "en"} definitief verwijderen?`)) return;
    await removeMany(ids);
    setSelection(new Set());
  };

  const targetLabel = project ? project.title : path || "Bibliotheek";
  const segments = path ? path.split("/") : [];

  /* ── Lokaal / project-navigatie ──────────────────────────────── */

  const goLocal = () => { setMode("local"); setProject(null); setSelection(new Set()); };
  const goCloud = () => { setMode("cloud"); };
  const goPath = (p) => { setMode("cloud"); setProject(null); setPath(p || ""); setSelection(new Set()); };
  const goProject = (p) => { setMode("cloud"); setProject(p); setSelection(new Set()); };

  if (mode === "local") {
    return (
      <div className="h-full w-full flex">
        <SidebarTree
          tree={tree} folderCounts={folderCounts} path=""
          onNavigate={goPath} onCreateFolder={() => doCreateFolder("")}
          onRenameFolder={doRenameFolder} onDeleteFolder={doDeleteFolder}
          onDropFiles={moveFiles} onDropFolder={moveFolderDrop}
          projects={projects} projectCount={(pid) => (items || []).filter((i) => i.project_id === pid).length}
          activeProject={null} onSelectProject={goProject}
          activeLocal on onSelectLocal={goLocal}
          localCount={0} projectsCount={(items || []).filter((i) => i.project_id).length}
        />
        <LocalBrowser />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex"
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files") && !isInternalDrag(e)) { e.preventDefault(); setOsDrag(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOsDrag(false); }}
      onDrop={onOSDrop}
    >
      <SidebarTree
        tree={tree} folderCounts={folderCounts} path={path}
        onNavigate={goPath} onCreateFolder={() => doCreateFolder(path)}
        onRenameFolder={doRenameFolder} onDeleteFolder={doDeleteFolder}
        onDropFiles={moveFiles} onDropFolder={moveFolderDrop}
        projects={projects} projectCount={(pid) => (items || []).filter((i) => i.project_id === pid).length}
        activeProject={project} onSelectProject={goProject}
        activeLocal={false} onSelectLocal={goLocal}
        localCount={0} projectsCount={(items || []).filter((i) => i.project_id).length}
      />

      {/* Hoofdinhoud */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {/* OS-sleep-overlay */}
        {osDrag && (
          <div className="absolute inset-0 z-30 rounded-2xl border-2 border-dashed border-olive bg-olive/5 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <Upload className="h-8 w-8 text-olive" />
            <p className="text-sm font-semibold text-olive">Laat los om te uploaden naar “{targetLabel}”</p>
          </div>
        )}

        {/* Kop: breadcrumb + acties */}
        <div className="px-5 pt-5 pb-3 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-1 text-[13px] text-foreground/70 min-w-0 flex-wrap">
            {project ? (
              <>
                <button onClick={() => goPath("")} className="hover:text-foreground underline underline-offset-2">Bibliotheek</button>
                <ChevronRight className="h-3 w-3 text-foreground/30" />
                <span className="font-semibold text-foreground">{project.title}</span>
              </>
            ) : (
              <>
                <button onClick={() => goPath("")} className={!path ? "font-semibold text-foreground" : "hover:text-foreground underline underline-offset-2"}>Bibliotheek</button>
                {segments.map((seg, i) => {
                  const p = segments.slice(0, i + 1).join("/");
                  const last = i === segments.length - 1;
                  return (
                    <span key={p} className="flex items-center gap-1 min-w-0">
                      <ChevronRight className="h-3 w-3 text-foreground/30 shrink-0" />
                      <button
                        onClick={() => goPath(p)}
                        onDragOver={(e) => { if (isInternalDrag(e)) e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const d = readDrag(e);
                          if (!d) return;
                          if (d.type === "files") moveFiles(d.ids, p);
                          else moveFolderDrop(d.path, p);
                        }}
                        className={last ? "font-semibold text-foreground truncate" : "hover:text-foreground underline underline-offset-2 truncate"}
                      >
                        {seg}
                      </button>
                    </span>
                  );
                })}
              </>
            )}
          </div>
          <div className="lg:ml-auto flex items-center gap-2">
            {!project && (
              <button
                onClick={() => doCreateFolder(path)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10"
              >
                <FolderPlus className="h-4 w-4" /> Nieuwe map
              </button>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading > 0}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory disabled:opacity-60"
            >
              {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading > 0 ? `Uploaden (${uploading})…` : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf,.pdf" multiple className="hidden" onChange={onFiles} />
          </div>
        </div>

        {/* Selectie-balk */}
        {selection.size > 0 && (
          <div className="mx-5 mb-3 flex items-center gap-2 rounded-full bg-charcoal text-ivory px-4 py-2 w-fit">
            <Check className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{selection.size} geselecteerd</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[11px] font-semibold underline underline-offset-2">Verplaats naar…</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 bg-charcoal text-ivory border-white/10 max-h-[320px] overflow-y-auto">
                <DropdownMenuItem onClick={() => moveFiles([...selection], "")} className="text-[12px] focus:bg-ivory/10">Niet-ingedeeld</DropdownMenuItem>
                {tree.folders.length > 0 && <DropdownMenuSeparator className="bg-ivory/10" />}
                {tree.folders.map((f) => (
                  <DropdownMenuItem key={f.id} onClick={() => moveFiles([...selection], f.path)} className="text-[12px] focus:bg-ivory/10 truncate">{f.path}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={deleteSelected} className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-300 hover:text-red-200">
              <Trash2 className="h-3 w-3" /> Verwijder
            </button>
            <button onClick={() => setSelection(new Set())} className="text-[11px] text-ivory/60 hover:text-ivory">Wissen</button>
          </div>
        )}

        {/* Type-filter */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 w-fit">
            {KIND_TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${tab === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"}`}>
                {t.label} <span className="opacity-50 ml-1">{counts[t.key] || 0}</span>
              </button>
            ))}
            {visible.length > 0 && (
              <button onClick={selectAllVisible} className="ml-1 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/50 hover:text-foreground whitespace-nowrap">
                {selection.size === visible.length ? "Deselecteer alles" : "Selecteer alles"}
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-foreground/40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : visible.length === 0 && childFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-foreground/[0.05] flex items-center justify-center">
                <Folder className="h-6 w-6 text-foreground/35" />
              </div>
              <p className="text-sm text-foreground/50 max-w-xs">
                {project ? `Nog geen bestanden in “${project.title}”.` : path ? `“${path.split("/").pop()}” is leeg.` : "Nog geen mappen of bestanden."}
              </p>
              <div className="flex gap-2">
                {!project && (
                  <button onClick={() => doCreateFolder(path)} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-foreground/[0.05] border border-foreground/10 text-foreground hover:bg-foreground/10">
                    <FolderPlus className="h-4 w-4" /> Nieuwe map
                  </button>
                )}
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory">
                  <Upload className="h-4 w-4" /> Upload hier
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {!project && childFolders.map((f) => (
                <FolderTile
                  key={f.id}
                  folder={f}
                  count={folderCounts[f.path] || 0}
                  onOpen={goPath}
                  onRename={doRenameFolder}
                  onDelete={doDeleteFolder}
                  onDropFiles={moveFiles}
                  onDropFolder={moveFolderDrop}
                />
              ))}
              {visible.map((item) => (
                <FileTile
                  key={item.id}
                  item={item}
                  selected={selection.has(item.id)}
                  dragIds={selection.has(item.id) ? [...selection] : [item.id]}
                  onToggleSelect={toggleSelect}
                  onOpen={open}
                  onRemove={remove}
                  onRename={doRenameFile}
                  onSend={sendToGiulia}
                  sending={sending === item.id}
                  onMove={moveFiles}
                  moveTargets={tree.folders.filter((f) => f.path !== (project ? `Projects/${project.id}` : path))}
                  projects={projects}
                  onMoveToProject={(id, p) => setProjectFile(id, p.id, `Projects/${p.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}