/**
 * Giulia's personal questions — asked naturally inside the Briefing, one or two
 * per session. Answers are saved to the user's profile (base44.auth.updateMe
 * → giulia_answers) so Giulia learns about you and can tailor her suggestions.
 * A question with its key already present in giulia_answers is never asked again.
 */
export const GIULIA_QUESTIONS = [
  {
    key: "morning_energy",
    title: "Wat geeft jou 's ochtends energie voor de dag?",
    summary: "Koffie, muziek, stilte? Ik wil begrijpen wat jouw dag goed start.",
  },
  {
    key: "first_task_style",
    title: "Welk type taak doe je het liefst als eerste?",
    summary: "De makkelijkste om warm te draaien, of juist de zwaarste terwijl je scherp bent?",
  },
  {
    key: "social_circle",
    title: "Is er iemand waar je vaker van hoort dan je wil?",
    summary: "Of juist iemand van wie je te weinig hoort? Ik leer graag je sociale landschap kennen.",
  },
  {
    key: "good_day",
    title: "Hoe weet jij dat een dag geslaagd was?",
    summary: "Een gevoel, een lijst, iets wat gedaan is? Ik wil weten wat voor jou 'goed' betekent.",
  },
  {
    key: "procrastination",
    title: "Wat stel je het meest uit?",
    summary: "Niet om je te bekritiseren — ik wil er gewoon rekening mee houden.",
  },
  {
    key: "focus_window",
    title: "Wanneer voel je je het meest scherp?",
    summary: "'s Ochtends, na sport, laat op de avond? Ik wil je dag daarop inrichten.",
  },
  {
    key: "stress_signal",
    title: "Hoe merk je bij jezelf dat het te veel wordt?",
    summary: "Slaap, prikkelbaarheid, alles uitstellen? Dan weet ik wanneer ik moet inpakken.",
  },
  {
    key: "weekend_mode",
    title: "Wat is voor jou een goed weekend?",
    summary: "Uitslapen, mensen, natuur, niks? Ik wil je vrijdagen beter kunnen plannen.",
  },
];