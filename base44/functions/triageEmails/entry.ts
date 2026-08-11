import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * triageEmails — sorteert de inbox in categorieën (important / advertising /
 * newsletter / junk / spam), koppelt projectgerelateerde mails aan het juiste
 * project (email.project_id), en bereidt concept-antwoorden voor die Salvo
 * moet goedkeuren (Email folder=giulia_drafts). NOOIT zelf verzenden.
 *
 * Werkt in twee lagen:
 *  1. Heuristische pre-pass (geen credits) — classificatie + project-koppeling.
 *  2. LLM-agent (runGiuliaAgent) — verfijning + concept-antwoorden. Slaat
 *     stil door als integratie-credits uitgeput zijn; de heuristische laag
 *     blijft dan geldig.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [emails, projects] = await Promise.all([
      sr.entities.Email.filter({ folder: 'inbox' }).catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);
    const untriaged = emails.filter((e) => !e.triaged);
    if (!untriaged.length) {
      return Response.json({ ok: true, triaged: 0, message: 'Alles al gesorteerd.' });
    }

    // === Laag 1 — heuristische classificatie + project-koppeling (geen credits) ===
    const ADVERTISING = /(unsubscribe|uitgeschreven|afmelden|sale|solden|korting|aanbieding|deal|promo|winkelwagen|cart|free shipping|actie|uitverkoop|offerte|early access|order now|bevestig je|abonnement)/i;
    const SPAM = /(winner|lottery|crypto|bitcoin|investment opportunity|urgent fund|claim your|congratulations you|viagra|casino|loan offer|prize|secured link|verify your account|suspended)/i;
    const NEWSLETTER = /(newsletter|nieuwsbrief|weekly digest|this week in|issue #|vol \d|digest|roundup|the edition)/i;
    const JUNK = /(no-?reply|noreply|donotreply|notifications|notify|mailer|updates@|team@)/i;

    const heurCategory = (e) => {
      const text = `${e.subject || ''} ${e.body || ''} ${e.sender || ''} ${e.sender_email || ''}`.toLowerCase();
      if (SPAM.test(text)) return 'spam';
      if (NEWSLETTER.test(text) || /newsletter|nieuwsbrief/.test(e.sender_email || '')) return 'newsletter';
      if (ADVERTISING.test(text)) return 'advertising';
      if (JUNK.test(e.sender_email || '')) return 'junk';
      return 'important';
    };

    const projectMatch = (e) => {
      const text = `${e.subject || ''} ${e.body || ''} ${e.sender || ''} ${e.sender_email || ''}`.toLowerCase();
      for (const p of projects) {
        const title = (p.title || '').toLowerCase().trim();
        if (title.length > 3 && text.includes(title)) return p.id;
      }
      return null;
    };

    const updates = [];
    for (const e of untriaged) {
      const category = heurCategory(e);
      const projectId = projectMatch(e);
      updates.push(
        sr.entities.Email.update(e.id, {
          category,
          project_id: projectId || null,
          triaged: true,
          ...(category === 'important' ? { important: true } : {}),
        }).catch(() => null)
      );
    }
    await Promise.all(updates);

    // === Laag 2 — LLM-agent: verfijning + concept-antwoorden ===
    const tools = {
      list_important: tool({
        description: 'Als important geclassificeerde emails die mogelijk een antwoord nodig hebben.',
        inputSchema: { type: 'object', properties: {} },
        execute: () =>
          sr.entities.Email.filter({ folder: 'inbox' }).catch(() => [])
            .then((l) => l.filter((e) => e.category === 'important').slice(0, 30)
              .map((e) => ({ id: e.id, sender: e.sender, sender_email: e.sender_email, subject: e.subject, body: String(e.body || '').slice(0, 500), project_id: e.project_id }))),
      }),
      draft_reply: tool({
        description: 'Maak een concept-antwoord (Email folder=giulia_drafts) voor een email die Salvo moet beantwoorden. NOOIT zelf verzenden.',
        inputSchema: { type: 'object', properties: { email_id: { type: 'string' }, reply: { type: 'string' }, reason: { type: 'string' } }, required: ['email_id', 'reply'] },
        execute: async ({ email_id, reply, reason }) => {
          const e = await sr.entities.Email.get(email_id).catch(() => null);
          if (!e) return null;
          return sr.entities.Email.create({
            sender: e.sender || '(onbekend)',
            sender_email: e.sender_email || '',
            subject: e.subject ? 'RE: ' + e.subject : 'Concept antwoord',
            body: reply,
            folder: 'giulia_drafts',
            giulia_draft: true,
            status: 'draft',
            context: reason || 'Concept antwoord — wacht op goedkeuring van Salvo.',
            project_id: e.project_id || null,
            timestamp: new Date().toISOString(),
          }).catch(() => null);
        },
      }),
    };

    const task =
      'Sorteer de inbox is al heuristisch gedaan. Jouw taak: gebruik list_important om emails met category "important" te bekijken. ' +
      'Voor elke email die een persoonlijk antwoord nodig heeft, schrijf een concept-antwoord in Salvo\'s stijl (kort, warm, concreet, Nederlands of match de taal van de afzender) via draft_reply. ' +
      'Sla emails over die duidelijk geen antwoord nodig hebben (bevestigingen, notificaties). ' +
      'Rapporteer via report_to_salvo hoeveel concept-antwoorden klaarstaan voor goedkeuring.';

    await runGiuliaAgent(base44, 'triageEmails', task, tools, 10).catch(() => null);

    // === Samenvatting ===
    const [allInbox, drafts] = await Promise.all([
      sr.entities.Email.filter({ folder: 'inbox' }).catch(() => []),
      sr.entities.Email.filter({ folder: 'giulia_drafts' }).catch(() => []),
    ]);
    const counts = { important: 0, advertising: 0, newsletter: 0, junk: 0, spam: 0, other: 0 };
    allInbox.forEach((e) => { if (e.category) counts[e.category] = (counts[e.category] || 0) + 1; });
    const linked = allInbox.filter((e) => e.project_id).length;

    return Response.json({
      ok: true,
      triaged: untriaged.length,
      counts,
      linked,
      drafts: drafts.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}