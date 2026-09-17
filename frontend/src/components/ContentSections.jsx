import { useState, useEffect } from "react";
import PrirqLogo from "./PrirqLogo";
import Floating3DCan from "./Floating3DCan";
import StrokeText from "./StrokeText";
import ScrollVelocity from "./ScrollVelocity";
import "./ContentSections.css";

const INGREDIENTS_DATA = [
  {
    id: "01",
    name: "Caffeine",
    badge: "80MG DOSE",
    meta: "EFFECT: ALERTNESS • FOCUS • ENERGY",
    desc: "80mg of caffeine per 300ml can for heightened alertness and reduced tiredness, helping you stay switched on when performance matters.",
    detail: "ACTIVE: CAFFEINE",
  },
  {
    id: "02",
    name: "Taurine",
    badge: "100MG DOSE",
    meta: "EFFECT: CELLULAR • MUSCLE • NERVE",
    desc: "100mg of taurine to support normal cellular, muscle and nervous-system functions while complementing your energy formula.",
    detail: "AMINO ACID: TAURINE",
  },
  {
    id: "03",
    name: "Vitamin B3",
    badge: "6MG DOSE",
    meta: "EFFECT: ENERGY METABOLISM • CELLULAR FUNCTION",
    desc: "6mg of Vitamin B3 to support normal energy-yielding metabolism and help your body turn nutrients into usable energy.",
    detail: "VITAMIN: NIACIN / B3",
  },
  {
    id: "04",
    name: "Vitamin B6",
    badge: "1.5MG DOSE",
    meta: "EFFECT: NERVOUS SYSTEM • PROTEIN • ENERGY",
    desc: "1.5mg of Vitamin B6 to support normal nervous-system function and protein and energy metabolism.",
    detail: "VITAMIN: B6",
  },
  {
    id: "05",
    name: "Zero Sugar & pH 6.8 Balance",
    badge: "0.0G SUGAR",
    meta: "CALORIES: 5 KCAL",
    desc: "Crafted without high-fructose corn syrup, artificial colors, or harsh citric acid. pH-balanced at 6.8 for a clean, velvety, refreshing aftertaste that never coats your tongue.",
    detail: "Zero Crash Guarantee • Pure Clean Finish",
  },
];

