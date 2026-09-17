import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState("default"); // default, link, card, order, scroll
  const [isVisible, setIsVisible] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });
  const velRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const checkHoverables = (e) => {
      const target = e.target;
      if (!target) return;

      if (target.closest(".product-order-btn") || target.closest("[data-cursor='order']")) {
        setCursorType("order");
      } else if (target.closest(".product-canvas-wrapper") || target.closest(".product-visual-col") || target.closest("[data-cursor='scroll']")) {
        setCursorType("scroll");
      } else if (target.closest(".pack-select-card") || target.closest("[data-cursor='card']")) {
        setCursorType("card");
      } else if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("[role='button']") ||
        target.closest(".interactive-target")
      ) {
        setCursorType("link");
      } else {
        setCursorType("default");
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      velRef.current = delta;
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", checkHoverables, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    // Smooth Lerp loop for trailing cursor dot and velocity decay
    const render = () => {
      // Lerp outer cursor
      trailRef.current.x += (posRef.current.x - trailRef.current.x) * 0.2;
      trailRef.current.y += (posRef.current.y - trailRef.current.y) * 0.2;
      setTrailingPos({ x: trailRef.current.x, y: trailRef.current.y });

      // Decay velocity smoothly
      velRef.current *= 0.88;
      setScrollVelocity(velRef.current);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", checkHoverables);
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Arrow offset derived from scroll velocity
  const arrowOffset = Math.max(-6, Math.min(8, scrollVelocity * 0.25));

  return (
    <>
      {/* 1. Inner Central Cursor Dot (Instant Follow) */}
      <div
        className="cursor-inner-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          pointerEvents: "none",
          zIndex: 99999,
          width: cursorType === "scroll" || cursorType === "order" ? 0 : 6,
          height: cursorType === "scroll" || cursorType === "order" ? 0 : 6,
          borderRadius: "50%",
          backgroundColor: "#F40001",
          boxShadow: "0 0 10px #F40001, 0 0 18px rgba(255, 0, 51, 0.8)",
          opacity: cursorType === "scroll" || cursorType === "order" ? 0 : 1,
          transition: "opacity 0.15s ease, width 0.15s ease, height 0.15s ease",
        }}
      />

      {/* 2. Outer Soft Follower (Inertial Smooth Lag) */}
      <div
        className={`cursor-outer-follower cursor-${cursorType}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) translate(-50%, -50%)`,
          pointerEvents: "none",
          zIndex: 99998,
          width:
            cursorType === "scroll"
              ? 76
              : cursorType === "order"
              ? 64
              : cursorType === "card"
              ? 52
              : cursorType === "link"
              ? 42
              : 32,
          height:
            cursorType === "scroll"
              ? 76
              : cursorType === "order"
              ? 64
              : cursorType === "card"
              ? 52
              : cursorType === "link"
              ? 42
              : 32,
          borderRadius: "50%",
          border:
            cursorType === "order"
              ? "1.5px solid #ffffff"
              : cursorType === "scroll"
              ? "1px solid rgba(255, 0, 51, 0.7)"
              : cursorType === "card"
              ? "1.5px solid rgba(255, 0, 51, 0.6)"
              : cursorType === "link"
              ? "1.5px solid rgba(255, 0, 51, 0.5)"
              : "1px solid rgba(255, 0, 51, 0.35)",
          backgroundColor:
            cursorType === "order"
              ? "rgba(255, 0, 51, 0.95)"
              : cursorType === "scroll"
              ? "rgba(0, 0, 0, 0.9)"
              : cursorType === "card"
              ? "rgba(255, 0, 51, 0.08)"
              : cursorType === "link"
              ? "rgba(255, 0, 51, 0.06)"
              : "transparent",
          backdropFilter:
            cursorType === "scroll" || cursorType === "order" ? "blur(14px)" : "none",
          WebkitBackdropFilter:
            cursorType === "scroll" || cursorType === "order" ? "blur(14px)" : "none",
          boxShadow:
            cursorType === "order"
              ? "0 0 30px rgba(255, 0, 51, 0.8)"
              : cursorType === "scroll"
              ? "0 8px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 0, 51, 0.5)"
              : cursorType === "card"
              ? "0 0 20px rgba(255, 0, 51, 0.25)"
              : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "'Poppins', sans-serif",
          transition:
            "width 0.28s cubic-bezier(0.16, 1, 0.3, 1), height 0.28s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        {cursorType === "scroll" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              color: "#f5f5f7",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#F40001",
                textShadow: "0 0 8px rgba(255, 0, 51, 0.6)",
              }}
            >
              SCROLL
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                lineHeight: 1,
                color: "#ffffff",
                transform: `translateY(${arrowOffset}px)`,
                transition: "transform 0.1s linear",
              }}
            >
              ↓
            </span>
          </div>
        )}

        {cursorType === "order" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              color: "#ffffff",
              fontSize: "9.5px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <span>ORDER</span>
            <span style={{ fontSize: "11px" }}>→</span>
          </div>
        )}
      </div>
    </>
  );
}
