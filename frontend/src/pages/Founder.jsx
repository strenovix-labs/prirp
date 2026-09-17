import { useEffect } from "react";
import { Link } from "react-router-dom";
import SplitFlapText from "../components/SplitFlapText";
import PrirqLogo from "../components/PrirqLogo";
import "./Founder.css";

export default function Founder() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="founder-page">
      {/* =========================================================================
          HERO SECTION: FOUNDER HERO IMAGE BACKGROUND & SPLIT FLAP
          ========================================================================= */}
      <section className="founder-hero-section">
        {/* Full-Screen Founder Image Background */}
        <div className="founder-hero-bg-wrapper">
          <img
            src="/assets/founder-hero-bg.jpeg"
            alt="PRIRP Founder"
            className="founder-hero-bg-img"
          />
          <div className="founder-hero-scrim" />
        </div>

        {/* Floating Transparent Split Flap Text - All Caps & Centered Without Dead Space */}
        <div className="founder-hero-overlay">
          <div className="founder-splitflap-wrapper">
            <SplitFlapText
              words={["POWERED BY VSNP", "VSNP 47"]}
              flipDuration={0.2}
              stagger={0.06}
              cycleDelay={1800}
              charset="alphanumeric"
              flipsPerChar={8}
              tileColor="#030303"
              textColor="#EF4444"
              tileRadius={7}
              gap={11}
              fontSize={48}
              loop
              fitContent={true}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUNDER SHOWCASE SECTION: RECTANGLE IMAGE LEFT, TITLE + CONTENT + IMAGE RIGHT
          ========================================================================= */}
      <section className="founder-showcase-section">
        <div className="founder-showcase-container">
          {/* Left Side: Rectangle Image */}
          <div className="founder-left-col">
            <div className="founder-rect-image-wrapper">
              <img
                src="/SANJAY/5.png"
                alt="Founder Vision"
                className="founder-rect-image"
              />
              <div className="founder-rect-glow" />
            </div>
          </div>

          {/* Right Side: Title, Content, and Image */}
          <div className="founder-right-col">
            <div className="founder-kicker font-mono">[ THE ARCHITECT ]</div>

            <h2 className="founder-right-title font-display">
              DISCIPLINE <span className="title-highlight">OVER TALENT.</span>
            </h2>

            <div className="founder-right-content font-sans">
              <p>
                Built at the intersection of raw adrenaline and relentless precision.
                PRIRP is not just an energy drink—it is a mindset engineered for those
                who demand peak physical and mental output without compromise.
              </p>
              <p>
                From track-level velocity to late-night engineering sessions, we eliminate
                the noise and deliver clean, high-performance fuel designed to keep you locked in.
              </p>
            </div>

            <div className="founder-sub-image-wrapper">
              <img
                src="/SANJAY/8.png"
                alt="PRIRP Culture"
                className="founder-sub-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="founder-footer">
        <div className="section-container">
          <div className="founder-footer-inner font-mono">
            <div className="footer-brand">
              <PrirqLogo size="small" />
              <span className="footer-copyright">
                © {new Date().getFullYear()} PRIRP ENERGY INC. ALL RIGHTS RESERVED.
              </span>
            </div>
            <div className="footer-links">
              <Link to="/">HOME</Link>
              <Link to="/merchandise">MERCH</Link>
              <Link to="/founder">FOUNDER</Link>
              <button
                type="button"
                className="footer-top-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                TOP ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
