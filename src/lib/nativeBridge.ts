/**
 * nativeBridge.ts — runtime bridge for Tauri (Windows) & Capacitor (Android/iOS).
 *
 * Zero npm dependencies: uses the globals Tauri/Capacitor inject into the
 * webview, so the Base44 web build is completely unaffected. Every helper is
 * a safe no-op in a normal browser; native features activate only inside a
 * wrapper. The minimalist 1px-border brutalism UI stays untouched.
 */
import { base44 } from "@/api/base44Client";

const w: any = typeof window !== "undefined" ? window : ({} as any);

export const isTauri = !!(w.__TAURI__ || w.__TAURI_INTERNALS__);
export const isCapacitor = !!(
  w.Capacitor &&
  typeof w.Capacitor.isNativePlatform === "function" &&
  w.Capacitor.isNativePlatform()
);

// Access a Capacitor plugin proxy regardless of whether registerPlugin is used.
function capacitorPlugin(name: string): any | null {
  const Cap = w.Capacitor;
  if (!Cap) return null;
  if (Cap.Plugins && Cap.Plugins[name]) return Cap.Plugins[name];
  if (typeof Cap.registerPlugin === "function") {
    try { return Cap.registerPlugin(name); } catch { return null; }
  }
  return null;
}

// ── Haptics — physical feedback for approve/reject/etc. (Capacitor) ───────
export function haptic(
  style: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light"
) {
  try {
    const Haptics = capacitorPlugin("Haptics");
    if (!Haptics) return;
    if (style === "success") Haptics.notification?.({ type: "SUCCESS" });
    else if (style === "warning") Haptics.notification?.({ type: "WARNING" });
    else if (style === "error") Haptics.notification?.({ type: "ERROR" });
    else Haptics.impact?.({ style: style.toUpperCase() });
  } catch { /* noop */ }
}

// ── Push notifications — real system notifications, not web (Capacitor) ──
export async function registerPushNotifications(): Promise<string | null> {
  try {
    const Push = capacitorPlugin("PushNotifications");
    if (!Push) return null;
    const perm: any = await Push.requestPermissions?.().catch(() => ({}));
    if (perm && perm.receive !== "granted" && perm.receive !== "prompt") return null;
    await Push.register?.().catch(() => {});
    return await new Promise<string | null>((resolve) => {
      let done = false;
      const finish = (v: string | null) => { if (!done) { done = true; resolve(v); } };
      Push.addListener?.("registration", (token: any) => {
        const v = token?.value || token?.token || "";
        try { w.localStorage?.setItem("giulia_push_token", v); } catch {}
        finish(v || null);
      });
      Push.addListener?.("registrationError", () => finish(null));
      setTimeout(() => finish(null), 4000);
    });
  } catch { return null; }
}

// ── Tauri invoke — call a Rust command from the frontend ─────────────────
export function tauriInvoke<T = any>(
  cmd: string,
  args?: Record<string, any>
): Promise<T> | null {
  try {
    const t = w.__TAURI__ || w.__TAURI_INTERNALS__;
    if (!t) return null;
    if (t.core?.invoke) return t.core.invoke(cmd, args); // Tauri v2
    if (t.invoke) return t.invoke(cmd, args);            // Tauri v1 fallback
    return null;
  } catch { return null; }
}

// ── Tray focus sync — push today's DailyPlan focus items to the Windows tray ──
export async function setFocusItems(items: string[]): Promise<void> {
  if (!isTauri) return;
  const p = tauriInvoke("update_tray_focus", { items });
  if (p) await p.catch(() => {});
}

// ── Hide the current window (command palette after submit) ───────────────
export function hideCurrentWindow(): void {
  try {
    const t = w.__TAURI__;
    if (!t) return;
    const cur = t?.window?.getCurrentWindow?.();
    cur?.hide?.();
  } catch { /* noop */ }
}

// ── Quick command — Tauri command palette → Base44 interpretInput ──────────
export async function sendQuickCommand(text: string) {
  return base44.functions.invoke("interpretInput", { source: "command", text });
}