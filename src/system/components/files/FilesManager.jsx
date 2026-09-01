import React, { useMemo, useRef, useState, useEffect } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import {
  Upload, Trash2, Film, Music, FileText, ImageIcon, Play, Loader2,
  FolderPlus, Pencil, Folder, Send, ChevronRight, Briefcase,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const KIND_TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
  { key: "doc", label: "Docs" },
];

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "doc") return <FileText className={className} />;
  return <ImageIcon className={className} />;
}

/** FilesManager — de witte hoofdkaart van de Files-pagina. Mappen, project-
 *  mappen (automatisch per project), verplaatsen, hernoemen/verwijderen,
 *  openen in de MediaStage, en verzenden naar GIULIA. */
export default function FilesManager({ onSendToGiulia }) {
  const { items, loading, uploading, upload, remove, removeMany, rename, setFolder, setProjectFile, reload } = useMediaLibrary();
  const { openMedia } = useMediaViewer();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [tab, setTab] = useState("all");
  const [folder, setFolderState] = useState(null); // null = niet-ingedeeld
  const [projectFilter, setProjectFilter] = useState(null); // project-object
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [projects, setProjects] = useState([]);
  const [sending, setSending] = useState(null);

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

  // Gewone mappen = folders op niet-project-bestanden, exclusief "Projects/..."
  const folders = useMemo(
    () => [...new Set((items || [])
      .filter((i) => !i.project_id && i.folder && !i.folder.startsWith("Projects/"))
      .map((i) => i.folder))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const unfiled = useMemo(() => (items || []).filter((i) => !i.folder && !i.project_id), [items]);
  const projectFilesCount = (items || []).filter((i) => i.project_id).length;
  const projectCount = (pid) => (items || []).filter((i) => i.project_id === pid).length;

  const scopeItems = useMemo(() => {
    const list = items || [];
    if (projectFilter) return list.filter((i) => i.project_id === projectFilter.id);
    if (folder == null) return list.filter((i) => !i.folder && !i.project_id);
    return list.filter((i) => i.folder === folder && !i.project_id);
  }, [items, folder, projectFilter]);

  const counts = {
    all: scopeItems.length,
    image: scopeItems.filter((i) => kindOfUpload(i) === "image").length,
    video: scopeItems.filter((i) => kindOfUpload(i) === "video").length,
    music: scopeItems.filter((i) => kindOfUpload(i) === "music").length,
    doc: scopeItems.filter((i) => kindOfUpload(i) === "doc").length,
  };

  const visible = tab === "all" ? scopeItems : scopeItems.filter((i) => kindOfUpload(i) === tab);

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    for (const f of files) {
      if (projectFilter) await upload(f, `Projects/${projectFilter.id}`, projectFilter.id);
      else await upload(f, folder || "");
    }
    e.target.value = "";
  };

  const open = (item) => openMedia({ name: item.filename, url: item.file_url, type: kindOfUpload(item) });

  const doRename = (item) => {
    const name = window.prompt("Hernoem bestand", item.filename);
    if (name && name.trim()) rename(item.id, name.trim());
  };

  const newFolder = () => {
    const name = window.prompt("Naam van de nieuwe map");
    if (name && name.trim()) { setProjectFilter(null); setFolderState(name.trim()); }
  };

  const emptyRoot = () => {
    if (!unfiled.length) return;
    if (!window.confirm(`${unfiled.length} niet-ingedeeld${unfiled.length === 1 ? " bestand" : "e bestanden"} definitief verwijderen?`)) return;
    removeMany(unfiled.map((i) => i.id));
  };

  const selectRoot = () => { setFolderState(null); setProjectFilter(null); };

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

  const targetLabel = projectFilter ? projectFilter.title : (folder || "Niet-ingedeeld");

  return (
    <div className="h-full w-full flex">
      {/* Mappen-zijbalk */}
      <div className="w-[210px] shrink-0 border-r border-foreground/10 flex flex-col">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-foreground/45">Mappen</p>
          <button onClick={newFolder} className="h-7 w-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center text-foreground/60 transition" title="Nieuwe map">
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          <FolderRow
            active={!projectFilter && folder == null}
            onClick={selectRoot}
            label="Niet-ingedeeld"
            count={unfiled.length}
            icon={<Folder className="h-3.5 w-3.5" />}
            onDelete={unfiled.length ? emptyRoot : undefined}
            deleteTitle="Alle niet-ingedeelde bestanden verwijderen"
          />
          {folders.map((f) => (
            <FolderRow
              key={f}
              active={!projectFilter && folder === f}
              onClick={() => { setFolderState(f); setProjectFilter(null); }}
              label={f}
              count={(items || []).filter((i) => i.folder === f && !i.project_id).length}
              icon={<Folder className="h-3.5 w-3.5" />}
              onDelete={() => {
                (items || []).filter((i) => i.folder === f).forEach((i) => setFolder(i.id, ""));
                if (folder === f) setFolderState(null);
              }}
            />
          ))}

          {/* Projects — één bovenmap, automatisch een submap per project */}
          <div className="pt-3">
            <button
              onClick={() => setProjectsExpanded((v) => !v)}
              className="group flex items-center gap-2 w-full rounded-xl px-2.5 py-2 text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground transition"
            >
              <ChevronRight className={`h-3.5 w-3.5 transition-transform ${projectsExpanded ? "rotate-90" : ""}`} />
              <Briefcase className="h-3.5 w-3.5 opacity-70" />
              <span className="text-[13px] font-medium flex-1 text-left">Projects</span>
              <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{projectFilesCount}</span>
            </button>
            {projectsExpanded && (
              <div className="ml-3 pl-2 border-l border-foreground/10 space-y-0.5">
                {projects.length === 0 && (
                  <p className="px-2.5 py-1.5 text-[11px] text-foreground/35">Nog geen projecten</p>
                )}
                {projects.map((p) => (
                  <FolderRow
                    key={p.id}
                    active={projectFilter?.id === p.id}
                    onClick={() => { setProjectFilter(p); setFolderState(null); }}
                    label={p.title || "Naamloos project"}
                    count={projectCount(p.id)}
                    icon={<Folder className="h-3.5 w-3.5" />}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hoofdinhoud */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-5 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {KIND_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  tab === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {t.label} <span className="opacity-50 ml-1">{counts[t.key] || 0}</span>
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="text-[10px] text-foreground/45">Uploads naar: <b className="text-foreground/70">{targetLabel}</b></span>
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

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-foreground/40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-14 w-14 rounded-2xl bg-foreground/[0.05] flex items-center justify-center mb-4">
                <ImageIcon className="h-6 w-6 text-foreground/35" />
              </div>
              <p className="text-sm text-foreground/50 max-w-xs">
                {projectFilter ? `Nog geen bestanden in “${projectFilter.title}”.` : folder ? `Nog geen bestanden in “${folder}”.` : "Nog geen niet-ingedeelde bestanden."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visible.map((item) => (
                <FileThumb
                  key={item.id}
                  item={item}
                  onOpen={open}
                  onRemove={remove}
                  onRename={doRename}
                  onMove={(id, f) => setFolder(id, f)}
                  onMoveToProject={(id, p) => setProjectFile(id, p.id, `Projects/${p.id}`)}
                  onSend={sendToGiulia}
                  sending={sending === item.id}
                  folders={folders}
                  projects={projects}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderRow({ active, onClick, label, count, icon, onDelete, deleteTitle }) {
  return (
    <div className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 transition ${active ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}>
      <button onClick={onClick} className="flex items-center gap-2 flex-1 min-w-0 text-left">
        <span className="shrink-0 opacity-70">{icon}</span>
        <span className="text-[13px] font-medium truncate">{label}</span>
      </button>
      <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{count}</span>
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded-full hover:bg-foreground/10 flex items-center justify-center text-foreground/40 transition" title={deleteTitle || "Map verwijderen"}>
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function FileThumb({ item, onOpen, onRemove, onRename, onMove, onMoveToProject, onSend, sending, folders, projects }) {
  const kind = kindOfUpload(item);
  return (
    <div className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-left">
      {kind === "image" ? (
        <button onClick={() => onOpen(item)} className="h-full w-full">
          <Image src={item.file_url} className="h-full w-full" fittingType="fill" />
        </button>
      ) : (
        <button onClick={() => onOpen(item)} className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground/45">
          <KindIcon kind={kind} className="h-7 w-7" />
          <span className="text-[10px] text-center px-2 line-clamp-2 text-foreground/55">{item.filename}</span>
        </button>
      )}
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
        {kind === "music" ? "audio" : kind}
      </span>
      {item.folder && (
        <span className="absolute top-2 right-2 text-[9px] font-medium text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full max-w-[60%] truncate" title={item.folder}>
          {item.folder}
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors pointer-events-none">
        <span className="h-10 w-10 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </span>
      </span>
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={(e) => { e.stopPropagation(); onSend(item); }} disabled={sending}
          className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center disabled:opacity-50" title="Verzend naar GIULIA">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Verplaats naar map">
              <Folder className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-charcoal text-ivory border-white/10 max-h-[320px] overflow-y-auto">
            <DropdownMenuItem onClick={() => onMove(item.id, "")} className="text-[12px] focus:bg-ivory/10">Niet-ingedeeld</DropdownMenuItem>
            {folders.length > 0 && <DropdownMenuSeparator className="bg-ivory/10" />}
            {folders.map((f) => (
              <DropdownMenuItem key={f} onClick={() => onMove(item.id, f)} className="text-[12px] focus:bg-ivory/10">{f}</DropdownMenuItem>
            ))}
            {projects.length > 0 && <DropdownMenuSeparator className="bg-ivory/10" />}
            {projects.length > 0 && (
              <p className="px-2 pt-1 pb-0.5 text-[9px] uppercase tracking-[0.18em] text-ivory/40 font-bold">Projecten</p>
            )}
            {projects.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => onMoveToProject(item.id, p)} className="text-[12px] focus:bg-ivory/10 truncate">{p.title}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button onClick={(e) => { e.stopPropagation(); onRename(item); }} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Hernoem">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Verwijder">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}