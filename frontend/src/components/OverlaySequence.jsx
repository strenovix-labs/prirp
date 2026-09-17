import { fetchProducts } from "../api/client";
import { useState } from "react";
import "./OverlaySequence.css";

export const FLAVORS = [
  {
    id: "crimson",
    name: "Crimson Fury",
    badge: "Wild Berry & Blood Orange",
    origin: "Wild mountain berries & Sicilian blood orange",
    color: "#e63946",
    tagColor: "rgba(230, 57, 70, 0.18)",
    textColor: "#ff4d5a",
    flavorNotes: ["Wild Cranberry", "Blood Orange", "Tart Hibiscus"],
    caffeine: "180mg",
    sugar: "0g",
    calories: "5 kcal",
  },
  {
    id: "frost",
    name: "Frost Surge",
    badge: "Arctic Lime & Spearmint",
    origin: "Zesty, cool glacier limes with crisp iced spearmint",
    color: "#ff2a3b",
    tagColor: "rgba(255, 42, 59, 0.18)",
    textColor: "#ff4d5a",
    flavorNotes: ["Mexican Lime", "Crushed Mint", "Glacial Mist"],
    caffeine: "180mg",
    sugar: "0g",
    calories: "5 kcal",
  },
  {
    id: "solar",
    name: "Solar Blast",
    badge: "Tropical Mango Dragonfruit",
    origin: "Exotic, juicy mangoes paired with sun-ripened dragonfruit",
    color: "#e63946",
    tagColor: "rgba(230, 57, 70, 0.18)",
    textColor: "#ff4d5a",
    flavorNotes: ["Alphonso Mango", "Pink Dragonfruit", "Passionfruit"],
    caffeine: "180mg",
    sugar: "0g",
    calories: "5 kcal",
  },
  {
    id: "midnight",
    name: "Midnight Eclipse",
    badge: "Blackberry & Acai",
    origin: "Deep antioxidant-rich wild blackberries & organic acai",
    color: "#ff2a3b",
    tagColor: "rgba(255, 42, 59, 0.18)",
    textColor: "#ff4d5a",
    flavorNotes: ["Dark Blackberry", "Amazonian Acai", "Blue Agave"],
    caffeine: "180mg",
    sugar: "0g",
    calories: "5 kcal",
  },
  {
    id: "glitch",
    name: "Zero Glitch",
    badge: "Pure Sub-Zero Original",
    origin: "Signature iced crystalline charge with laser focus matrix",
    color: "#e63946",
    tagColor: "rgba(230, 57, 70, 0.18)",
    textColor: "#ff4d5a",
    flavorNotes: ["Crisp Glacier", "Citrus Spark", "Pure Ginseng"],
    caffeine: "180mg",
    sugar: "0g",
    calories: "5 kcal",
  },
];

