/**
 * giuliaSkills.ts - Het centrale commando-schema voor GIULIA OS.
 * GIULIA-GIULIA (het brein) leest de schemas om te weten wat ze kan.
 * GIULIA-CORE (de leider) voert de execute() functies blind uit in de database.
 */
import { createTaskWithApproval, navigateApp, reportToSalvo, createApproval, findDuplicate } from "./codeAgent.ts";
import { geminiEmbed } from "./gemini.ts";

export const GIULIA_SKILLS = [
  {
    name: "create_task",
    description: "Maak een nieuwe taak aan. Gebruik dit ALLEEN als Salvo expliciet om een nieuwe actie vraagt. Verzin GEEN taken om projecten 'op te vullen'. Er wordt automatisch op duplicaten gecontroleerd (≥85% titel-gelijkenis) — bij een duplicaat wordt de bestaande taak teruggegeven in plaats van een nieuwe aan te maken.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string" }, deadline: { type: "string", description: "YYYY-MM-DD" }, project_id: { type: "string" }, description: { type: "string" }, assignee: { type: "string", enum: ["salvo", "giulia"] }, domain: { type: "string", enum: ["focus", "life", "self"], description: "FOCUS=werk/zakelijk, LIFE=relaties/sociaal/huishouden/admin/hobby, SELF=rust/zelfzorg/reflectie. Tag automatisch op basis van inhoud." }, category: { type: "string", description: "Sub-categorie voor LIFE, bv. household" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const existing = await sr.entities.Task.filter({ status: { $ne: "archived" } }, "-created_date", 300).catch(() => []);
      const dup = findDuplicate(existing, args.title);
      if (dup) return { id: dup.id, title: dup.title, duplicate: true };
      const t = await createTaskWithApproval(base44, { ...args, source: "GIULIA-CORE", delegated_to_giulia: args.assignee === "giulia" });
      return t ? { id: t.id, title: t.title } : { error: "create failed" };
    }
  },
  {
    name: "update_task",
    description: "Werk een taak bij (status, titel, deadline, priority). Gebruik status='archived' als Salvo vraagt om een taak te VERWIJDEREN (Soft Delete).",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["todo", "in_progress", "waiting", "delegated", "completed", "archived", "overdue", "today", "upcoming"] }, title: { type: "string" }, deadline: { type: "string" }, priority: { type: "string" } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const t = await base44.asServiceRole.entities.Task.update(id, patch).catch(() => null);
      return t ? { ok: true, status: patch.status } : { error: "not found" };
    }
  },
  {
    name: "delete_tasks",
    description: "Verwijder of archiveer meerdere taken tegelijk. Wij doen in GIULIA OS aan 'Soft Deletes': taken worden op status 'archived' gezet zodat we weten dat ze weg zijn en niet per ongeluk opnieuw aangemaakt worden.",
    inputSchema: { type: "object", properties: { status: { type: "string" } }, required: ["status"] },
    execute: async ({ status }, base44) => {
      const list = await base44.asServiceRole.entities.Task.filter({ status }, "-created_date", 500).catch(() => []);
      const ids = list.map((t) => t.id).filter(Boolean);
      for (let i = 0; i < ids.length; i += 100) {
        // SOFT DELETE: we updaten ze naar 'archived' in plaats van hard delete
        await base44.asServiceRole.entities.Task.bulkUpdate(
          ids.slice(i, i + 100).map(id => ({ id, status: "archived" }))
        ).catch(() => {});
      }
      return { archived_count: ids.length };
    }
  },
  {
    name: "create_project",
    description: "Maak een nieuw project aan. Automatische duplicaat-check (≥85% titel-gelijkenis).",
    inputSchema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, category: { type: "string" }, deadline: { type: "string" }, domain: { type: "string", enum: ["focus", "life", "self"], description: "FOCUS=werk, LIFE=levensproject/hobby, SELF=persoonlijke groei" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const existing = await sr.entities.Project.filter({ status: { $ne: "archived" } }, "-created_date", 200).catch(() => []);
      const dup = findDuplicate(existing, args.title);
      if (dup) return { id: dup.id, title: dup.title, duplicate: true };
      const p = await sr.entities.Project.create({ ...args, status: "planning", agent_source: "GIULIA-CORE" }).catch(() => null);
      return p ? { id: p.id, title: p.title } : { error: "create failed" };
    }
  },
  {
    name: "update_project",
    description: "Werk een project bij (status, health, next_milestone, progress).",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" }, health: { type: "string" }, next_milestone: { type: "string" }, progress: { type: "number" }, title: { type: "string" } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const p = await base44.asServiceRole.entities.Project.update(id, patch).catch(() => null);
      return p ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_contact",
    description: "Voeg een nieuw contact toe op basis van communicatie of Salvo's verzoek. Automatische duplicaat-check op naam. Als Salvo dit NIET zelf expliciet heeft gevraagd (bv. herkend uit een email/gesprek), wordt het contact als 'unconfirmed' aangemaakt en volgt een Notification ter bevestiging.",
    inputSchema: { type: "object", properties: { name: { type: "string" }, company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, notes: { type: "string" }, confirmed: { type: "boolean", description: "true als Salvo dit zelf expliciet vroeg" } }, required: ["name"] },
    execute: async ({ confirmed, ...args }, base44) => {
      const sr = base44.asServiceRole;
      const existing = await sr.entities.Contact.list("-created_date", 300).catch(() => []);
      const dup = findDuplicate(existing, args.name, "name");
      if (dup) return { id: dup.id, name: dup.name, duplicate: true };
      const c = await sr.entities.Contact.create({ ...args, status: confirmed ? "confirmed" : "unconfirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (c && !confirmed) {
        await sr.entities.Notification.create({
          title: "Nieuw contact herkend",
          message: `Ik heb "${c.name}" herkend als nieuw contact${args.company ? ` bij ${args.company}` : ""}. Klopt dit?`,
          kind: "question",
          requires_response: true,
          related_route: "/people",
          agent_source: "GIULIA-CORE",
        }).catch(() => null);
      }
      return c ? { id: c.id, name: c.name } : { error: "create failed" };
    }
  },
  {
    name: "update_contact",
    description: "Werk een contact bij — bevestig een unconfirmed contact (status='confirmed'), of update last_contact_date na een interactie.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["confirmed", "unconfirmed"] }, last_contact_date: { type: "string" }, notes: { type: "string" } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const c = await base44.asServiceRole.entities.Contact.update(id, patch).catch(() => null);
      return c ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_note",
    description: "Sla een notitie op voor Salvo.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const n = await base44.asServiceRole.entities.Note.create({ ...args, kind: "note", agent_source: "GIULIA-CORE" }).catch(() => null);
      return n ? { id: n.id } : { error: "create failed" };
    }
  },
  {
    name: "create_memory",
    description: "Sla een blijvende herinnering of contextueel feit op in Giulia's geheugen.",
    inputSchema: { type: "object", properties: { content: { type: "string" }, category: { type: "string" } }, required: ["content"] },
    execute: async (args, base44) => {
      const embedding = await geminiEmbed({ text: args.content, keyName: "GIULIA_GIULIA_MEMORY_GEMINI_API_KEY" }).catch(() => null);
      const m = await base44.asServiceRole.entities.Memory.create({ ...args, ...(embedding ? { embedding } : {}), agent_source: "GIULIA-CORE" }).catch(() => null);
      return m ? { id: m.id } : { error: "create failed" };
    }
  },
  {
    name: "create_approval",
    description: "EXTERNE ACTIES. Maak een Approval aan voor een email, whatsapp of agenda-afspraak die Salvo moet goedkeuren. Stuur NOOIT zelfstandig iets naar buiten. Kies 'category' ZORGVULDIG: 'urgent' = een achtergrondproces loopt vast omdat jij twijfelde (bv. bestand verwijderen/archiveren) en blokkeert ander werk. 'communication' = een voorgesteld email/WhatsApp-antwoord of belafspraak (ook als het over een project gaat). 'projects' = ECHTE projectmanagement-beslissingen, geen communicatie. 'intern' = niet-dringende interne zaken die kunnen wachten. 'proactive' = een suggestie die JIJ zelf initieert zonder dat Salvo erom vroeg — gebruik dit BIJNA NOOIT en nooit twee keer over hetzelfde onderwerp; is iets echt belangrijk, maak er dan een taak + agenda-item van in plaats van te vragen. Zet in 'content' bij email/whatsapp ALTIJD het letterlijke voorgestelde bericht.",
    inputSchema: { type: "object", properties: { type: { type: "string", enum: ["email", "whatsapp", "calendar"] }, category: { type: "string", enum: ["urgent", "communication", "projects", "intern", "proactive"] }, title: { type: "string" }, content: { type: "string" }, context: { type: "string" }, thread_id: { type: "string" }, target: { type: "string" }, project_id: { type: "string" } }, required: ["type", "category", "title", "content"] },
    execute: async ({ type, category, title, content, context, thread_id, target, project_id }, base44) => {
      const a = await createApproval(base44, type, title, content, context || "", "salvo", { category, thread_id, target, project_id });
      return a ? { id: a.id } : { error: "create failed" };
    }
  },
  {
    name: "create_notification",
    description: "UITSLUITEND voor een échte vraag aan Salvo of een opmerking die hij echt moet zien. NOOIT gebruiken voor routinematige status ('systeem opgestart', 'sync gelukt', 'ochtendbriefing gedraaid', 'X mails verwerkt') — dat is ruis en gaat via report_to_salvo naar de Activity-feed, niet hierheen. Alleen aanmaken als het antwoord/aandacht van Salvo zelf vereist (requires_response=true) of echt urgent is (urgent=true). Wordt direct als pushmelding gestuurd — misbruik hiervan overspoelt Salvo.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, message: { type: "string" }, kind: { type: "string", enum: ["question", "remark", "info"] }, requires_response: { type: "boolean" }, urgent: { type: "boolean" }, related_route: { type: "string" } }, required: ["message"] },
    execute: async (args, base44) => {
      const n = await base44.asServiceRole.entities.Notification.create({ ...args, agent_source: "GIULIA-CORE" }).catch(() => null);
      if (n) {
        try { await base44.functions.invoke("sendPushNotifications", { title: args.title || "Giulia", message: args.message }); } catch { /* ignore */ }
      }
      return n ? { id: n.id } : { error: "create failed" };
    }
  },
  {
    name: "report_to_salvo",
    description: "Log een activiteit in de Activity-feed op de achtergrond. Gebruik dit NIET als antwoord in een live chat.",
    inputSchema: { type: "object", properties: { message: { type: "string" } }, required: ["message"] },
    execute: async ({ message }, base44) => {
      const a = await reportToSalvo(base44, "GIULIA-CORE", message);
      return a ? { ok: true } : { error: "failed" };
    }
  },
  {
    name: "navigate",
    description: "Navigeer Salvo's app in real time naar een bepaalde pagina.",
    inputSchema: { type: "object", properties: { route: { type: "string" }, label: { type: "string" } }, required: ["route"] },
    execute: async ({ route, label }, base44) => {
      const n = await navigateApp(base44, route, {}, label, "GIULIA-CORE");
      return n ? { ok: true } : { error: "failed" };
    }
  },
  {
    name: "create_document",
    description: "Sla een document (referentie, contract, notitie) op voor Salvo of als resultaat van een goedgekeurde 'document_create' approval.",
    inputSchema: { type: "object", properties: { name: { type: "string" }, document_type: { type: "string", enum: ["reference", "contract", "invoice", "notes", "other"] }, content: { type: "string" }, project_id: { type: "string" } }, required: ["name"] },
    execute: async (args, base44) => {
      const d = await base44.asServiceRole.entities.Document.create({ ...args, status: "giulia" }).catch(() => null);
      return d ? { id: d.id, name: d.name } : { error: "create failed" };
    }
  },
  {
    name: "create_hobby",
    description: "Maak een hobby of interesse aan in LIFE → HOBBIES. Gebruik dit als Salvo een nieuwe interesse noemt of als jij er één herkent (duplicaat-check ≥85% op titel). Set activity_level: 'new' voor net ontdekt, 'active' als Salvo er nu mee bezig is.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["music", "creative", "cultural", "sport", "learning", "collecting", "other"] }, current_thread: { type: "string" }, image: { type: "string" }, discovered: { type: "boolean", description: "true als Giulia dit zelf herkende (niet expliciet gevraagd)" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const existing = await sr.entities.Hobby.list("-created_date", 300).catch(() => []);
      const dup = findDuplicate(existing, args.title);
      if (dup) return { id: dup.id, title: dup.title, duplicate: true };
      const today = new Date().toISOString().slice(0, 10);
      const h = await sr.entities.Hobby.create({
        title: args.title,
        type: args.type || "creative",
        current_thread: args.current_thread,
        image: args.image,
        activity_level: args.discovered ? "new" : "active",
        discovered_date: args.discovered ? today : undefined,
        status: "active",
        agent_source: "GIULIA-CORE",
      }).catch(() => null);
      return h ? { id: h.id, title: h.title } : { error: "create failed" };
    }
  },
  {
    name: "update_hobby",
    description: "Werk een hobby bij — activity_level (active/reactivating/quiet/new/emerging/archived), current_thread, last_activity_date, of koppel een project. Gebruik 'reactivating' als Salvo zegt iets weer op te pakken; 'quiet' als een hobby lang stil is; 'archived' (status inactive) om uit het actieve veld te halen.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, activity_level: { type: "string", enum: ["active", "reactivating", "quiet", "new", "emerging", "archived"] }, current_thread: { type: "string" }, linked_project_id: { type: "string" }, status: { type: "string", enum: ["active", "inactive"] } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      if (patch.activity_level === "archived") patch.status = "inactive";
      if (patch.status === "active" && !patch.activity_level) patch.activity_level = "active";
      const h = await base44.asServiceRole.entities.Hobby.update(id, patch).catch(() => null);
      return h ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "log_hobby_moment",
    description: "Log een hobby-moment (concert, repetitie, expositie, film, museumsbezoek, creatieve sessie). Updatet last_activity_date + activity_level='active' en maakt een HobbyMoment-record.",
    inputSchema: { type: "object", properties: { hobby_id: { type: "string" }, title: { type: "string" }, activity: { type: "string", enum: ["concert", "exhibition", "rehearsal", "film", "museum", "creative_session", "performance", "other"] }, date: { type: "string", description: "ISO datetime" }, location: { type: "string" }, people: { type: "string" } }, required: ["hobby_id", "title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const m = await sr.entities.HobbyMoment.create({ ...args, date: args.date || new Date().toISOString(), agent_source: "GIULIA-CORE" }).catch(() => null);
      if (m) await sr.entities.Hobby.update(args.hobby_id, { last_activity_date: args.date || new Date().toISOString(), activity_level: "active" }).catch(() => null);
      return m ? { id: m.id } : { error: "create failed" };
    }
  }
];