export default function ContentSections({ onOpenCheckout }) {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(0);
  const [isSwappingPaused, setIsSwappingPaused] = useState(false);

  // Automated continuous looping card swap mechanism for Ingredients Section
  useEffect(() => {
    if (isSwappingPaused) return;

    const interval = setInterval(() => {
      setActiveIngredientIndex((prev) => (prev + 1) % INGREDIENTS_DATA.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSwappingPaused]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      try {
        const { subscribeVIPNewsletter } = await import("../api/client");
        await subscribeVIPNewsletter(emailInput.trim());
      } catch (err) {
        console.warn("Backend subscriber error, continuing:", err);
      }
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmailInput("");
    }
  };

  const handleNextIngredient = () => {
    setActiveIngredientIndex((prev) => (prev + 1) % INGREDIENTS_DATA.length);
  };

  const handlePrevIngredient = () => {
    setActiveIngredientIndex(
      (prev) => (prev - 1 + INGREDIENTS_DATA.length) % INGREDIENTS_DATA.length
    );
  };

  return (
    <div className="content-sections-wrapper">
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: STORY SECTION (EXACT REPLICA OF REFERENCE DESIGN)   */}
      {/* ------------------------------------------------------------- */}
      <section id="story" className="section-block story-section pitch-black-bg">
        <div className="section-container story-replica-container">
          
          {/* Top-Left Tag */}
          <div className="story-top-tag font-mono">
            [ 01 // BRAND STORY ]
          </div>

          {/* Main Layout Grid */}
          <div className="story-replica-grid">
            
            {/* Left Column: Bottom Watermark Label */}
            <div className="story-left-watermark font-mono">
              <span>PRIRP</span>
              <span>LEADS — NEVER</span>
              <span>FOLLOWS</span>
            </div>

            {/* Right Column: High-Impact Stepped Brutalist Typography */}
            <div className="story-replica-text-block">
              <p className="story-line">
                Within every person lies a <span className="highlight-red">hidden spark</span> — a force waiting to awaken.
              </p>
              <p className="story-line story-spacer">
                True strength doesn’t come from outside.
              </p>
              <p className="story-line">
                It lives within the <span className="highlight-red">mind, body, and spirit.</span>
              </p>
              <p className="story-line story-spacer">
                For centuries, people have searched for energy in the world around them.
              </p>
              <p className="story-line">
                But the greatest power has <span className="highlight-red">always been inside.</span>
              </p>
              <p className="story-line story-spacer">
                <span className="highlight-red">PRIRP is inspired by this belief.</span>
              </p>
              <p className="story-line">
                It’s not about becoming someone new, but <span className="highlight-red">unlocking who you already are.</span>
              </p>
              <p className="story-line story-spacer">
                Trust yourself.
              </p>
              <p className="story-line">
                Awaken your inner energy.
              </p>
              <p className="story-line story-spacer highlight-red story-final-callout">
                LET IT OUT.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: NEW HERO SECTION ("LET IT OUT" - PITCH RED BG)     */}
      {/* ------------------------------------------------------------- */}
      <section id="hero-red" className="section-block red-hero-section pitch-red-bg">
        <div className="section-container">
          <div className="red-hero-layout">
            
            {/* LEFT SIDE: Pitch Black PRIRP Tin Can with Red Logo */}
            <div className="red-hero-can-col">
              <div className="pitch-black-can-frame">
                <div className="can-cylinder-mockup">
                  {/* Pitch Black Can Canvas Render */}
                  <img
                    src="/prirplogoo.png"
                    alt="PRIRP Red Logo"
                    className="can-red-logo-overlay"
                  />
                  <div className="can-reflection-highlight" />
                </div>
                <div className="can-aura-glow" />
              </div>
            </div>

            {/* RIGHT SIDE: Large White Font LET IT OUT */}
            <div className="red-hero-text-col">
              <div className="red-hero-badge font-sans">
                [ UNLEASH THE SUB-ZERO MATRIX ]
              </div>
              
              <h1 className="let-it-out-text white-bold-text">
                LET IT OUT
              </h1>

              <p className="red-hero-subtitle font-sans">
                NO SYNTHETIC SPIKES. NO FILLERS. PURE SUB-ZERO GLACIAL STAMINA.
              </p>

              <div className="red-hero-actions">
                <button
                  type="button"
                  className="btn-white-hero font-sans"
                  onClick={() => onOpenCheckout?.("24pack")}
                >
                  CLAIM YOUR 24-PACK →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: INGREDIENTS SECTION (3D CAN + RED LOOPING CARDS)    */}
      {/* ------------------------------------------------------------- */}
      <section id="ingredients" className="section-block ingredients-section pitch-black-bg">
        <div className="section-container">
          <div className="ingredients-standalone-tag section-tag font-sans">
            [ 03 // FORMULATION & INGREDIENTS ]
          </div>

          <div className="section-header">
            <h2 className="section-title formula-matrix-title red-text">
              THE SUB-ZERO FORMULA MATRIX
            </h2>
            <p className="section-subtitle font-sans red-text-subtle">
              Every milligram is purpose-built. Five active pillars engineered for pure cognitive and physical stamina.
            </p>
          </div>

          <div className="ingredients-split-layout">
            
            {/* LEFT SIDE: Realistic 3D Interactive Floating Tin Can */}
            <div className="ingredients-3d-col">
              <Floating3DCan />
              <div className="interactive-3d-hint font-sans">
                <span>⚡ MOVE CURSOR TO TILT 3D CAN</span>
              </div>
            </div>

            {/* RIGHT SIDE: Red Cards Continuously Swapping in Loop */}
            <div
              className="ingredients-cards-col"
              onMouseEnter={() => setIsSwappingPaused(true)}
              onMouseLeave={() => setIsSwappingPaused(false)}
            >
              <div className="cards-header-controls font-sans">
                <span className="swap-indicator">
                  CARD {String(activeIngredientIndex + 1).padStart(2, "0")} / 05
                  {isSwappingPaused ? " [PAUSED]" : " [LOOP SWAPPING]"}
                </span>

                <div className="swap-nav-btns">
                  <button
                    type="button"
                    className="swap-btn"
                    onClick={handlePrevIngredient}
                    title="Previous Card"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="swap-btn"
                    onClick={handleNextIngredient}
                    title="Next Card"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Stacked Red Card Carousel */}
              <div className="cards-stack-container">
                {INGREDIENTS_DATA.map((item, index) => {
                  // Calculate relative offset from active index for 3D card swap stack
                  const total = INGREDIENTS_DATA.length;
                  const offset = (index - activeIngredientIndex + total) % total;

                  let stackClass = "card-hidden";
                  if (offset === 0) stackClass = "card-active";
                  else if (offset === 1) stackClass = "card-next-1";
                  else if (offset === 2) stackClass = "card-next-2";
                  else if (offset === total - 1) stackClass = "card-prev";

                  return (
                    <div
                      key={item.id}
                      className={`ingredient-card-red glass-panel-red-card ${stackClass}`}
                      onClick={() => setActiveIngredientIndex(index)}
                    >
                      <div className="card-top-row font-sans">
                        <span className="card-id">PILLAR //{item.id}</span>
                        <span className="card-badge">{item.badge}</span>
                      </div>

                      <h3 className="card-title font-display red-card-title">
                        {item.name}
                      </h3>

                      <p className="card-desc font-sans red-card-desc">
                        {item.desc}
                      </p>

                      <div className="card-meta-row font-sans">
                        <span>{item.meta}</span>
                        <span className="card-detail-tag">{item.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Dots */}
              <div className="cards-dots-row">
                {INGREDIENTS_DATA.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`card-dot ${i === activeIngredientIndex ? "active" : ""}`}
                    onClick={() => setActiveIngredientIndex(i)}
                  />
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: WHY PRIP (WHY IT WINS)                              */}
      {/* ------------------------------------------------------------- */}
      <section id="why-us" className="section-block why-section pitch-black-bg">
        <ScrollVelocity
          texts={['PRIRP', 'LET IT OUT', 'PRIRP', 'LET IT OUT']} 
          velocity={80}
          className="custom-scroll-text"
          numCopies={12}
          damping={50}
          stiffness={400}
        />
        <div className="section-container">
          <div className="section-header">
            <div className="section-tag font-sans">
              [ 04 // COMPARATIVE ADVANTAGE ]
            </div>
            <h2 className="why-devotion-title">
              Why Prirp Wins?
            </h2>
            <p className="section-subtitle font-sans red-text-subtle">
              Compare the science behind PRIRP with conventional commodity energy drinks.
            </p>
          </div>

          <div className="why-pillars-grid">
            <div className="why-pillar glass-panel-red">
              <span className="pillar-tag font-sans">[ 01 ]</span>
              <h3 className="pillar-heading font-display red-text">THE ENERGY WITHIN</h3>
              <div className="pillar-body font-sans red-text-subtle">
                <p>There’s a point when you feel like you have nothing left, yet still take one more step.</p>
                <p>That’s what PRIRP is about.</p>
                <p>The strength to keep going was always within you. PRIRP is made for the moment you stop looking outside yourself and find it within.</p>
                <p className="pillar-highlight">Your strongest energy is your own.</p>
              </div>
            </div>

            <div className="why-pillar glass-panel-red">
              <span className="pillar-tag font-sans">[ 02 ]</span>
              <h3 className="pillar-heading font-display red-text">A TASTE WITH A SOUL</h3>
              <div className="pillar-body font-sans red-text-subtle">
                <p>Ever taste something you can’t put into words?</p>
                <p>That’s where PRIRP begins.</p>
                <p>We created a taste with its own character—something you experience first and understand later.</p>
                <p className="pillar-highlight">The recipe stays with us. The experience belongs to you.</p>
              </div>
            </div>

            <div className="why-pillar glass-panel-red">
              <span className="pillar-tag font-sans">[ 03 ]</span>
              <h3 className="pillar-heading font-display red-text">BELIEVE. THEN PRIRP.</h3>
              <div className="pillar-body font-sans red-text-subtle">
                <p>Everyone has a moment when they want to give up.</p>
                <p>Maybe it’s a long night, a distant dream, or simply a difficult day.</p>
                <p>Then comes the voice that says, “One more time.”</p>
                <p>That voice is PRIRP.</p>
                <p>Not a miracle—just the part of you that refuses to stop believing.</p>
                <p className="pillar-highlight">Believe in what’s already within you. Then PRIRP.</p>
              </div>
            </div>
          </div>

          {/* Section 4 Concluding Tagline */}
          <div className="why-footer-tagline">
            <span className="why-tagline-text font-display">
              PRIRP — What’s within, comes alive.
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: VIP ACCESS & EDITORIAL FOOTER (RETAINED SAME)      */}
      {/* ------------------------------------------------------------- */}
      <section className="section-block newsletter-section pitch-black-bg">
        <div className="section-container newsletter-full-container">
          <div className="newsletter-wrapper">
            <div className="newsletter-text-col">
              <h3 className="newsletter-heading font-display red-text">
                JOIN THE PRIRP COLLECTIVE
              </h3>
              <p className="newsletter-desc font-sans red-text-subtle">
                Receive private release drop notifications, tournament athlete sponsorships, and exclusive direct-to-door access.
              </p>
            </div>

            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                placeholder="YOUR EMAIL ADDRESS"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="newsletter-field font-sans"
              />
              <button type="submit" className="btn-primary font-sans newsletter-submit-btn">
                {subscribed ? "UNLOCKED ✓" : "SUBSCRIBE"}
              </button>
            </form>
          </div>

          {/* Minimal Editorial Footer (UNCHANGED) */}
          <footer className="editorial-footer">
            <div className="footer-main">
              <div className="footer-brand-info">
                <PrirqLogo size="small" />
                <p className="footer-brand-tagline font-sans">
                  Sub-zero glacial power. Engineered for high performance.
                </p>
              </div>

              <div className="footer-links-grid font-sans">
                <div className="footer-column">
                  <span className="col-header font-sans">NAVIGATION</span>
                  <a href="#product">PRODUCT DETAILS</a>
                  <a href="#story">STORY</a>
                  <a href="#ingredients">INGREDIENTS</a>
                  <a href="#why-us">WHY PRIRP</a>
                </div>

                <div className="footer-column">
                  <span className="col-header font-sans">SOCIAL</span>
                  <a href="#instagram">INSTAGRAM</a>
                  <a href="#x">X (TWITTER)</a>
                  <a href="#tiktok">TIKTOK</a>
                  <a href="#youtube">YOUTUBE</a>
                </div>

                <div className="footer-column">
                  <span className="col-header font-sans">SUPPORT</span>
                  <a href="#contact">CONTACT</a>
                  <a href="#shipping">SHIPPING & FAQ</a>
                  <a href="#terms">TERMS OF SERVICE</a>
                  <a href="#privacy">PRIVACY</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom-row font-sans">
              <span>© {new Date().getFullYear()} PRIRP ENERGY INC. ALL RIGHTS RESERVED.</span>
              
              <button
                type="button"
                className="back-to-top-btn font-sans"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <span>BACK TO TOP</span>
                <span>↑</span>
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
