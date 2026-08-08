import React, { useState, useEffect } from "react";
import { subscribePush, pushPermissionState } from "@/lib/push";
import { Bell, BellRing, Loader2 } from "lucide-react";

/**
 * PushToggle — enables web push for the current device. Asks permission,
 * subscribes with the VAPID key, and stores the subscription.
 */
export default function PushToggle() {
  const [state, setState] = useState("default"); // default | loading | granted | denied | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    pushPermissionState().then((p) => {
      if (p === "granted") setState("granted");
      else if (p === "denied") setState("denied");
    });
  }, []);

  const enable = async () => {
    setState("loading");
    try {
      await subscribePush();
      setState("granted");
      setMsg("Pushmeldingen staan aan voor dit apparaat.");
    } catch (e) {
      setState("error");
      setMsg(e.message || "Kon push niet aanzetten.");
    }
  };

  if (state === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
        <BellRing className="h-4 w-4" /> {msg || "Pushmeldingen aan"}
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-sm text-muted-foreground">
        Notificaties zijn geblokkeerd in je browser. Schakel ze in via de site-instellingen.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={enable}
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 rounded-xl bg-charcoal text-ivory px-4 py-2.5 text-sm font-semibold hover:bg-charcoal/90 disabled:opacity-50 transition"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
        Pushmeldingen aanzetten
      </button>
      {state === "error" && <p className="text-sm text-destructive mt-2">{msg}</p>}
    </div>
  );
}