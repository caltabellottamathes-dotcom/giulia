/**
 * Per-module meta voor het nieuwe universele ModulePanel.
 *  - tabs:  de header-links worden body-navigatie; klikken wisselt de Body-content
 *           naar de preview van een ander module, paneel blijft open.
 *  - help:  universele help-tekst bij de actieve Body-inhoud (Help-knop header).
 *
 * Modules zonder entry vallen terug op MODULE_FUNCTIONS als route-links (oud
 * gedrag) en tonen geen help. previews die de nieuwe `onFooter`-callback gebruiken
 * leveren zelf hun contextrij + knoppen aan de vaste footer.
 */
export const MODULE_PANEL_META = {
  social: {
    tabs: [
      { label: "Pulse", module: "socialpulse" },
      { label: "Planner", module: "socialplanner" },
      { label: "Persoonlijke Tijd", module: "socialtime" },
    ],
  },
  wantstoknow: {
    tabs: [
      { label: "Wants to Know!", module: "wantstoknow" },
      { label: "What I Remember.", module: "memory" },
      { label: "What I've Noticed.", module: "insights" },
    ],
  },
  goodmorning: {
    tabs: [
      { label: "Morning", module: "gm_morning" },
      { label: "Routine", module: "gm_routine" },
      { label: "Settings", module: "gm_settings" },
    ],
  },
};

export const TAB_HELP = {
  socialpulse: "Wie in je naaste kring aandacht verdient — op basis van écht contact (verzonden berichten en afspraken), niet ontvangen post.",
  socialplanner: "Sociale tijd inplannen: vrije momenten, open uitnodigingen en mensen die je wilde zien.",
  socialtime: "Persoonlijke tijd vandaag: beschermd, rust, herstel en vrije ruimte.",
  wantstoknow: "Giulia stelt open vragen om haar context te verrijken. Beantwoord ze direct, of laat Giulia nieuwe gaten zoeken.",
  memory: "Wat Giulia over je onthoudt — herinneringen en opgeslagen context.",
  insights: "Signalen en patronen die Giulia in je data opmerkt.",
  gm_morning: "Hoe ging je ochtend? Een samenvatting van de laatst voltooide wake-sessie.",
  gm_routine: "Hoe ziet je ochtendroutine eruit? Stappen, duur en adaptieve modus.",
  gm_settings: "Hoe moet je wekker werken? Wektijd, stijl, snooze, stem en overgangen.",
};