// Mock data for GIULIA OS prototype — real entities will be seeded separately
import { IMAGES } from "./images";

export const mockProjects = [
  {
    id: "p1",
    title: "Marktanalyse Q3",
    description: "Uitgebreid onderzoek naar marktontwikkelingen en concurrentiepositie voor het derde kwartaal.",
    status: "in_progress",
    progress: 72,
    start_date: "2026-07-01",
    deadline: "2026-09-15",
    image: IMAGES.portraitBootHands,
    category: "Research",
    next_milestone: "Concept presentatie",
  },
  {
    id: "p2",
    title: "Merklancering Giulia",
    description: "Lancering van de nieuwe merkidentiteit en visuele campagne voor Giulia OS.",
    status: "planning",
    progress: 35,
    start_date: "2026-08-01",
    deadline: "2026-10-30",
    image: IMAGES.walkingChairs,
    category: "Design",
    next_milestone: "Goedkeuring moodboard",
  },
  {
    id: "p3",
    title: "Wellington Collectie",
    description: "Productontwikkeling en fotografie voor de nieuwe Wellington boot collectie.",
    status: "in_progress",
    progress: 58,
    start_date: "2026-06-15",
    deadline: "2026-09-01",
    image: IMAGES.portraitBootFace,
    category: "Product",
    next_milestone: "Fotografie shoot",
  },
  {
    id: "p4",
    title: "Digitale Werkomgeving",
    description: "Ontwerp en bouw van de persoonlijke digitale werkruimte interface.",
    status: "waiting",
    progress: 20,
    start_date: "2026-08-10",
    deadline: "2026-12-01",
    image: IMAGES.sittingChairs,
    category: "Technology",
    next_milestone: "Wireframe review",
  },
  {
    id: "p5",
    title: "Klantonderzoek Noord-Europa",
    description: "Kwalitatief onderzoek naar klantvoorkeuren in de Scandinavische markt.",
    status: "completed",
    progress: 100,
    start_date: "2026-05-01",
    deadline: "2026-07-30",
    image: IMAGES.topDownWalk,
    category: "Research",
    next_milestone: "Afgerond",
  },
  {
    id: "p6",
    title: "Editorial Campagne",
    description: "Modereportage en editorial content voor de herfstcollectie.",
    status: "planning",
    progress: 15,
    start_date: "2026-08-20",
    deadline: "2026-11-15",
    image: IMAGES.feetChair,
    category: "Content",
    next_milestone: "Locatie scouting",
  },
];

export const mockTasks = [
  { id: "t1", title: "Review marktanalyse concept", status: "today", priority: "high", project_id: "p1", deadline: "2026-08-07", contact_id: "c1" },
  { id: "t2", title: "Fotograaf boeken voor shoot", status: "today", priority: "medium", project_id: "p3", deadline: "2026-08-08" },
  { id: "t3", title: "Moodboard merklancering afronden", status: "today", priority: "high", project_id: "p2", deadline: "2026-08-09" },
  { id: "t4", title: "Wireframe review voorbereiden", status: "upcoming", priority: "medium", project_id: "p4", deadline: "2026-08-14" },
  { id: "t5", title: "Klantinterviews samenvatten", status: "upcoming", priority: "low", project_id: "p1", deadline: "2026-08-12" },
  { id: "t6", title: "Locatie scouting editorial", status: "upcoming", priority: "medium", project_id: "p6", deadline: "2026-08-20" },
  { id: "t7", title: "Budget goedkeuring aanvragen", status: "overdue", priority: "high", project_id: "p3", deadline: "2026-08-05" },
  { id: "t8", title: "Wachten op feedback klant", status: "waiting", priority: "medium", project_id: "p5", deadline: "2026-08-10" },
  { id: "t9", title: "Giulia: onderzoek concurrenten", status: "delegated", priority: "low", project_id: "p1", deadline: "2026-08-10" },
  { id: "t10", title: "Presentatie afronden", status: "completed", priority: "high", project_id: "p5", deadline: "2026-07-28" },
  { id: "t11", title: "Agenda blokkeren voor shoot", status: "completed", priority: "medium", project_id: "p3", deadline: "2026-08-01" },
];

