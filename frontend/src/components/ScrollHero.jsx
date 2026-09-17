import { useEffect, useRef, useState } from "react";
import PrirqLogo from "./PrirqLogo";
import "./ScrollHero.css";

export default function ScrollHero() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll progress mapping for text stage transitions
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const containerTop = container.offsetTop;
      const scrollableDist = container.offsetHeight - window.innerHeight;

      if (scrollableDist <= 0) return;

      const relativeScroll = scrollTop - containerTop;
      let progress = relativeScroll / scrollableDist;
      progress = Math.max(0, Math.min(1, progress));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Text stage opacity calculation
  const getTextOpacity = (start, peakStart, peakEnd, end) => {
    if (scrollProgress < start || scrollProgress > end) return 0;
    if (scrollProgress >= peakStart && scrollProgress <= peakEnd) return 1;
    if (scrollProgress < peakStart) return (scrollProgress - start) / (peakStart - start);
    return (end - scrollProgress) / (end - peakEnd);
  };

  const getTransformY = (opacity) => {
    return (1 - opacity) * 16;
  };

  const op1 = getTextOpacity(0.0, 0.0, 0.14, 0.20);
  const op2 = getTextOpacity(0.22, 0.26, 0.40, 0.46);
  const op3 = getTextOpacity(0.48, 0.52, 0.68, 0.74);
  const op4 = getTextOpacity(0.76, 0.80, 0.94, 0.99);

  return (
    <section ref={containerRef} className="scroll-hero-container">
      <div className="scroll-hero-sticky">
        {/* Cinematic Background Video */}
        <video
          src="/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="scroll-hero-video"
        />
        <div className="scroll-hero-overlay-dark" />

        {/* Floating Minimal Progress Pill */}
        <div className="hero-progress-pill font-mono">
          <span className="dot-live"></span>
          <span>LIVE EXPERIENCE</span>
          <span className="progress-separator">•</span>
          <span>SUB-ZERO POWER</span>
        </div>

        {/* Editorial Text Layer 1: Initial View */}
        <div
          className="hero-text-stage stage-1"
          style={{
            opacity: op1,
            transform: `translate3d(-50%, calc(-50% + ${getTransformY(op1)}px), 0)`,
            pointerEvents: op1 > 0.5 ? "auto" : "none",
          }}
        >
          <span className="hero-eyebrow font-sans">(SUB-ZERO ENERGY MATRIX)</span>
          
          {/* PRIRP Center Brand Logo */}
          <div className="hero-center-logo-wrap">
            <PrirqLogo size="large" />
          </div>

          <div className="hero-scroll-cue font-sans">
            <span>SCROLL TO EXPLORE</span>
            <div className="cue-line"></div>
          </div>
        </div>

        {/* Editorial Text Layer 2 */}
        <div
          className="hero-text-stage stage-2"
          style={{
            opacity: op2,
            transform: `translate3d(0, ${getTransformY(op2)}px, 0)`,
          }}
        >
          <h2 className="stage-headline font-display">
            BORN IN ICE.<br />
            <span className="font-cursive cursive-accent">Engineered for Raw Power.</span>
          </h2>
          <p className="stage-desc font-sans">
            Sub-zero cold extraction preserves raw bioavailable plant catechins without heat degradation.
          </p>
        </div>

        {/* Editorial Text Layer 3 */}
        <div
          className="hero-text-stage stage-3"
          style={{
            opacity: op3,
            transform: `translate3d(0, ${getTransformY(op3)}px, 0)`,
          }}
        >
          <h2 className="stage-headline font-display">
            UNFILTERED FOCUS.<br />
            <span className="font-cursive cursive-accent">Zero Sugar. Zero Crash.</span>
          </h2>
          <p className="stage-desc font-sans">
            L-Theanine + 180mg organic green tea caffeine locked in a 2:1 golden ratio for laser focus.
          </p>
        </div>

        {/* Editorial Text Layer 4 */}
        <div
          className="hero-text-stage stage-4"
          style={{
            opacity: op4,
            transform: `translate3d(0, ${getTransformY(op4)}px, 0)`,
          }}
        >
          <h2 className="stage-headline font-display">
            180MG NATURAL CAFFEINE.<br />
            <span className="font-cursive cursive-accent">Pure Energy Freed.</span>
          </h2>
          <p className="stage-desc font-sans">
            Infused with Himalayan glacial electrolytes for rapid hydration.
          </p>
        </div>
      </div>
    </section>
  );
}
