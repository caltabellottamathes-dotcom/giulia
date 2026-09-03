import React from "react";
import GiuliaAdminShell from "@/giulia/components/admin/GiuliaAdminShell";
import SocialFeed from "@/life/components/SocialFeed";
import { IMAGES } from "@/lib/images";

/**
 * Updates — "Achter de schermen" / "Wat er nieuw is" in het Admin
 * LIFE-pagina-ontwerp. Host de SocialFeed van afgeronde acties.
 */
export default function Updates() {
  return (
    <GiuliaAdminShell
      pageKey="updates"
      eyebrow="GIULIA → MEANWHILE"
      title="Meanwhile"
      related={[{ label: "Activity", to: "/activity" }, { label: "Memory", to: "/memory" }, { label: "Approvals", to: "/approvals" }]}
      hero={IMAGES.salvoReadingBeach}
      card={{
        eyebrow: "Meanwhile | updates_",
        title1: "Behind the,", title2: "scenes.",
        metaLine: "Wat Giulia ondertussen zelf afrondt",
        heading1: "Recently", heading2: "finished",
        itemsLabel: "00_meanwhile_",
        items: [],
      }}
    >
      <SocialFeed />
    </GiuliaAdminShell>
  );
}