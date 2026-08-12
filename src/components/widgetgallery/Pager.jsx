import React from "react";

/** Pager — two-dot page indicator, the "multiple pages in one widget" control. */
export default function Pager({ page, setPage, dark = false }) {
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {[0, 1].map((i) => (
        <button
          key={i}
          onClick={() => setPage(i)}
          aria-label={`Pagina ${i + 1}`}
          className={`h-1.5 rounded-full transition-all ${
            page === i ? (dark ? "w-5 bg-ivory" : "w-5 bg-charcoal") : dark ? "w-1.5 bg-ivory/35" : "w-1.5 bg-charcoal/25"
          }`}
        />
      ))}
    </div>
  );
}