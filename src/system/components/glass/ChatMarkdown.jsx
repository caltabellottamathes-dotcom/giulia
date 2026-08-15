import React from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

/**
 * ChatMarkdown — renders Giulia's chat text, turning links to app routes
 * (e.g. [2 taken](/tasks)) into real in-app navigation instead of a full
 * page reload, so meldingen over taken/goedkeuringen echt klikbaar zijn.
 */
export default function ChatMarkdown({ children, className }) {
  const navigate = useNavigate();
  return (
    <ReactMarkdown
      className={className}
      components={{
        a: ({ href, children: label }) => {
          const internal = href && href.startsWith("/");
          if (internal) {
            return (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(href); }}
                className="underline font-medium text-olive hover:text-olive/80 transition-colors"
              >
                {label}
              </button>
            );
          }
          return (
            <a href={href} target="_blank" rel="noreferrer" className="underline">
              {label}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}