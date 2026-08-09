import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * SwipeBack — mobile OS gesture: swipe right from the left edge to go back.
 * A narrow left-edge strip (mobile only) that navigates(-1) on a rightward
 * swipe past a threshold. Sits above content, below the nav panels + bottom nav.
 */
export default function SwipeBack() {
  const navigate = useNavigate();
  const location = useLocation();
  const start = useRef(null);

  const onDown = (e) => { start.current = e.clientX; };
  const onUp = (e) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (dx > 70) navigate(-1);
  };

  if (location.pathname === "/") return null;
  return (
    <div
      onPointerDown={onDown}
      onPointerUp={onUp}
      className="lg:hidden fixed left-0 top-14 bottom-[5rem] z-[35] w-6"
      style={{ touchAction: "none" }}
    />
  );
}