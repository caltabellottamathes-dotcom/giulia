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
  wantstoknow: {
    tabs: [
      { label: "Wants to Know!", module: "wantstoknow" },
      { label: "What I Remember.", module: "memory" },
      { label: "What I've Noticed.", module: "insights" },
    ],
  },
};

export const TAB_HELP = {
  wantstoknow: "Giulia stelt open vragen om haar context te verrijken. Beantwoord ze direct, of laat Giulia nieuwe gaten zoeken.",
  memory: "Wat Giulia over je onthoudt — herinneringen en opgeslagen context.",
  insights: "Signalen en patronen die Giulia in je data opmerkt.",
};