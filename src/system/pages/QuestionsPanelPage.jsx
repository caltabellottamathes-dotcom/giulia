import React from "react";
import QuestionsPreview from "@/giulia/panels/QuestionsPreview";

/** Blanke pagina die uitsluitend het QuestionsPreview-paneel toont,
 *  op ware grootte zoals het in het schuifglas op het dashboard verschijnt. */
export default function QuestionsPanelPage() {
  return (
    <div className="min-h-screen bg-metal relative overflow-hidden flex items-center justify-center p-4">
      <div className="glass-3 float-shadow rounded-[28px] w-full max-w-[1100px] h-[calc(100dvh-2rem)] overflow-hidden">
        <QuestionsPreview />
      </div>
    </div>
  );
}