export const mockEvents = [
  { id: "e1", title: "Strategie overleg", start: "2026-08-07T09:00", end: "2026-08-07T10:00", location: "Kantoor", project_id: "p1", attendees: ["c1", "c2"] },
  { id: "e2", title: "Fotografie shoot", start: "2026-08-07T14:00", end: "2026-08-07T17:00", location: "Studio Noord", project_id: "p3", attendees: ["c3"] },
  { id: "e3", title: "Klantgesprek Merklancering", start: "2026-08-08T11:00", end: "2026-08-08T12:00", location: "Video call", project_id: "p2", attendees: ["c1"] },
  { id: "e4", title: "Wireframe review", start: "2026-08-08T15:30", end: "2026-08-08T16:30", location: "Kantoor", project_id: "p4", attendees: ["c2", "c4"] },
  { id: "e5", title: "Budget bespreking", start: "2026-08-09T10:00", end: "2026-08-09T10:30", location: "Kantoor", project_id: "p3" },
  { id: "e6", title: "Editorial team briefing", start: "2026-08-12T13:00", end: "2026-08-12T14:00", location: "Studio", project_id: "p6", attendees: ["c3"] },
];

export const mockContacts = [
  { id: "c1", name: "Sarah Lindeman", company: "Nordic Studio", role: "Creative Director", email: "sarah@nordic.studio", phone: "+31 6 12345678", avatar: IMAGES.portraitThinking },
  { id: "c2", name: "Thomas Verbeek", company: "Verbeek Consulting", role: "Strategist", email: "thomas@verbeek.co", phone: "+31 6 87654321", avatar: "" },
  { id: "c3", name: "Elena Marchetti", company: "Studio Marchetti", role: "Photographer", email: "elena@marchetti.it", phone: "+39 333 1234567", avatar: IMAGES.portraitBootHands },
  { id: "c4", name: "Jasper de Wit", company: "Wit Digital", role: "UX Designer", email: "jasper@wit.dev", phone: "+31 6 55558888", avatar: "" },
  { id: "c5", name: "Marie Dubois", company: "Atelier Dubois", role: "Art Director", email: "marie@atelier.fr", phone: "+33 6 11223344", avatar: IMAGES.portraitBootFace },
  { id: "c6", name: "Lucas Bergström", company: "Bergström & Co", role: "Client", email: "lucas@bergstrom.se", phone: "+46 70 9988776", avatar: "" },
];

export const mockEmails = [
  { id: "m1", sender: "Sarah Lindeman", sender_email: "sarah@nordic.studio", subject: "Concept marktanalyse — eerste indrukken", body: "Beste, ik heb het concept doorgenomen en wil graag een paar punten bespreken voordat we verder gaan. Kunnen we morgen bellen? Groet, Sarah", timestamp: "2026-08-07T08:30", status: "unread", folder: "inbox", project_id: "p1", contact_id: "c1", important: true },
  { id: "m2", sender: "Elena Marchetti", sender_email: "elena@marchetti.it", subject: "Bevestiging fotografie shoot 7 augustus", body: "Alles is geregeld voor de shoot. We beginnen om 14:00 in Studio Noord. Neem de Wellington collectie mee. Ciao, Elena", timestamp: "2026-08-06T16:45", status: "unread", folder: "inbox", project_id: "p3", contact_id: "c3" },
  { id: "m3", sender: "Thomas Verbeek", sender_email: "thomas@verbeek.co", subject: "Strategie notitie — bijgewerkt", body: "Hierbij de bijgewerkte strategie notitie. De belangrijkste wijziging zit in sectie 3 over positionering. Graag jouw feedback voor vrijdag.", timestamp: "2026-08-06T11:20", status: "read", folder: "inbox", project_id: "p1", contact_id: "c2" },
  { id: "m4", sender: "Jasper de Wit", sender_email: "jasper@wit.dev", subject: "Wireframes eerste concept", body: "Ik heb de eerste wireframes voor de digitale werkomgeving klaar. Zie bijlage. Laten we deze week een review inplannen.", timestamp: "2026-08-05T14:00", status: "read", folder: "inbox", project_id: "p4", contact_id: "c4" },
  { id: "m5", sender: "Marie Dubois", sender_email: "marie@atelier.fr", subject: "Moodboard herfstcollectie", body: "Bonjour! Hierbij mijn eerste gedachten voor het moodboard. Ik denk aan warme aardetinten, veel textuur, editorial sfeer. Qu'en pensez-vous?", timestamp: "2026-08-05T09:15", status: "read", folder: "inbox", project_id: "p6", contact_id: "c5" },
  { id: "m6", sender: "GIULIA", sender_email: "giulia@os.app", subject: "Draft: Re: Concept marktanalyse", body: "Beste Sarah, Bedankt voor je feedback. Ik stel voor dat we morgen om 10:00 bellen om de punten door te nemen. Ik zal de actiepunten voorbereiden. Met vriendelijke groet, Giulia (in opdracht van)", timestamp: "2026-08-07T08:35", status: "draft", folder: "giulia_drafts", project_id: "p1", contact_id: "c1", giulia_draft: true, context: "Giulia stelde deze reactie voor op basis van Sarah's email over het concept." },
  { id: "m7", sender: "GIULIA", sender_email: "giulia@os.app", subject: "Draft: Bevestiging aan Lucas Bergström", body: "Beste Lucas, Ik wil graag een moment inplannen om de voortgang van het project te bespreken. Welke dag komst jou het beste uit volgende week? Hartelijke groet, Giulia (in opdracht van)", timestamp: "2026-08-06T17:00", status: "draft", folder: "giulia_drafts", project_id: "p5", contact_id: "c6", giulia_draft: true, context: "Giulia merkte op dat Lucas al een tijdje geen update heeft gehad." },
];

