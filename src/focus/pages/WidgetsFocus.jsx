import React from "react";
import { Link } from "react-router-dom";
import AgendaFocusWidget from "@/focus/widgets/new/AgendaFocusWidget";
import TasksFocusWidget from "@/focus/widgets/new/TasksFocusWidget";
import EmailFocusWidget from "@/focus/widgets/new/EmailFocusWidget";
import ProjectsFocusWidget from "@/focus/widgets/new/ProjectsFocusWidget";

export default function WidgetsFocus() {
  const Label = ({ children }) => (
    <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45 mb-2">{children}</p>
  );

  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1320px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">FOCUS · Widget-skelet</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        Brutalist editorial — burgundy, olijf, beton, geborsteld metaal. Eén skelet, ontworpen naar functie. Live data.
      </p>

      <div className="columns-1 lg:columns-2 gap-8">
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>01 · WHAT'S HAPPENING? — P·16x9·L·SIDE · dag-tijdlijn + now-marker</Label>
          <AgendaFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[300px]">
          <Label>02 · TO DO! — P·2x3·B·SIDE · completion-bar + takenlijst</Label>
          <TasksFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[260px]">
          <Label>03 · ONLINE POSTOFFICE. — P·9x16·B·SIDE · ongelezen-telling + afzenders</Label>
          <EmailFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>04 · WHAT I'M BUILDING. — P·3x2·R·SIDE · telling + voortgangsbalken</Label>
          <ProjectsFocusWidget />
        </div>
      </div>
    </div>
  );
}