// Shared project reconstruction logic — used by both reconstructProject
// (backend function) and approveIngestion (post-execution), so we avoid an
// HTTP round-trip / circular-Response issue from functions.invoke.

export async function reconstructProject(sr, projectId) {
  const [project, tasks, themes, milestones, decisions, documents, contacts] = await Promise.all([
    sr.entities.Project.get(projectId).catch(() => null),
    sr.entities.Task.filter({ project_id: projectId }, "-created_date", 500).catch(() => []),
    sr.entities.ProjectTheme.filter({ project_id: projectId }, "order", 200).catch(() => []),
    sr.entities.Milestone.filter({ project_id: projectId }, "date", 100).catch(() => []),
    sr.entities.Decision.filter({ project_id: projectId }, "-date", 100).catch(() => []),
    sr.entities.Document.filter({ project_id: projectId }, "-created_date", 100).catch(() => []),
    sr.entities.Contact.list("-created_date", 200).catch(() => []),
  ]);

  if (!project) return null;

  const allTasks = tasks || [];
  const allThemes = themes || [];
  const done = allTasks.filter(isTaskDone);
  const active = allTasks.filter((t) => ["in_progress", "today", "actief"].includes(t.status));
  const waiting = allTasks.filter((t) => ["waiting", "wacht", "delegated"].includes(t.status));
  const overdue = allTasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && !isTaskDone(t));

  let progress;
  if (allThemes.length) {
    const themeProgress = allThemes.map((th) => {
      const tt = allTasks.filter((t) => t.theme_id === th.id);
      const d = tt.filter(isTaskDone).length;
      return tt.length ? d / tt.length : (th.status === "done" ? 1 : 0);
    });
    progress = Math.round((themeProgress.reduce((a, b) => a + b, 0) / allThemes.length) * 100);
  } else {
    progress = allTasks.length ? Math.round((done.length / allTasks.length) * 100) : (project.progress || 0);
  }

  const signals = {
    hasObjectives: !!(project.description && project.description.length > 20),
    hasThemes: allThemes.length > 0,
    hasNextActions: allTasks.filter((t) => ["todo", "today", "in_progress"].includes(t.status)).length > 0,
    hasMilestones: (milestones || []).length > 0,
    hasPeople: (contacts || []).some((c) => (c.project_ids || []).includes(projectId)),
    hasDocuments: (documents || []).length > 0,
    hasDecisions: (decisions || []).length > 0,
    hasDeadline: !!project.deadline,
  };
  const score = Object.values(signals).filter(Boolean).length;
  const completeness = score >= 7 ? "rich" : score >= 5 ? "solid" : score >= 3 ? "basic" : "sparse";

  let health = "good";
  if (overdue.length >= 3 || allThemes.some((t) => t.status === "blocked")) health = "critical";
  else if (overdue.length || waiting.length >= 3 || active.length === 0) health = "attention";

  const nextSteps = [];
  if (overdue.length) nextSteps.push(`${overdue.length} taak${overdue.length === 1 ? "" : "en"} over tijd — herplan of verleng`);
  if (waiting.length >= 3) nextSteps.push(`${waiting.length} wachtende taken — geef vervolg`);
  if (allThemes.length && allTasks.length && active.length === 0) nextSteps.push("Geen actieve taken — definieer volgende actie per theme");
  if (!signals.hasPeople) nextSteps.push("Koppel betrokken personen aan het project");
  if (!signals.hasMilestones) nextSteps.push("Definieer milestones om het project te faseren");
  if (!signals.hasDeadline) nextSteps.push("Stel een projectdeadline in");
  if (nextSteps.length === 0) nextSteps.push("Project is in balans — blijf de actieve taken oppakken");

  const summaryParts = [];
  summaryParts.push(`${allTasks.length} taken (${done.length} klaar, ${active.length} actief, ${waiting.length} wachtend), ${allThemes.length} themes, ${(milestones || []).length} milestones, ${(decisions || []).length} decisions.`);
  summaryParts.push(`Voortgang ${progress}%, compleetheid ${completeness}, gezondheid ${health}.`);
  if (overdue.length) summaryParts.push(`${overdue.length} over tijd.`);

  return {
    completeness,
    summary: summaryParts.join(" "),
    next_steps: nextSteps,
    health,
    computed_at: new Date().toISOString(),
    stats: { tasks: allTasks.length, themes: allThemes.length, milestones: (milestones || []).length, decisions: (decisions || []).length, documents: (documents || []).length, progress }
  };
}

function isTaskDone(t) {
  return t.status === "klaar" || t.status === "done" || t.status === "completed" || t.status === "archived";
}