import React from "react";
import ModulePanelTemplate from "@/system/panels/ModulePanelTemplate";
import { IMAGES } from "@/lib/images";

/**
 * Template-pagina: toont het universele ModulePanelTemplate (placeholder-copy)
 * als losse, kopieerbare master. De echte QuestionsPreview/module blijft
 * onaangetast — dit is puur het sjabloon.
 */
export default function QuestionsPanelPage() {
  return (
    <div className="w-full max-w-[860px] mx-auto h-[80vh] min-h-[560px]">
      <ModulePanelTemplate accent="hsl(var(--olive))" heroImage={IMAGES.wWantsToKnow} openRoute="/wants-to-know" />
    </div>
  );
}