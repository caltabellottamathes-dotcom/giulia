import React, { useState } from "react";
import { CircleDot, Wallet, ListChecks, Banknote, LineChart, HeartPulse, FileText } from "lucide-react";
import { IMAGES } from "@/lib/images";
import SpaceShell from "@/life/components/space/SpaceShell";

const TABS = [
  { key: "OVERVIEW", label: "Overview", icon: CircleDot },
  { key: "PORTEFEUILLES", label: "Portefeuilles", icon: Wallet },
  { key: "LASTEN", label: "Lasten", icon: ListChecks },
  { key: "INKOMEN", label: "Inkomen", icon: Banknote },
  { key: "FORECAST", label: "Forecast", icon: LineChart },
  { key: "HEALTHY_MONEY", label: "Healthy Money", icon: HeartPulse },
  { key: "DOCUMENTEN", label: "Documenten", icon: FileText },
];

/** PaginaOntwerp — kopie van PersonalAdminPage met een volledig lege witte kaart.
 *  De glas-chrome (achtergrond, hero, paneel, tabs) blijft staan; editorial,
 *  widgets en kaarten zijn verwijderd. */
export default function PaginaOntwerp() {
  const [tab, setTab] = useState("OVERVIEW");
  return (
    <SpaceShell
      bgImage={IMAGES.lifePersonalAdmin}
      heroImage="https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg"
      eyebrow="LIFE → ONTWERP"
      title="Pagina-Ontwerp"
      tabs={TABS}
      activeTab={tab}
      onTab={setTab}
      navInfo="LIFE · ONTWERP"
    />
  );
}