export default function OverlaySequence({
  progress = 0,
  activeFlavorIndex = 0,
  onSelectFlavor,
}) {
  const [drinkPrices, setDrinkPrices] = useState({ "12pack": 29.99, "24pack": 54.99 });
  const [selectedPack, setSelectedPack] = useState("24pack");

  useEffect(() => {
    fetchProducts("drinks").then((res) => {
      if (res && res.success && Array.isArray(res.data)) {
        const prices = { "12pack": 29.99, "24pack": 54.99 };
        res.data.forEach((p) => {
          if (p.id === "12pack" || p.sku?.includes("12PK")) prices["12pack"] = p.numeric_price;
          if (p.id === "24pack" || p.sku?.includes("24PK")) prices["24pack"] = p.numeric_price;
        });
        setDrinkPrices(prices);
      }
    });
  }, []);
  const [emailInput, setEmailInput] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // Helper to calculate opacity and transforms based on scroll progress window
  const getStageStyle = (start, peakStart, peakEnd, end) => {
    let opacity = 0;
    let translateY = 30;

    if (progress >= start && progress <= end) {
      if (progress < peakStart) {
        // Fading in
        const ratio = (progress - start) / (peakStart - start);
        opacity = ratio;
        translateY = 30 * (1 - ratio);
      } else if (progress <= peakEnd) {
        // Fully visible
        opacity = 1;
        translateY = 0;
      } else {
        // Fading out
        const ratio = (end - progress) / (end - peakEnd);
        opacity = ratio;
        translateY = -30 * (1 - ratio);
      }
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translate3d(0, ${translateY}px, 0)`,
      pointerEvents: opacity > 0.3 ? "auto" : "none",
      visibility: opacity > 0.01 ? "visible" : "hidden",
    };
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubmitted(true);
      setTimeout(() => setNewsletterSubmitted(false), 4000);
      setEmailInput("");
    }
  };

  const handleAddToCart = () => {
    setCartModalOpen(true);
  };

  const currentFlavor = FLAVORS[activeFlavorIndex] || FLAVORS[0];

  return (
    <div className="overlay-sequence-root">
      {/* ------------------------------------------------------------- */}
      {/* STAGE 1: FREEZE / HERO (Progress 0.00 - 0.24)                 */}
      {/* ------------------------------------------------------------- */}
      <div
        className="overlay-stage stage-freeze"
        style={getStageStyle(0.0, 0.04, 0.16, 0.24)}
      >
        {/* Kinetic Horizontal Background Heading */}
        <div
          className="stage-bg-text-marquee font-display"
          style={{
            transform: `translateX(${-progress * 280}px)`,
          }}
        >
          <span>SUB-ZERO POWER • 0G SUGAR • RAW FOCUS • PURE ENERGY •</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="hero-center-content">
          <div className="hero-badge font-mono">
            <span className="ice-dot"></span>
            <span>SUB-ZERO ENERGY MATRIX</span>
          </div>
          <h1 className="hero-main-title font-display">
            FROZEN IN TIME.<br />
            <span className="text-glow-gradient">UNLEASHED IN SIPS.</span>
          </h1>
          <p className="hero-subtext font-sans">
            Crafted from high-grade natural botanicals, pure glacial minerals, and zero sugar.
            Engineered for elite flow state with zero crash.
          </p>
        </div>

        {/* 4 Floating Badges around Ice Block */}
        <div className="floating-badges-container">
          <div className="floating-badge badge-top-left glass-panel">
            <span className="badge-icon">⚡</span>
            <div className="badge-content font-mono">
              <strong>180MG CAFFEINE</strong>
              <span>Organic Green Tea</span>
            </div>
          </div>

          <div className="floating-badge badge-top-right glass-panel">
            <span className="badge-icon">🧊</span>
            <div className="badge-content font-mono">
              <strong>ZERO SUGAR</strong>
              <span>Zero Bitter Acidity</span>
            </div>
          </div>

          <div className="floating-badge badge-bottom-left glass-panel">
            <span className="badge-icon">🏔️</span>
            <div className="badge-content font-mono">
              <strong>GLACIAL MINERALS</strong>
              <span>Rapid Hydration</span>
            </div>
          </div>

          <div className="floating-badge badge-bottom-right glass-panel">
            <span className="badge-icon">🌿</span>
            <div className="badge-content font-mono">
              <strong>L-THEANINE + B12</strong>
              <span>Laser Focus State</span>
            </div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <div className="scroll-indicator font-mono">
          <span className="scroll-text">SCROLL TO SHATTER</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STAGE 2: SHATTER / BREAKOUT (Progress 0.24 - 0.48)            */}
      {/* ------------------------------------------------------------- */}
      <div
        id="shatter-stage"
        className="overlay-stage stage-shatter"
        style={getStageStyle(0.24, 0.28, 0.42, 0.48)}
      >
        <div className="shatter-header">
          <span className="font-mono stage-tag">(02 / BREAKOUT)</span>
          <h2 className="stage-title font-display">
            SHATTER THE ORDINARY.
          </h2>
          <p className="stage-desc font-sans">
            The ice fractures as raw potential breaks free. Discover the three pillars of sub-zero performance.
          </p>
        </div>

        {/* Floating Feature Pillars */}
        <div className="shatter-pillars-grid">
          <div className="pillar-card glass-panel glass-panel-hover">
            <div className="pillar-index font-mono">01 // PURITY</div>
            <h3 className="pillar-title font-display">Sub-Zero Extraction</h3>
            <p className="pillar-text font-sans">
              Cold-processed at -4°C to preserve bioactive antioxidants and delicate botanical essences without heat degradation.
            </p>
            <div className="pillar-stat font-mono">
              <span>ACTIVE CATECHINS</span>
              <strong>99.8%</strong>
            </div>
          </div>

          <div className="pillar-card glass-panel glass-panel-hover pillar-highlight">
            <div className="pillar-index font-mono">02 // BALANCE</div>
            <h3 className="pillar-title font-display">The Golden Ratio</h3>
            <p className="pillar-text font-sans">
              2:1 synergy of L-Theanine and natural caffeine guarantees a calm, sustained surge of hyper-focus with no jitters or crash.
            </p>
            <div className="pillar-stat font-mono">
              <span>FLOW STATE INDEX</span>
              <strong>+240%</strong>
            </div>
          </div>

          <div className="pillar-card glass-panel glass-panel-hover">
            <div className="pillar-index font-mono">03 // FLOW</div>
            <h3 className="pillar-title font-display">Glacial Electrolytes</h3>
            <p className="pillar-text font-sans">
              Infused with bioavailable Himalayan salt, magnesium malate, and potassium citrate for instantaneous cellular rehydration.
            </p>
            <div className="pillar-stat font-mono">
              <span>ABSORPTION SPEED</span>
              <strong>3X FASTER</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STAGE 3: THE 5 FLAVORS CAROUSEL (Progress 0.48 - 0.72)        */}
      {/* ------------------------------------------------------------- */}
      <div
        id="flavors-stage"
        className="overlay-stage stage-flavors"
        style={getStageStyle(0.48, 0.52, 0.68, 0.72)}
      >
        <div className="flavors-container">
          <div className="flavors-header">
            <span className="font-mono stage-tag">(03 / SPECTRUM)</span>
            <h2 className="stage-title font-display">
              THE 5 SUB-ZERO FLAVORS
            </h2>
            <p className="stage-desc font-sans">
              Pure natural fruit essences pressed with glacial water. Select a flavor to explore its profile.
            </p>
          </div>

          {/* Flavor Selection Pills Bar */}
          <div className="flavor-tabs">
            {FLAVORS.map((flavor, idx) => (
              <button
                key={flavor.id}
                className={`flavor-tab-btn font-mono ${
                  activeFlavorIndex === idx ? "active" : ""
                }`}
                style={{
                  borderColor:
                    activeFlavorIndex === idx ? flavor.color : "rgba(255,255,255,0.12)",
                  boxShadow:
                    activeFlavorIndex === idx
                      ? `0 0 20px ${flavor.color}40, inset 0 0 10px ${flavor.color}20`
                      : "none",
                }}
                onClick={() => onSelectFlavor && onSelectFlavor(idx)}
              >
                <span
                  className="flavor-color-dot"
                  style={{ background: flavor.color }}
                />
                <span className="flavor-tab-name">{flavor.name}</span>
              </button>
            ))}
          </div>

          {/* Active Flavor Spotlight Glass Card */}
          <div className="flavor-card-spotlight glass-panel">
            <div className="flavor-card-left">
              <div
                className="flavor-badge-pill font-mono"
                style={{
                  background: currentFlavor.tagColor,
                  color: currentFlavor.textColor,
                  border: `1px solid ${currentFlavor.color}60`,
                }}
              >
                {currentFlavor.badge}
              </div>
              <h3 className="flavor-name font-display" style={{ color: "#ffffff" }}>
                {currentFlavor.name}
              </h3>
              <p className="flavor-origin font-sans">{currentFlavor.origin}</p>

              {/* Tasting Notes */}
              <div className="tasting-notes">
                <span className="tasting-label font-mono">TASTING NOTES:</span>
                <div className="notes-list">
                  {currentFlavor.flavorNotes.map((note) => (
                    <span
                      key={note}
                      className="note-chip font-mono"
                      style={{ borderColor: `${currentFlavor.color}50` }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flavor-card-right">
              <div className="specs-grid font-mono">
                <div className="spec-item">
                  <span className="spec-title">CAFFEINE</span>
                  <span className="spec-val" style={{ color: currentFlavor.textColor }}>
                    {currentFlavor.caffeine}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-title">SUGAR</span>
                  <span className="spec-val" style={{ color: currentFlavor.textColor }}>
                    {currentFlavor.sugar}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-title">CALORIES</span>
                  <span className="spec-val" style={{ color: currentFlavor.textColor }}>
                    {currentFlavor.calories}
                  </span>
                </div>
              </div>

              <button
                className="btn-primary font-mono flavor-cta"
                onClick={handleAddToCart}
              >
                TRY {currentFlavor.name.toUpperCase()} ⚡
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STAGE 4: INGREDIENTS & CRAFT (Progress 0.72 - 0.88)           */}
      {/* ------------------------------------------------------------- */}
      <div
        id="ingredients-stage"
        className="overlay-stage stage-ingredients"
        style={getStageStyle(0.72, 0.76, 0.85, 0.88)}
      >
        <div className="ingredients-container">
          <div className="ingredients-header">
            <span className="font-mono stage-tag">(04 / INGREDIENTS & CRAFT)</span>
            <h2 className="stage-title font-display">
              A TASTE ABOVE THE REST.
            </h2>
            <p className="stage-desc font-sans">
              Precision crafted for effortless smoothness and supreme functionality.
            </p>
          </div>

          <div className="ingredients-3col-grid">
            {/* Column 1: Natural Ingredients */}
            <div className="craft-card glass-panel glass-panel-hover">
              <div className="craft-badge font-mono">01 // INGREDIENTS</div>
              <h3 className="craft-card-title font-display">
                High Quality Natural Ingredients
              </h3>
              <p className="craft-card-text font-sans">
                Crafted from the finest all-natural botanical extracts and organic tea leaves, ensuring an invigorating experience with every sip. With absolutely zero added sugars and no artificial colors, it bursts with crisp, revitalizing flavor.
              </p>
              <div className="craft-card-tags font-mono">
                <span>NON-GMO</span>
                <span>ORGANIC</span>
                <span>VEGAN</span>
              </div>
            </div>

            {/* Column 2: Smoothness & Aftertaste */}
            <div className="craft-card glass-panel glass-panel-hover">
              <div className="craft-badge font-mono">02 // SMOOTHNESS</div>
              <h3 className="craft-card-title font-display">
                Smoothness & Zero Acidity
              </h3>
              <p className="craft-card-text font-sans">
                Our drink boasts an exceptionally smooth profile, free from harsh acidic bite or chemical aftertastes. Taste a delicate balance of crisp flavors, ensuring a refined and deeply satisfying tasting experience from first crack to last sip.
              </p>
              <div className="craft-card-tags font-mono">
                <span>PH 6.8 BALANCED</span>
                <span>NO SOUR BITE</span>
              </div>
            </div>

            {/* Column 3: Tactical Can Design */}
            <div className="craft-card glass-panel glass-panel-hover">
              <div className="craft-badge font-mono">03 // PACKAGING</div>
              <h3 className="craft-card-title font-display">
                Ergonomic Tactical Can Design
              </h3>
              <p className="craft-card-text font-sans">
                Introducing an engineered 330ml slim can with thermo-tactile matte grip that fits perfectly in your hand. The sleek sub-zero look enhances your sensory experience while locking in carbonation and iced temperature longer.
              </p>
              <div className="craft-card-tags font-mono">
                <span>100% RECYCLABLE</span>
                <span>COLD-LOCK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STAGE 5: SHOP, PACK SELECTOR & FOOTER (Progress 0.88 - 1.00)  */}
      {/* ------------------------------------------------------------- */}
      <div
        id="shop-stage"
        className="overlay-stage stage-shop"
        style={getStageStyle(0.88, 0.92, 1.0, 1.0)}
      >
        <div className="shop-container">
          <div className="shop-hero">
            <span className="font-mono stage-tag">(05 / UNLEASH)</span>
            <h2 className="stage-title font-display">
              READY TO BREAK THE ICE?
            </h2>
            <p className="stage-desc font-sans">
              Choose your supply. Ice-cold delivery straight to your doorstep in 48 hours.
            </p>
          </div>

          {/* Pack Selection Cards */}
          <div className="packs-grid">
            <div
              className={`pack-card glass-panel ${
                selectedPack === "12pack" ? "selected" : ""
              }`}
              onClick={() => setSelectedPack("12pack")}
            >
              <div className="pack-header">
                <span className="pack-type font-mono">12-PACK</span>
                <span className="pack-price font-display">${drinkPrices["12pack"].toFixed(2)}</span>
              </div>
              <h4 className="pack-name font-display">Starter Vault</h4>
              <p className="pack-desc font-sans">
                12 cans of your favorite flavor. Ideal for daily laser focus and pre-workout clarity.
              </p>
              <button
                className="btn-secondary font-mono pack-btn"
                onClick={handleAddToCart}
              >
                SELECT 12-PACK
              </button>
            </div>

            <div
              className={`pack-card glass-panel pack-featured ${
                selectedPack === "24pack" ? "selected" : ""
              }`}
              onClick={() => setSelectedPack("24pack")}
            >
              <div className="pack-ribbon font-mono">MOST POPULAR • FREE SHIP</div>
              <div className="pack-header">
                <span className="pack-type font-mono">24-PACK</span>
                <span className="pack-price font-display">${drinkPrices["24pack"].toFixed(2)}</span>
              </div>
              <h4 className="pack-name font-display">Pro Supply Vault</h4>
              <p className="pack-desc font-sans">
                24 cans with maximum savings. Includes free insulated sub-zero tote and fast track delivery.
              </p>
              <button
                className="btn-primary font-mono pack-btn"
                onClick={handleAddToCart}
              >
                ORDER 24-PACK ⚡
              </button>
            </div>

            <div
              className={`pack-card glass-panel ${
                selectedPack === "variety" ? "selected" : ""
              }`}
              onClick={() => setSelectedPack("variety")}
            >
              <div className="pack-header">
                <span className="pack-type font-mono">VARIETY BOX</span>
                <span className="pack-price font-display">$34.99</span>
              </div>
              <h4 className="pack-name font-display">5-Flavor Spectrum</h4>
              <p className="pack-desc font-sans">
                Experience all 5 flavors (15 cans total). Perfect for finding your signature cold energy profile.
              </p>
              <button
                className="btn-secondary font-mono pack-btn"
                onClick={handleAddToCart}
              >
                SELECT VARIETY
              </button>
            </div>
          </div>

          {/* Newsletter Signup Pill */}
          <div className="newsletter-card glass-panel">
            <div className="newsletter-left">
              <h3 className="newsletter-title font-display">SUB-ZERO VIP ACCESS</h3>
              <p className="newsletter-text font-sans">
                Get notified for limited drop flavors, tournament sponsorships, and exclusive member discounts.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                required
                placeholder="ENTER YOUR EMAIL ADDRESS"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="newsletter-input font-mono"
              />
              <button type="submit" className="btn-primary font-mono">
                {newsletterSubmitted ? "UNLOCKED ✓" : "SUBSCRIBE"}
              </button>
            </form>
          </div>

          {/* Footer matching Drink Zoi Style */}
          <footer className="zoi-footer">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="footer-logo-grid font-display">
                  <span>PRIP ENERGY CO.</span>
                </div>
                <p className="footer-tagline font-sans">
                  The ultimate sub-zero energy experience. 0g Sugar. Pure focus.
                </p>
              </div>

              <div className="footer-nav-groups">
                <div className="footer-col font-mono">
                  <span className="footer-col-title">NAVIGATION</span>
                  <a href="#hero-stage">FREEZE (HOME)</a>
                  <a href="#shatter-stage">SHATTER (PRODUCT)</a>
                  <a href="#flavors-stage">UNLEASH (FLAVORS)</a>
                  <a href="#ingredients-stage">FUEL (INGREDIENTS)</a>
                </div>

                <div className="footer-col font-mono">
                  <span className="footer-col-title">COMMUNITY</span>
                  <a href="#instagram">INSTAGRAM</a>
                  <a href="#twitter">X (TWITTER)</a>
                  <a href="#tiktok">TIKTOK</a>
                  <a href="#discord">DISCORD LOUNGE</a>
                </div>

                <div className="footer-col font-mono">
                  <span className="footer-col-title">SUPPORT</span>
                  <a href="#faq">FAQ & SHIPPING</a>
                  <a href="#stockists">FIND A RETAILER</a>
                  <a href="#contact">CONTACT LABS</a>
                  <a href="#terms">TERMS & PRIVACY</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <span className="font-mono copyright-text">
                © {new Date().getFullYear()} PRIP ENERGY INC. ALL RIGHTS RESERVED.
              </span>

              <button
                className="return-top-btn font-mono"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <span>RETURN TO SUB-ZERO</span>
                <span>↑</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Quick Checkout / Cart Confirmation Modal */}
      {cartModalOpen && (
        <div className="cart-modal-backdrop" onClick={() => setCartModalOpen(false)}>
          <div className="cart-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title font-display">ORDER INITIATED ⚡</span>
              <button className="modal-close" onClick={() => setCartModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body font-sans">
              <p>
                <strong>{selectedPack.toUpperCase()}</strong> ({currentFlavor.name}) has been added to your cold queue!
              </p>
              <div className="modal-perks font-mono">
                <span>✓ FREE 48H COLD SHIP</span>
                <span>✓ 100% SATISFACTION GUARANTEE</span>
                <span>✓ 0G SUGAR GLACIAL FORMULA</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary font-mono modal-checkout-btn"
                onClick={() => {
                  alert("Redirecting to Sub-Zero Secure Express Checkout...");
                  setCartModalOpen(false);
                }}
              >
                PROCEED TO CHECKOUT →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