export const mockWhatsApp = [
  { id: "w1", contact_id: "c1", conversation_id: "conv1", message: "Heb je mijn mail over het concept gezien?", timestamp: "2026-08-07T08:35", direction: "received", status: "read" },
  { id: "w2", contact_id: "c1", conversation_id: "conv1", message: "Ja, ik heb het gelezen. Giulia heeft een reactie voorbereid.", timestamp: "2026-08-07T08:40", direction: "sent", status: "read" },
  { id: "w3", contact_id: "c1", conversation_id: "conv1", message: "Perfect. Kunnen we morgen bellen?", timestamp: "2026-08-07T08:42", direction: "received", status: "unread" },
  { id: "w4", contact_id: "c3", conversation_id: "conv2", message: "Ciao! Alles klaar voor morgen. Studio Noord om 14:00.", timestamp: "2026-08-06T16:50", direction: "received", status: "read" },
  { id: "w5", contact_id: "c3", conversation_id: "conv2", message: "Geweldig, ik zal er zijn met de collectie.", timestamp: "2026-08-06T16:55", direction: "sent", status: "read" },
  { id: "w6", contact_id: "c5", conversation_id: "conv3", message: "Bonjour! Ik heb het moodboard af. Stuur ik het per mail?", timestamp: "2026-08-05T09:30", direction: "received", status: "unread" },
  { id: "w7", contact_id: "c6", conversation_id: "conv4", message: "Heb je een update over het onderzoek?", timestamp: "2026-08-04T14:00", direction: "received", status: "read" },
  { id: "w8", contact_id: "c6", conversation_id: "conv4", message: "Ja, ik stuur deze week een samenvatting.", timestamp: "2026-08-04T14:15", direction: "sent", status: "read" },
];

export const mockGiuliaDrafts = [
  { id: "d1", type: "email", source: "Sarah's email over concept", content: "Reactie op Sarah over marktanalyse concept", status: "awaiting_approval", created_at: "2026-08-07T08:35", project_id: "p1" },
  { id: "d2", type: "whatsapp", source: "Sarah's WhatsApp bericht", content: "Bevestiging belafspraak morgen", status: "awaiting_approval", created_at: "2026-08-07T08:43", project_id: "p1" },
  { id: "d3", type: "email", source: "Geen update aan Lucas in 2 weken", content: "Update aan Lucas over onderzoek voortgang", status: "awaiting_approval", created_at: "2026-08-06T17:00", project_id: "p5" },
  { id: "d4", type: "calendar", source: "Conflictdetectie agenda", content: "Verplaats wireframe review naar vrijdag", status: "awaiting_approval", created_at: "2026-08-07T07:00" },
];

