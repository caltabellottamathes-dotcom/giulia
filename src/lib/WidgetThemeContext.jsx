import { createContext, useContext } from "react";

/**
 * WidgetThemeContext — per-widget appearance chosen by the user.
 * theme: "glass" (translucent gray) | "solid" (full palette color)
 * color: palette key when solid — "charcoal" | "olive" | "sand"
 * WidgetShell reads this to override its tile treatment.
 */
const Ctx = createContext({ theme: "glass", color: "" });

export const WidgetThemeProvider = Ctx.Provider;
export const useWidgetTheme = () => useContext(Ctx);