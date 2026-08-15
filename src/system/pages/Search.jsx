import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import Avatar from "@/system/components/glass/Avatar";
import PageHero from "@/system/components/glass/PageHero";
import {
  mockProjects, mockTasks, mockEmails, mockContacts,
  mockEvents, mockKnowledge, mockDocuments,
} from "@/lib/mockData";
import {
  Search as SearchIcon, Briefcase, CheckSquare, Mail, Users, Calendar,
  BookOpen, FileText, MessageSquare, X,
} from "lucide-react";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get("q") || "");

  const results = React.useMemo(() => {
    if (!query.trim()) return { projects: [], tasks: [], emails: [], contacts: [], events: [], knowledge: [], documents: [] };
    const q = query.toLowerCase();
    return {
      projects: mockProjects.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
      tasks: mockTasks.filter((t) => t.title.toLowerCase().includes(q)),
      emails: mockEmails.filter((m) => m.subject.toLowerCase().includes(q) || m.body.toLowerCase().includes(q)),
      contacts: mockContacts.filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)),
      events: mockEvents.filter((e) => e.title.toLowerCase().includes(q)),
      knowledge: mockKnowledge.filter((k) => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q)),
      documents: mockDocuments.filter((d) => d.name.toLowerCase().includes(q)),
    };
  }, [query]);

  const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  const hasResults = totalCount > 0;

  const sections = [
    { key: "projects", label: "Projects", icon: Briefcase, items: results.projects, path: (item) => `/projects/${item.id}`, title: (item) => item.title, sub: (item) => item.category },
    { key: "tasks", label: "Tasks", icon: CheckSquare, items: results.tasks, path: () => "/tasks", title: (item) => item.title, sub: () => "Task" },
    { key: "emails", label: "Emails", icon: Mail, items: results.emails, path: () => "/email", title: (item) => item.subject, sub: (item) => item.sender },
    { key: "contacts", label: "People", icon: Users, items: results.contacts, path: (item) => `/people/${item.id}`, title: (item) => item.name, sub: (item) => item.company, avatar: (item) => item.avatar },
    { key: "events", label: "Calendar", icon: Calendar, items: results.events, path: () => "/agenda", title: (item) => item.title, sub: (item) => new Date(item.start).toLocaleString("nl-NL") },
    { key: "knowledge", label: "Knowledge", icon: BookOpen, items: results.knowledge, path: () => "/knowledge", title: (item) => item.title, sub: (item) => item.category },
    { key: "documents", label: "Documents", icon: FileText, items: results.documents, path: () => "/documents", title: (item) => item.name, sub: (item) => item.type },
  ];

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
      <PageHero
        page="search"
        icon={SearchIcon}
        eyebrow="Systeem"
        title="Zoeken"
        subtitle="Doorzoek het hele ecosysteem"
      />

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek in alles..."
          className="w-full glass-2 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:border-olive/30"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-foreground/5 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query && !hasResults && (
        <GlassPanel level={2} className="p-12 text-center">
          <SearchIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Geen resultaten voor "{query}"</p>
        </GlassPanel>
      )}

      {hasResults && (
        <div className="space-y-4">
          {sections.filter((s) => s.items.length > 0).map((section) => (
            <div key={section.key}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <section.icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground">{section.label}</h2>
                <span className="text-xs text-muted-foreground">({section.items.length})</span>
              </div>
              <GlassPanel level={2} className="divide-y divide-border/30">
                {section.items.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(section.path(item))}
                    className="w-full flex items-center gap-3 p-3 hover:bg-foreground/[0.02] transition-colors text-left first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    {section.avatar && <Avatar src={section.avatar(item)} name={section.title(item)} size="sm" />}
                    {!section.avatar && <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{section.title(item)}</p>
                      <p className="text-xs text-muted-foreground truncate">{section.sub(item)}</p>
                    </div>
                  </button>
                ))}
              </GlassPanel>
            </div>
          ))}
        </div>
      )}

      {!query && (
        <GlassPanel level={2} className="p-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Begin met typen om te zoeken door je hele ecosysteem</p>
          <p className="text-xs text-muted-foreground mt-2">Projecten, taken, emails, contacten, agenda, kennis en documenten</p>
        </GlassPanel>
      )}
    </div>
  );
}