export const mockApprovals = [
  { id: "a1", action_type: "send_email", target: "Sarah Lindeman", description: "Reactie sturen op concept marktanalyse", proposed_action: "Email verzenden met voorgestelde belafspraak", status: "pending", created_at: "2026-08-07T08:35", category: "email", context: "Sarah vroeg om een belafspraak over het concept." },
  { id: "a2", action_type: "send_whatsapp", target: "Sarah Lindeman", description: "WhatsApp reactie sturen", proposed_action: "Bevestigen dat je morgen kunt bellen", status: "pending", created_at: "2026-08-07T08:43", category: "whatsapp", context: "Sarah vroeg via WhatsApp of je morgen kunt bellen." },
  { id: "a3", action_type: "send_email", target: "Lucas Bergström", description: "Projectupdate sturen", proposed_action: "Email met voortgang onderzoek Noord-Europa", status: "pending", created_at: "2026-08-06T17:00", category: "email", context: "Lucas heeft al twee weken geen update gehad." },
  { id: "a4", action_type: "calendar_change", target: "Wireframe review", description: "Agenda conflict oplossen", proposed_action: "Verplaats wireframe review van do naar vr", status: "pending", created_at: "2026-08-07T07:00", category: "calendar", context: "Wireframe review botst met fotografie shoot." },
  { id: "a5", action_type: "create_task", target: "Marktanalyse Q3", description: "Taak aanmaken uit email", proposed_action: "Taak: review concurrenten sectie 3", status: "pending", created_at: "2026-08-06T11:25", category: "tasks", context: "Thomas noemde sectie 3 in zijn email." },
];

export const mockDocuments = [
  { id: "doc1", name: "Marktanalyse_Concept_v3.pdf", type: "pdf", project_id: "p1", created_at: "2026-08-05", status: "shared", owner: "Thomas Verbeek" },
  { id: "doc2", name: "Moodboard_Herfst.png", type: "image", project_id: "p6", created_at: "2026-08-05", status: "recent", owner: "Marie Dubois" },
  { id: "doc3", name: "Wireframes_v1.fig", type: "figma", project_id: "p4", created_at: "2026-08-05", status: "recent", owner: "Jasper de Wit" },
  { id: "doc4", name: "Wellington_Collectie_Brief.docx", type: "doc", project_id: "p3", created_at: "2026-08-03", status: "project", owner: "Jij" },
  { id: "doc5", name: "Klantonderzoek_Samenvatting.pdf", type: "pdf", project_id: "p5", created_at: "2026-07-28", status: "shared", owner: "Jij" },
  { id: "doc6", name: "Strategie_Notitie_v2.pdf", type: "pdf", project_id: "p1", created_at: "2026-08-06", status: "project", owner: "Thomas Verbeek" },
  { id: "doc7", name: "Giulia_Samenvataging_Email.pdf", type: "pdf", project_id: "p1", created_at: "2026-08-07", status: "giulia", owner: "GIULIA" },
  { id: "doc8", name: "Budget_Overzicht.xlsx", type: "sheet", project_id: "p3", created_at: "2026-08-01", status: "favorite", owner: "Jij" },
];

export const mockKnowledge = [
  { id: "k1", title: "Concurrentiepositie Scandinavische markt", content: "Analyse van de drie belangrijkste concurrenten in de Scandinavische markt, hun positionering en prijsstrategie.", category: "Research", source: "Marktanalyse Q3", project_id: "p1" },
  { id: "k2", title: "Editorial fotografie stijl gids", content: "Richtlijnen voor de editorial fotografie stijl: zachte lichtval, neutrale achtergronden, focus op textuur en materiaal.", category: "References", source: "Studio Marchetti", project_id: "p3" },
  { id: "k3", title: "Klantvoorkeuren Noord-Europa", content: "Klanten in Noord-Europa prefereren minimalistisch design met natuurlijke materialen en subtiele kleurpaletten.", category: "Insights", source: "Klantonderzoek", project_id: "p5" },
  { id: "k4", title: "Merkgids Giulia — visuele taal", content: "De visuele taal van Giulia: warme aardetinten, smoked glass, editorial compositie, ruimte en adem.", category: "Decisions", source: "Merklancering", project_id: "p2" },
  { id: "k5", title: "Wellington boot — product specificaties", content: "Matte grijze rubber, handgemaakt, waterdicht, gewicht 850g, maten 36-46.", category: "References", source: "Product team", project_id: "p3" },
  { id: "k6", title: "Gesprek met Marie over moodboard", content: "Marie stelde voor om warme aardetinten te combineren met veel textuur. Editorial sfeer, niet commercieel.", category: "Conversations", source: "WhatsApp + Email", project_id: "p6" },
];

