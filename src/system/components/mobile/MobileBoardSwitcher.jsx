import { cn } from "@/lib/utils";
import { useActiveDomain } from "@/lib/useActiveDomain";

/**
 * MobileBoardSwitcher — compacte board-kiezer voor het mobiele dashboard
 * (lg:hidden). Vervangt op mobiel de hover-gevoelige board-tabs van de
 * desktop-toolbar: tik GIULIA / FOCUS / LIFE / SYSTEM (of een eigen board)
 * om van dashboard te wisselen. Swipe blijft ernaast werken.
 */
export default function MobileBoardSwitcher({ boards, active, onSelect }) {
  const { accent } = useActiveDomain(active);
  return (
    <div
      className="flex items-center gap-1 rounded-full px-1.5 py-1.5 overflow-x-auto no-scrollbar"
      style={{
        background: `color-mix(in srgb, ${accent} 5%, rgba(120,122,128,0.10))`,
        backdropFilter: "blur(30px) saturate(1.4)",
        WebkitBackdropFilter: "blur(30px) saturate(1.4)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 14px 30px -16px rgba(0,0,0,0.35), inset 0 1px 0 0 rgba(255,255,255,0.16)",
      }}
    >
      {boards.map((b) => {
        const on = b.id === active;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap transition-colors",
              on && "bg-foreground/10"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: on ? accent : "rgba(0,0,0,0.18)" }} />
            <span className={on ? "text-foreground" : "text-foreground/50"}>{b.label}</span>
          </button>
        );
      })}
    </div>
  );
}