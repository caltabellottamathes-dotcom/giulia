import { createContext, useContext } from "react";

/**
 * WidgetThemeContext — per-widget appearance chosen by the user.
 * theme: "glass" (translucent) | "solid" (full palette color)
 * color: palette key when solid — charcoal | olive | sand | ridge | storm
 * opacity: 0..1 background alpha
 * blur: extra backdrop blur in px
 */
const Ctx = createContext({ theme: "glass", color: "", opacity: 1, blur: 0, domain: "" });

export const WidgetThemeProvider = Ctx.Provider;
export const useWidgetTheme = () => useContext(Ctx);