export const mockMemory = [
  { id: "mem1", category: "User preferences", content: "Prefereert ochtend overleg voor 10:00", confidence: 0.92, source: "Agenda patronen" },
  { id: "mem2", category: "People", content: "Sarah Lindeman is creative director bij Nordic Studio, belangrijkste contact voor merkprojecten", confidence: 0.95, source: "Email + WhatsApp" },
  { id: "mem3", category: "Projects", content: "Marktanalyse Q3 heeft prioriteit — deadline 15 september", confidence: 0.88, source: "Project data" },
  { id: "mem4", category: "Routines", content: "Werkt meestal tussen 8:00 en 18:00, checked email 's ochtends eerst", confidence: 0.85, source: "Gedragspatroon" },
  { id: "mem5", category: "Important information", content: "Budget voor Wellington collectie fotografie is €8.500", confidence: 0.90, source: "Budget document" },
  { id: "mem6", category: "Conversation-derived", content: "Marie geeft de voorkeur aan email boven WhatsApp voor bestanduitwisseling", confidence: 0.78, source: "WhatsApp gesprek" },
  { id: "mem7", category: "User preferences", content: "Houdt van editorial, minimalistische esthetiek met warme tinten", confidence: 0.91, source: "Design voorkeuren" },
];

export const mockActivity = [
  { id: "act1", action: "prepared_email", description: "Giulia stelde een reactie voor op Sarah's email", source: "Email", timestamp: "2026-08-07T08:35" },
  { id: "act2", action: "detected_conflict", description: "Giulia detecteerde een agendabotsing tussen wireframe review en fotografie shoot", source: "Agenda", timestamp: "2026-08-07T07:00" },
  { id: "act3", action: "updated_project", description: "Giulia werkte Marktanalyse Q3 bij met nieuwe notitie van Thomas", source: "Projects", timestamp: "2026-08-06T11:25" },
  { id: "act4", action: "found_documents", description: "Giulia vond 3 relevante documenten voor het moodboard", source: "Documents", timestamp: "2026-08-06T09:30" },
  { id: "act5", action: "created_task", description: "Giulia maakte een taak aan vanuit een WhatsApp gesprek met Marie", source: "WhatsApp", timestamp: "2026-08-05T09:35" },
  { id: "act6", action: "prepared_email", description: "Giulia stelde een update voor aan Lucas Bergström", source: "Email", timestamp: "2026-08-06T17:00" },
  { id: "act7", action: "organized_knowledge", description: "Giulia categoriseerde 5 nieuwe kennisitems", source: "Knowledge", timestamp: "2026-08-05T16:00" },
  { id: "act8", action: "prepared_whatsapp", description: "Giulia stelde een WhatsApp reactie voor aan Sarah", source: "WhatsApp", timestamp: "2026-08-07T08:43" },
];

export const mockChatMessages = [
  { id: "msg1", role: "user", content: "Wat staat er vandaag op de agenda?", timestamp: "2026-08-07T08:00" },
  { id: "msg2", role: "giulia", content: "Goedemorgen. Vandaag heb je twee afspraken: om 09:00 een strategie overleg over Marktanalyse Q3, en om 14:00 de fotografie shoot voor de Wellington collectie in Studio Noord. Daarnaast staan er 3 taken voor vandaag gepland.", timestamp: "2026-08-07T08:00" },
  { id: "msg3", role: "user", content: "Kun je een email opstellen aan Sarah over het concept?", timestamp: "2026-08-07T08:05" },
  { id: "msg4", role: "giulia", content: "Ik heb een reactie voorbereid op Sarah's email. Ik stel voor dat we morgen om 10:00 bellen om de punten door te nemen. De draft staat klaar in je inbox ter goedkeuring. Wil je hem bekijken?", timestamp: "2026-08-07T08:06" },
  { id: "msg5", role: "user", content: "Is er een agendabotsing deze week?", timestamp: "2026-08-07T08:10" },
  { id: "msg6", role: "giulia", content: "Ja, ik heb een conflict gedetecteerd. De wireframe review op donderdag 15:30 botst met de fotografie shoot. Ik stel voor om de review te verplaatsen naar vrijdag. Ik heb een approval klaargezet.", timestamp: "2026-08-07T08:10" },
];