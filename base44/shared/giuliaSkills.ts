/**
 * giuliaSkills.ts - Het centrale commando-schema voor GIULIA OS.
 * GIULIA-GIULIA (het brein) leest de schemas om te weten wat ze kan.
 * GIULIA-CORE (de leider) voert de execute() functies blind uit in de database.
 */
import { createTaskWithApproval, navigateApp, reportToSalvo, createApproval, findDuplicate } from "./codeAgent.ts";
import { geminiEmbed } from "./gemini.ts";
import { logActivity, remember, askQuestion } from "./learningLayer.ts";
import { emitEvent } from "./eventEngine.ts";

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
      const m = await remember(base44, { content: args.content, category: args.category, source: "GIULIA-CORE" });
      await logActivity(base44, "GIULIA-CORE", `Geheugen opgeslagen: ${String(args.content).slice(0, 80)}`, { action: "remember" });
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
      const a = await logActivity(base44, "GIULIA-CORE", message, { action: "report" });
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
  },
  {
    name: "create_giulia_question",
    description: "Voeg een vraag toe aan je 'WANTS TO KNOW'-laag — een ontbrekend stuk context dat je later aan Salvo wilt voorleggen. Gebruik dit als je in een gesprek een gat opmerkt dat niet NU hoeft, of als opvolgvraag na een antwoord.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, body: { type: "string" }, kind: { type: "string", enum: ["quick_drop", "fill_the_gap", "connect_the_dots", "memory_check", "life_check", "self_discovery"] }, domain: { type: "string", enum: ["life", "self", "projects", "time", "admin", "people", "communication"] }, priority: { type: "string", enum: ["now", "soon", "useful", "curious"] }, options: { type: "array", items: { type: "string" } }, target_type: { type: "string" }, target_ref: { type: "string" } }, required: ["title", "body"] },
    execute: async (args, base44) => {
      const q = await askQuestion(base44, { ...args, source: "GIULIA-GIULIA" });
      await logActivity(base44, "GIULIA-GIULIA", `Nieuw mysterie: ${String(args.title).slice(0, 80)}`, { action: "ask" });
      return q ? { id: q.id } : { error: "create failed" };
    }
  },
  {
    name: "close_giulia_question",
    description: "Sluit een 'WANTS TO KNOW'-vraag af (status answered/skipped/archived) nadat Salvo heeft geantwoord of de vraag niet meer relevant is.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["answered", "skipped", "archived"] }, answer: { type: "string" } }, required: ["id", "status"] },
    execute: async ({ id, status, answer }, base44) => {
      const q = await base44.asServiceRole.entities.GiuliaQuestion.update(id, { status, answer: answer || "" }).catch(() => null);
      return q ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "list_open_questions",
    description: "Lijst van openstaande 'WANTS TO KNOW'-vragen — ontbrekende context die je aan Salvo wilt voorleggen.",
    inputSchema: { type: "object", properties: {} },
    execute: async (_args, base44) => {
      const list = await base44.asServiceRole.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 20).catch(() => []);
      return { count: list.length, items: list.map(q => ({ id: q.id, title: q.title, domain: q.domain, priority: q.priority })) };
    }
  },
  {
    name: "find_objects",
    description: "Zoek objecten op titel/naam. Geef type (CalendarEvent, Task, Project, Contact, HouseholdItem, AdminObligation, SocialPlan, Hobby) en een query (deel van de titel). Retourneert id + titel. GEBRUIK DIT ALTIJD voordat je een update_*/complete_* met een id uitvoert dat je niet kent — raad NOOIT een id.",
    inputSchema: { type: "object", properties: { type: { type: "string", enum: ["CalendarEvent", "Task", "Project", "Contact", "HouseholdItem", "AdminObligation", "SocialPlan", "Hobby"] }, query: { type: "string" } }, required: ["type", "query"] },
    execute: async ({ type, query }, base44) => {
      const sr = base44.asServiceRole;
      const q = String(query || "").toLowerCase();
      const list = await sr.entities[type].filter({}, "-created_date", 200).catch(() => []);
      const matches = list.filter((x) => String(x.title || x.name || x.activity || "").toLowerCase().includes(q)).slice(0, 10);
      return { count: matches.length, items: matches.map((m) => ({ id: m.id, title: m.title || m.name || m.activity })) };
    }
  },
  {
    name: "create_event",
    description: "Maak een agenda-afspraak (CalendarEvent). Gebruik voor álle afspraken — werk, sociaal, huishouden, SELF. Tag domain automatisch: FOCUS=werk/zakelijk, LIFE=sociaal/huishouden, SELF=rust/zelfzorg. Geef start (en liefst end) als ISO datetime. Koppel optioneel een project_id of participants.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, start: { type: "string", description: "ISO datetime, bv. 2026-08-17T19:00:00" }, end: { type: "string", description: "ISO datetime" }, location: { type: "string" }, participants: { type: "string" }, project_id: { type: "string" }, domain: { type: "string", enum: ["focus", "life", "self"] }, travel_time: { type: "number" }, prep_time: { type: "number" } }, required: ["title", "start"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const e = await sr.entities.CalendarEvent.create({ ...args, status: "confirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (e) await emitEvent(base44, { event_type: "EVENT_CREATED", object_type: "CalendarEvent", object_id: e.id, domain: args.domain || "focus", description: `Afspraak: ${e.title}` });
      return e ? { id: e.id, title: e.title } : { error: "create failed" };
    }
  },
  {
    name: "create_social_plan",
    description: "Maak een sociaal plan (LIFE → Social Planner) — een voorgenomen sociale activiteit met één of meerdere contacten. Set contact_ids (array van Contact-ID's), activity en liefst suggested_date. Wordt gekoppeld aan een agenda-afspraak zodra bevestigd (status confirmed).",
    inputSchema: { type: "object", properties: { activity: { type: "string" }, contact_ids: { type: "array", items: { type: "string" } }, suggested_date: { type: "string", description: "ISO datetime" }, notes: { type: "string" }, calendar_event_id: { type: "string" } }, required: ["activity"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const sp = await sr.entities.SocialPlan.create({ ...args, status: "planned", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (sp) await emitEvent(base44, { event_type: "SOCIAL_PLAN_CREATED", object_type: "SocialPlan", object_id: sp.id, domain: "life", description: `Sociaal plan: ${sp.activity}` });
      return sp ? { id: sp.id } : { error: "create failed" };
    }
  },
  {
    name: "create_social_appointment",
    description: "UNIFIED LIFE-afspraak. Gebruik dit als Salvo een sociale of private afspraak noemt ('morgen naar Oma', 'zaterdag diner met Eva', 'donderdag koffie met Sven'). Dit maakt in ÉÉN actie: (1) een agenda-afspraak CalendarEvent(domain='life', status='confirmed'), (2) een gekoppeld SocialPlan met calendar_event_id + contact_ids, (3) resolveert de contactnaam naar een bestaand Contact of maakt er één aan (unconfirmed) als deze ontbreekt. Hierdoor verschijnt de afspraak AUTOMATISCH in de agenda, in LIFE Social Planner + Social Pulse, én in de dagplanning (dailyPlanning haalt alle events van de dag). Geef activity (bv. 'Bezoek Oma'), contact_name, start (ISO datetime), en optioneel end/location. NIET gebruiken voor zakelijke werk-afspraken — gebruik dan create_event met domain='focus'.",
    inputSchema: { type: "object", properties: { activity: { type: "string", description: "Wat je gaat doen, bv. 'Bezoek Oma', 'Diner met Eva'" }, contact_name: { type: "string", description: "Naam van de persoon (wordt gematcht op bestaand contact, anders aangemaakt als unconfirmed)" }, start: { type: "string", description: "ISO datetime, bv. 2026-08-16T15:00:00" }, end: { type: "string", description: "ISO datetime" }, location: { type: "string" }, notes: { type: "string" } }, required: ["activity", "contact_name", "start"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      // 1. Resolve contact by name (case-insensitive), else create unconfirmed
      const all = await sr.entities.Contact.list("-created_date", 300).catch(() => []);
      const q = String(args.contact_name || "").toLowerCase().trim();
      let contact = (all || []).find((c) => (c.name || "").toLowerCase().trim() === q);
      let contactCreated = false;
      if (!contact) {
        contact = await sr.entities.Contact.create({ name: args.contact_name, status: "unconfirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
        contactCreated = !!contact;
      }
      const contactIds = contact ? [contact.id] : [];
      const participants = contact ? contact.name : args.contact_name;
      const title = args.activity || `Afspraak met ${participants}`;
      // 2. CalendarEvent (domain='life', confirmed — Salvo stated it as fact)
      const ev = await sr.entities.CalendarEvent.create({ title, start: args.start, end: args.end, location: args.location, participants, domain: "life", status: "confirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (!ev) return { error: "event create failed" };
      // 3. Linked SocialPlan (confirmed, gekoppeld aan agenda)
      const sp = await sr.entities.SocialPlan.create({ contact_ids: contactIds, activity: title, calendar_event_id: ev.id, suggested_date: args.start, notes: args.notes, status: "confirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
      // 4. Events via unified pipeline (propagate bevestigt gelinkte agenda al — idempotent)
      await emitEvent(base44, { event_type: "EVENT_CREATED", object_type: "CalendarEvent", object_id: ev.id, domain: "life", description: `Afspraak: ${title}` });
      if (sp) await emitEvent(base44, { event_type: "SOCIAL_PLAN_CONFIRMED", object_type: "SocialPlan", object_id: sp.id, domain: "life", description: `Sociaal plan bevestigd: ${title}` });
      return { event_id: ev.id, social_plan_id: sp?.id || null, contact_id: contact?.id || null, contact_created: contactCreated };
    }
  },
  {
    name: "create_household_task",
    description: "Maak een huishoudtaak (LIFE → Household). Gebruik voor routines, onderhoud en issues. Wordt opgeslagen als HouseholdItem. Set kind: routine/maintenance/issue. Set next_due (YYYY-MM-DD) en frequency_days voor herhalende taken.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, kind: { type: "string", enum: ["routine", "maintenance", "issue", "item"] }, category: { type: "string" }, next_due: { type: "string", description: "YYYY-MM-DD" }, frequency_days: { type: "number" }, location: { type: "string" }, notes: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const h = await sr.entities.HouseholdItem.create({ ...args, status: "needs_attention", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (h) await emitEvent(base44, { event_type: "HOUSEHOLD_ITEM_CREATED", object_type: "HouseholdItem", object_id: h.id, domain: "life", description: `Huishoudtaak: ${h.title}` });
      return h ? { id: h.id } : { error: "create failed" };
    }
  },
  {
    name: "create_shopping_item",
    description: "Voeg een boodschap toe aan de huishoudlijst (LIFE → Household, kind=shopping).",
    inputSchema: { type: "object", properties: { title: { type: "string" }, category: { type: "string" }, notes: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const s = await sr.entities.HouseholdItem.create({ ...args, kind: "shopping", status: "needs_attention", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (s) await emitEvent(base44, { event_type: "SHOPPING_ITEM_CREATED", object_type: "HouseholdItem", object_id: s.id, domain: "life", description: `Boodschap: ${s.title}` });
      return s ? { id: s.id } : { error: "create failed" };
    }
  },
  {
    name: "update_event",
    description: "Werk een agenda-afspraak bij (tijd, locatie, status). Set status='cancelled' om af te zeggen — dat annuleert AUTOMATISCH gekoppelde sociale plannen via de propagation-engine.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, start: { type: "string", description: "ISO datetime" }, end: { type: "string", description: "ISO datetime" }, location: { type: "string" }, status: { type: "string", enum: ["confirmed", "tentative", "cancelled"] } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const sr = base44.asServiceRole;
      const e = await sr.entities.CalendarEvent.update(id, patch).catch(() => null);
      if (e) {
        const et = patch.status === "cancelled" ? "EVENT_CANCELLED" : "EVENT_UPDATED";
        await emitEvent(base44, { event_type: et, object_type: "CalendarEvent", object_id: id, domain: e.domain || "focus", description: `${et === "EVENT_CANCELLED" ? "Afspraak geannuleerd" : "Afspraak bijgewerkt"}: ${e.title}` });
      }
      return e ? { id: e.id } : { error: "not found" };
    }
  },
  {
    name: "complete_task",
    description: "Markeer een taak als voltooid (status=completed). Deblokkeert AUTOMATISCH afhankelijke kind-taken die op deze wachtten (parent_task_id, status waiting/delegated) via de propagation-engine.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: async ({ id }, base44) => {
      const sr = base44.asServiceRole;
      const t = await sr.entities.Task.update(id, { status: "completed" }).catch(() => null);
      if (t) await emitEvent(base44, { event_type: "TASK_COMPLETED", object_type: "Task", object_id: id, domain: t.domain || "focus", description: `Voltooid: ${t.title}` });
      return t ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_admin_obligation",
    description: "Maak een persoonlijke administratie-verplichting aan (LIFE → Personal Admin): betaling, verzekering, contract, vernieuwing of abonnement. Set due_date (YYYY-MM-DD), amount, recurrence.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["payment", "insurance", "contract", "renewal", "subscription"] }, due_date: { type: "string", description: "YYYY-MM-DD" }, amount: { type: "number" }, recurrence: { type: "string", enum: ["none", "monthly", "quarterly", "annual"] }, notes: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const o = await sr.entities.AdminObligation.create({ ...args, status: "open", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (o) await emitEvent(base44, { event_type: "ADMIN_OBLIGATION_CREATED", object_type: "AdminObligation", object_id: o.id, domain: "life", description: `Admin: ${o.title}` });
      return o ? { id: o.id } : { error: "create failed" };
    }
  },
  {
    name: "create_self_routine",
    description: "Maak een SELF-routine aan (persoonlijke gewoonte/zelfzorg) in de SelfRoutine-entity. Set frequency (daily/weekly/monthly/custom), preferred_time (morning/afternoon/evening/night), duration_min en frequency_days.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, frequency: { type: "string", enum: ["daily", "weekly", "monthly", "custom"], default: "daily" }, preferred_time: { type: "string", enum: ["morning", "afternoon", "evening", "night"] }, duration_min: { type: "number" }, frequency_days: { type: "number" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const next = new Date(); next.setDate(next.getDate() + (args.frequency_days || 1));
      const r = await sr.entities.SelfRoutine.create({ ...args, status: "active", next_due: next.toISOString().slice(0, 10), streak_count: 0, agent_source: "GIULIA-CORE" }).catch(() => null);
      if (r) await emitEvent(base44, { event_type: "SELF_ROUTINE_CREATED", object_type: "SelfRoutine", object_id: r.id, domain: "self", description: `SELF-routine: ${r.title}` });
      return r ? { id: r.id, title: r.title } : { error: "create failed" };
    }
  },
  {
    name: "complete_self_routine",
    description: "Markeer een SELF-routine als voltooid. Verhoogt automatisch de streak_count.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    execute: async ({ id }, base44) => {
      const sr = base44.asServiceRole;
      const r = await sr.entities.SelfRoutine.get(id).catch(() => null);
      if (!r) return { error: "not found" };
      const updated = await sr.entities.SelfRoutine.update(id, { status: "completed", last_done: new Date().toISOString(), streak_count: (r.streak_count || 0) + 1 }).catch(() => null);
      if (updated) await emitEvent(base44, { event_type: "SELF_ROUTINE_COMPLETED", object_type: "SelfRoutine", object_id: id, domain: "self", description: `Voltooid: ${r.title}` });
      return updated ? { ok: true, streak: (r.streak_count || 0) + 1 } : { error: "update failed" };
    }
  },
  {
    name: "update_self_routine",
    description: "Werk een SELF-routine bij (status, frequency, tijd, duur). Set status='paused' of 'archived' om te deactiveren.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["active", "paused", "completed", "skipped", "archived"] }, frequency: { type: "string" }, preferred_time: { type: "string" }, duration_min: { type: "number" } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const r = await base44.asServiceRole.entities.SelfRoutine.update(id, patch).catch(() => null);
      return r ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_self_check_in",
    description: "Maak een SELF check-in aan — de actuele persoonlijke toestand (state, energy, capacity, mood, needs, reflection). Giulia kan dit ook proactief doen (~3x per dag) om Salvo's staat te meten.",
    inputSchema: { type: "object", properties: { state: { type: "string", enum: ["calm", "charged", "neutral", "low", "overwhelmed"] }, energy: { type: "number", description: "0-100" }, capacity: { type: "number", description: "0-100" }, mood: { type: "string", enum: ["good", "neutral", "low", "anxious", "tired", "energetic"] }, needs: { type: "array", items: { type: "string" } }, reflection: { type: "string" }, context: { type: "string" }, source: { type: "string", enum: ["manual", "giulia", "proactive"], default: "giulia" } }, required: ["state"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const c = await sr.entities.SelfCheckIn.create({ ...args, timestamp: new Date().toISOString(), check_in_type: args.source === "proactive" ? "proactive" : "manual", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (c) await emitEvent(base44, { event_type: "SELF_CHECK_IN_CREATED", object_type: "SelfCheckIn", object_id: c.id, domain: "self", description: `Check-in: ${args.state}` });
      return c ? { id: c.id } : { error: "create failed" };
    }
  },
  {
    name: "create_therapy_trajectory",
    description: "Maak een therapie- of begeleidingstraject aan (SELF → Therapy). Set type (therapy/coaching/counseling/support), therapist_name.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["therapy", "coaching", "counseling", "support", "other"] }, therapist_name: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const t = await sr.entities.TherapyTrajectory.create({ ...args, status: "active", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (t) await emitEvent(base44, { event_type: "THERAPY_TRAJECTORY_CREATED", object_type: "TherapyTrajectory", object_id: t.id, domain: "self", description: `Therapy: ${t.title}` });
      return t ? { id: t.id } : { error: "create failed" };
    }
  },
  {
    name: "update_therapy_trajectory",
    description: "Werk een therapie-traject bij (status, progress, goals, notes, next_appointment).",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["active", "paused", "completed", "archived"] }, progress: { type: "number" }, next_appointment: { type: "string", description: "ISO datetime" } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const t = await base44.asServiceRole.entities.TherapyTrajectory.update(id, patch).catch(() => null);
      return t ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_journal_entry",
    description: "Maak een journal-entry aan (SELF → Journal). Type: entry/moment/reflection/highlight/thread. Wordt automatisch gedateerd op nu.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["entry", "moment", "reflection", "highlight", "thread"] }, content: { type: "string" }, mood: { type: "string" }, is_highlight: { type: "boolean" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const e = await sr.entities.JournalEntry.create({ ...args, date: new Date().toISOString(), is_highlight: args.is_highlight || args.type === "highlight", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (e) await emitEvent(base44, { event_type: "JOURNAL_ENTRY_CREATED", object_type: "JournalEntry", object_id: e.id, domain: "self", description: `Journal: ${e.title}` });
      return e ? { id: e.id } : { error: "create failed" };
    }
  },
  {
    name: "create_self_goal",
    description: "Maak een persoonlijk doel aan (SELF → Personal Development). Type: development/goal/milestone/learning. Set area, priority, deadline.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["development", "goal", "milestone", "learning", "activity"] }, area: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, deadline: { type: "string", description: "YYYY-MM-DD" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const g = await sr.entities.SelfGoal.create({ ...args, status: "active", progress: 0, agent_source: "GIULIA-CORE" }).catch(() => null);
      if (g) await emitEvent(base44, { event_type: "SELF_GOAL_CREATED", object_type: "SelfGoal", object_id: g.id, domain: "self", description: `Doel: ${g.title}` });
      return g ? { id: g.id } : { error: "create failed" };
    }
  },
  {
    name: "update_self_goal",
    description: "Werk een persoonlijk doel bij (progress, status, priority). Set status='completed' om af te ronden.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, progress: { type: "number" }, status: { type: "string", enum: ["active", "paused", "completed", "archived", "cancelled"] } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      const g = await base44.asServiceRole.entities.SelfGoal.update(id, patch).catch(() => null);
      return g ? { ok: true } : { error: "not found" };
    }
  },
  {
    name: "create_personal_time",
    description: "Plan persoonlijke tijd in (SELF → Personal Time). Type: rest/recovery/free/protected. Set duration_min. Protected tijd wordt beschermd tegen andere afspraken.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["rest", "recovery", "free", "protected"] }, duration_min: { type: "number" }, is_protected: { type: "boolean" } }, required: ["title", "type"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const start = new Date().toISOString();
      const end = new Date(Date.now() + (args.duration_min || 30) * 60000).toISOString();
      const b = await sr.entities.PersonalTimeBlock.create({ ...args, start, end, duration_min: args.duration_min || 30, status: "scheduled", is_protected: args.is_protected || args.type === "protected", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (b) await emitEvent(base44, { event_type: "PERSONAL_TIME_CREATED", object_type: "PersonalTimeBlock", object_id: b.id, domain: "self", description: `Personal time: ${b.title}` });
      return b ? { id: b.id } : { error: "create failed" };
    }
  },
  {
    name: "create_self_insight",
    description: "Maak een SELF-inzicht aan (patroon/balans/capaciteit/gedrag). Giulia gebruikt dit om langetermijnpatronen op te slaan die ze ontdekt.",
    inputSchema: { type: "object", properties: { title: { type: "string" }, type: { type: "string", enum: ["pattern", "balance", "capacity", "imbalance", "overload", "under_recovery", "behavior"] }, description: { type: "string" }, category: { type: "string", enum: ["energy", "mood", "capacity", "routine", "rest", "personal_time", "social", "focus", "development"] } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const i = await sr.entities.SelfInsight.create({ ...args, status: "active", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (i) await emitEvent(base44, { event_type: "SELF_INSIGHT_CREATED", object_type: "SelfInsight", object_id: i.id, domain: "self", description: `Inzicht: ${i.title}` });
      return i ? { id: i.id } : { error: "create failed" };
    }
  },
  {
    name: "add_therapy_note",
    description: "Voeg een notitie toe aan een therapie-/begeleidingstraject (SELF → Therapy). Wordt opgeslagen in de notes-array van het traject.",
    inputSchema: { type: "object", properties: { trajectory_id: { type: "string" }, note: { type: "string" } }, required: ["trajectory_id", "note"] },
    execute: async ({ trajectory_id, note }, base44) => {
      const sr = base44.asServiceRole;
      const t = await sr.entities.TherapyTrajectory.get(trajectory_id).catch(() => null);
      if (!t) return { error: "trajectory not found" };
      const notes = [...(t.notes || []), note];
      const updated = await sr.entities.TherapyTrajectory.update(trajectory_id, { notes, agent_source: "GIULIA-CORE" }).catch(() => null);
      return updated ? { ok: true, notes_count: notes.length } : { error: "update failed" };
    }
  },
  {
    name: "add_therapy_goal",
    description: "Voeg een doel toe aan een therapie-traject (SELF → Therapy → Goals). Wordt opgeslagen in de goals-array van het traject.",
    inputSchema: { type: "object", properties: { trajectory_id: { type: "string" }, goal: { type: "string" } }, required: ["trajectory_id", "goal"] },
    execute: async ({ trajectory_id, goal }, base44) => {
      const sr = base44.asServiceRole;
      const t = await sr.entities.TherapyTrajectory.get(trajectory_id).catch(() => null);
      if (!t) return { error: "trajectory not found" };
      const goals = [...(t.goals || []), goal];
      const updated = await sr.entities.TherapyTrajectory.update(trajectory_id, { goals, agent_source: "GIULIA-CORE" }).catch(() => null);
      return updated ? { ok: true, goals_count: goals.length } : { error: "update failed" };
    }
  },
  {
    name: "add_therapy_person",
    description: "Koppel een contact (Contact-ID) aan een therapie-traject (SELF → Therapy → People). Voegt toe aan de contact_ids-array.",
    inputSchema: { type: "object", properties: { trajectory_id: { type: "string" }, contact_id: { type: "string" } }, required: ["trajectory_id", "contact_id"] },
    execute: async ({ trajectory_id, contact_id }, base44) => {
      const sr = base44.asServiceRole;
      const t = await sr.entities.TherapyTrajectory.get(trajectory_id).catch(() => null);
      if (!t) return { error: "trajectory not found" };
      const contact_ids = [...(t.contact_ids || []), contact_id];
      const updated = await sr.entities.TherapyTrajectory.update(trajectory_id, { contact_ids, agent_source: "GIULIA-CORE" }).catch(() => null);
      return updated ? { ok: true, people_count: contact_ids.length } : { error: "update failed" };
    }
  },
  {
    name: "create_therapy_appointment",
    description: "Maak een therapie-/begeleidingsafspraak (CalendarEvent, domain='self') en koppel deze aan een traject door next_appointment te zetten.",
    inputSchema: { type: "object", properties: { trajectory_id: { type: "string" }, title: { type: "string" }, start: { type: "string", description: "ISO datetime" }, end: { type: "string", description: "ISO datetime" }, location: { type: "string" } }, required: ["trajectory_id", "title", "start"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const e = await sr.entities.CalendarEvent.create({ title: args.title, start: args.start, end: args.end, location: args.location, domain: "self", status: "confirmed", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (!e) return { error: "event create failed" };
      await sr.entities.TherapyTrajectory.update(args.trajectory_id, { next_appointment: args.start, agent_source: "GIULIA-CORE" }).catch(() => null);
      await emitEvent(base44, { event_type: "EVENT_CREATED", object_type: "CalendarEvent", object_id: e.id, domain: "self", description: `Therapie-afspraak: ${e.title}` });
      return { id: e.id, title: e.title };
    }
  },
  {
    name: "link_event_to_therapy",
    description: "Koppel een BESTAANDE agenda-afspraak (CalendarEvent) aan een therapie-/begeleidingstraject (TherapyTrajectory). Gebruik dit als Salvo vraagt om een afspraak 'ook bij therapie te zetten'. Zoek eerst het event en het traject op (IDs uit de AGENDA- en THERAPIE-context, of via find_objects). Zet CalendarEvent.therapy_trajectory_id (en domain='self') én voeg het event-ID toe aan TherapyTrajectory.event_ids — bidirectioneel. Raad NOOIT een ID; gebruik altijd de ID uit de context of find_objects.",
    inputSchema: { type: "object", properties: { event_id: { type: "string" }, trajectory_id: { type: "string" } }, required: ["event_id", "trajectory_id"] },
    execute: async ({ event_id, trajectory_id }, base44) => {
      const sr = base44.asServiceRole;
      const ev = await sr.entities.CalendarEvent.update(event_id, { therapy_trajectory_id: trajectory_id, domain: "self", agent_source: "GIULIA-CORE" }).catch(() => null);
      if (!ev) return { error: "event not found" };
      const t = await sr.entities.TherapyTrajectory.get(trajectory_id).catch(() => null);
      let event_ids = [];
      if (t) {
        event_ids = [...(t.event_ids || []), event_id].filter((v, i, a) => a.indexOf(v) === i);
        await sr.entities.TherapyTrajectory.update(trajectory_id, { event_ids, agent_source: "GIULIA-CORE" }).catch(() => null);
      }
      await emitEvent(base44, { event_type: "THERAPY_EVENT_LINKED", object_type: "CalendarEvent", object_id: event_id, domain: "self", description: `Afspraak gekoppeld aan therapie-traject: ${ev.title}` });
      return { ok: true, event_id, trajectory_id, event_ids };
    }
  },
  {
    name: "add_need",
    description: "Registreer een behoefte als eersteklas object (SelfNeed-entity) met status, prioriteit en categorie. Gebruik dit als een behoefte opvolging verdient (niet alleen een vluchtige check-in-tag).",
    inputSchema: { type: "object", properties: { title: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"], default: "medium" }, category: { type: "string" }, context: { type: "string" }, check_in_id: { type: "string" } }, required: ["title"] },
    execute: async (args, base44) => {
      const sr = base44.asServiceRole;
      const n = await sr.entities.SelfNeed.create({ ...args, status: "open", first_seen: new Date().toISOString(), agent_source: "GIULIA-CORE" }).catch(() => null);
      return n ? { id: n.id, title: n.title } : { error: "create failed" };
    }
  },
  {
    name: "update_need",
    description: "Werk een behoefte bij — status (open/prioritized/resolved/deferred/revisited), prioriteit. Gebruik resolved/deferred om een behoefte af te sluiten.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string", enum: ["open", "prioritized", "resolved", "deferred", "revisited"] }, priority: { type: "string", enum: ["low", "medium", "high"] } }, required: ["id"] },
    execute: async ({ id, ...patch }, base44) => {
      if (patch.status === "resolved") patch.resolved_at = new Date().toISOString();
      const n = await base44.asServiceRole.entities.SelfNeed.update(id, { ...patch, agent_source: "GIULIA-CORE" }).catch(() => null);
      return n ? { ok: true, status: n.status } : { error: "not found" };
    }
  },
  {
    name: "list_open_needs",
    description: "Lijst van openstaande behoeften (SelfNeed) — behoeften die opvolging of aandacht verdienen.",
    inputSchema: { type: "object", properties: {} },
    execute: async (_args, base44) => {
      const list = await base44.asServiceRole.entities.SelfNeed.filter({ status: { $in: ["open", "prioritized", "revisited"] } }, "-first_seen", 30).catch(() => []);
      return { count: list.length, items: list.map((n) => ({ id: n.id, title: n.title, priority: n.priority, status: n.status, category: n.category })) };
    }
  },
];