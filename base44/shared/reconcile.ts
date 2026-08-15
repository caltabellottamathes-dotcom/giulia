/**
 * reconcile.ts — Reconciliation-engine van GIULIA OS.
 *
 * Periodeke controle: zijn objecten nog consistent? Zijn er duplicaten?
 * Zijn er verweesde relaties? Verouderde states? Reconciliation corrigeert
 * niets blind — het signaleert, zodat GIULIA-GIULIA kan beslissen.
 *
 * Aanroepbaar vanuit een workflow (scheduled) of een agent. Gebruikt
 * findDuplicate (≥85% titel-gelijkenis) uit codeAgent.
 */
import { findDuplicate } from "./codeAgent.ts";

function findDuplicatesInList(list, field) {
  const dups = [];
  for (let i = 0; i < list.length; i++) {
    const rest = list.filter((_, j) => j !== i);
    const m = findDuplicate(rest, list[i][field], field);
    if (m && !dups.find((d) => d.id === list[i].id)) dups.push(list[i]);
  }
  return dups;
}

export async function runReconcile(base44) {
  const sr = base44.asServiceRole;
  const [tasks, projects, contacts] = await Promise.all([
    sr.entities.Task.filter({ status: { $ne: "archived" } }, "-created_date", 400).catch(() => []),
    sr.entities.Project.filter({ status: { $ne: "archived" } }, "-created_date", 200).catch(() => []),
    sr.entities.Contact.list("-created_date", 300).catch(() => []),
  ]);

  const dupTasks = findDuplicatesInList(tasks, "title");
  const dupProjects = findDuplicatesInList(projects, "title");
  const dupContacts = findDuplicatesInList(contacts, "name");

  // Verouderde taken: in_progress zonder update in 14 dagen
  const cutoff = Date.now() - 14 * 86400000;
  const staleTasks = tasks.filter(
    (t) => t.status === "in_progress" && new Date(t.updated_date || t.created_date).getTime() < cutoff
  );

  // Verweesde relaties: taken met project_id naar niet-bestaand project
  const projectIds = new Set(projects.map((p) => p.id));
  const brokenTaskLinks = tasks.filter((t) => t.project_id && !projectIds.has(t.project_id));

  return {
    duplicates: {
      tasks: dupTasks.length,
      projects: dupProjects.length,
      contacts: dupContacts.length,
      items: [...dupTasks, ...dupProjects, ...dupContacts].map((d) => ({ id: d.id, title: d.title || d.name })),
    },
    stale_tasks: staleTasks.length,
    broken_links: brokenTaskLinks.length,
    scanned: { tasks: tasks.length, projects: projects.length, contacts: contacts.length },
  };
}