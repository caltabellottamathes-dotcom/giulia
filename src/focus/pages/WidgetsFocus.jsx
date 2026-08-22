import React from "react";
import { Link } from "react-router-dom";
import TasksBloomFocusWidget from "@/focus/widgets/new/TasksBloomFocusWidget";
import WhatsAppChatFocusWidget from "@/focus/widgets/new/WhatsAppChatFocusWidget";
import TasksFocusWidget from "@/focus/widgets/new/TasksFocusWidget";
import ProjectsFocusWidget from "@/focus/widgets/new/ProjectsFocusWidget";
import EmailFocusWidget from "@/focus/widgets/new/EmailFocusWidget";
import PeopleFocusWidget from "@/focus/widgets/new/PeopleFocusWidget";
import TimeTrackerFocusWidget from "@/focus/widgets/new/TimeTrackerFocusWidget";
import AgendaFocusWidget from "@/focus/widgets/new/AgendaFocusWidget";

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
        Focus-widgets in het Giulia-skelet — burgundy, olijf, beton, geborsteld metaal. Echte Focus-functies + juiste data.
      </p>

      <div className="columns-1 lg:columns-2 gap-8">
        <div className="break-inside-avoid mb-8 mx-auto w-[290px]">
          <Label>01 · TO DO! — 9:16 · glaspill items + staafgrafiek (Tasks)</Label>
          <TasksBloomFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>02 · WHO'S TEXTING? — P·16x9·L·SIDE · chatvenster + 5 ongelezen berichten (WhatsApp)</Label>
          <WhatsAppChatFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>03 · WHAT I'M BUILDING. — G·4:3·R·SIDE · gauge + voortgang per project (Projects)</Label>
          <ProjectsFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[340px]">
          <Label>04 · ONLINE POSTOFFICE. — P·1x1·B·STRIP · gauge-ring (Email)</Label>
          <EmailFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[300px]">
          <Label>05 · PEOPLE AROUND ME. — P·2x3·B·SIDE · comparison + aan-beurt (People)</Label>
          <PeopleFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[200px]">
          <Label>06 · WHERE MY TIME GOES. — lang & smal · project-timer (TimeTracker)</Label>
          <TimeTrackerFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[680px]">
          <Label>07 · WHAT'S HAPPENING? — G·21x9·L·SIDE · aftelklok tot volgende afspraak (Agenda)</Label>
          <AgendaFocusWidget />
        </div>
      </div>
    </div>
  );
}