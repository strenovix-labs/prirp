import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PrirqLogo from "../components/PrirqLogo";
import ProductSummaryModal from "../components/ProductSummaryModal";
import ElectricBorder from "../components/ElectricBorder";
import { useCart } from "../context/CartContext";
import "./Merchandise.css";

const PRODUCTS = [
  {
    id: "sig-tee",
    name: "PRIRP Signature Tee",
    category: "tees",
    categoryLabel: "CORE TEE",
    price: "$45.00",
    numericPrice: 45,
    inrPrice: "₹2,499",
    tag: "BESTSELLER",
    image: "/merch/tee-signature.jpg",
    description: "Minimalist chest typographic branding on ultra-heavy combed cotton. Built for daily wear with zero sag.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Obsidian Black", "Void Black"],
    gsm: "260 GSM Heavyweight",
  },
  {
    id: "over-tee",
    name: "PRIRP Oversized Tee",
    category: "tees",
    categoryLabel: "STREETWEAR",
    price: "$48.00",
    numericPrice: 48,
    inrPrice: "₹2,699",
    tag: "BOXY FIT",
    image: "/merch/tee-oversized.jpg",
    description: "Drop-shoulder relaxed silhouette with metallic chrome-red back neckline insignia. Washed vintage feel.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Washed Charcoal", "Matte Black"],
    gsm: "280 GSM Vintage Wash",
  },
  {
    id: "energy-cap",
    name: "PRIRP Energy Cap",
    category: "accessories",
    categoryLabel: "HEADWEAR",
    price: "$35.00",
    numericPrice: 35,
    inrPrice: "₹1,999",
    tag: "TACTICAL",
    image: "/merch/cap-energy.jpg",
    description: "6-panel technical curved brim with 3D chrome-red embroidery and metallic reflective under-visor.",
    sizes: ["ONE SIZE"],
    colors: ["Obsidian Black"],
    gsm: "Cordura Tech Nylon",
  },
  {
    id: "train-tee",
    name: "PRIRP Training Tee",
    category: "tees",
    categoryLabel: "ATHLETIC",
    price: "$42.00",
    numericPrice: 42,
    inrPrice: "₹2,299",
    tag: "AERO-VENT",
    image: "/merch/tee-training.jpg",
    description: "High-mobility moisture-wicking technical weave with laser-cut side ventilation and chrome-red athletic panels.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cyber Black"],
    gsm: "180 GSM Pro-Dry",
  },
];

export default function Merchandise({ onOpenCheckout }) {
  const { addToCart, openCart } = useCart();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [featuredSize, setFeaturedSize] = useState("L");
  const [summaryProduct, setSummaryProduct] = useState(null);
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  // Jersey Personalization States
  const [jerseyName, setJerseyName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [previewView, setPreviewView] = useState("front"); // "front" | "back"

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleJerseyNameChange = (e) => {
    const rawVal = e.target.value;
    const filtered = rawVal.replace(/[^a-zA-Z\s]/g, "").slice(0, 12);
    setJerseyName(filtered);

    if (filtered.trim().length > 0 || jerseyNumber.trim().length > 0) {
      setPreviewView("back");
    } else {
      setPreviewView("front");
    }
  };

  const handleJerseyNumberChange = (e) => {
    const rawVal = e.target.value;
    const filtered = rawVal.replace(/[^0-9]/g, "").slice(0, 3);
    setJerseyNumber(filtered);

    if (filtered.trim().length > 0 || jerseyName.trim().length > 0) {
      setPreviewView("back");
    } else {
      setPreviewView("front");
    }
  };

  const handleToggleView = (view, e) => {
    if (e) e.stopPropagation();
    setPreviewView(view);
  };

  const handleAddToCart = (product, size, customization = null) => {
    const chosenSize = size || selectedSizes[product.id] || product.sizes[0];
    addToCart(product, chosenSize, 1, customization);

    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const handleOpenSummary = (product) => {
    setSummaryProduct(product);
  };

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const previewName = jerseyName.trim().toUpperCase();
  const previewNumber = jerseyNumber.trim();
  const hasPersonalization = previewName.length > 0 || previewNumber.length > 0;

  return (
    <div className="merchandise-page">
      {/* Product Summary Modal */}
      <ProductSummaryModal
        product={summaryProduct}
        isOpen={!!summaryProduct}
        onClose={() => setSummaryProduct(null)}
      />

      {/* Ticker / Cyber Announcement Bar */}
      <div className="merch-ticker-bar font-mono">
        <div className="ticker-track">
          <span>DROP 01 // SUB-ZERO TECHNICAL APPAREL</span>
          <span>FREE WORLDWIDE REFRIGERATED SHIPPING</span>
          <span>HEAVYWEIGHT COMBED COTTON</span>
          <span>USE CODE "PRIRP10" FOR 10% OFF</span>
          <span>DROP 01 // SUB-ZERO TECHNICAL APPAREL</span>
          <span>ENGINEERED FOR MOVEMENT</span>
        </div>
      </div>

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="merch-hero-section">
        <div className="merch-hero-image-wrapper">
          <img
            src="/SANJAY/5.png"
            alt="PRIRP Merchandise Collection"
            className="merch-hero-full-img"
          />
        </div>
      </section>

      {/* =========================================================================
          FEATURED MERCHANDISE SECTION: THE PRIRP ESSENTIAL
          ========================================================================= */}
      <section className="merch-featured-section">
        <div className="section-container">
          <div className="featured-section-header">
            <span className="featured-tag font-mono">FLAGSHIP CAPSULE</span>
            <h2 className="featured-main-heading font-display">
              THE PRIRP <span className="cursive-highlight">Essential</span>
            </h2>
          </div>

          <div className="featured-card glass-panel">
            {/* Left: Large Product Image Showcase */}
            <div className="featured-image-col">
              <div
                className="featured-image-frame"
                onClick={() =>
                  handleOpenSummary({
                    id: "essential-tee",
                    name: "PRIRP Cyber Thermal Essential Tee",
                    categoryLabel: "FLAGSHIP CAPSULE",
                    price: "$48.00",
                    numericPrice: 48,
                    inrPrice: "₹2,699",
                    tag: "LIMITED // 500 UNITS",
                    image: "/merch/featured-essential.jpg",
                    description:
                      "Custom 280GSM heavyweight combed cotton featuring our liquid chrome-red energy symbol, reinforced rib collar, and laser-bonded hem tags.",
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    gsm: "280 GSM Heavyweight Organic",
                  })
                }
              >
                {/* Front Image */}
                <img
                  src="/merch/featured-essential.jpg"
                  alt="PRIRP Cyber Heavyweight Essential Tee Front"
                  className={`featured-product-img front-view-img ${
                    previewView === "front" ? "active" : "inactive"
                  }`}
                />

                {/* Back Image */}
                <img
                  src="/merch/featured-essential-back.jpg"
                  alt="PRIRP Cyber Heavyweight Essential Tee Back"
                  className={`featured-product-img back-view-img ${
                    previewView === "back" ? "active" : "inactive"
                  }`}
                />

                {/* Real-Time Personalization Overlay on Back Shirt */}
                {previewView === "back" && hasPersonalization && (
                  <div
                    className={`jersey-personalization-overlay ${
                      previewName ? "has-name" : "number-only"
                    }`}
                    aria-hidden="true"
                  >
                    {previewName && (
                      <div className="jersey-name-print">
                        {previewName}
                      </div>
                    )}
                    {previewNumber && (
                      <div className="jersey-number-print">
                        {previewNumber}
                      </div>
                    )}
                  </div>
                )}

                <div className="featured-img-badge font-mono">
                  <span>LIMITED DROP</span>
                  <span>500 UNITS</span>
                </div>

                {/* Front / Back Toggle Buttons */}
                <div
                  className="preview-view-toggle font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={`preview-toggle-btn ${
                      previewView === "front" ? "active" : ""
                    }`}
                    onClick={(e) => handleToggleView("front", e)}
                    aria-label="View front of shirt"
                  >
                    FRONT
                  </button>
                  <button
                    type="button"
                    className={`preview-toggle-btn ${
                      previewView === "back" ? "active" : ""
                    }`}
                    onClick={(e) => handleToggleView("back", e)}
                    aria-label="View back of shirt"
                  >
                    BACK
                  </button>
                </div>

                <span className="featured-quick-inspect font-mono">
                  CLICK TO VIEW FULL SPECS
                </span>
              </div>
            </div>

            {/* Right: Product Details & Summary */}
            <div className="featured-info-col">
              <span className="featured-cat font-mono">LIMITED PRIRP COLLECTION</span>
              <h3 className="featured-product-title font-display">
                PRIRP Cyber Thermal Essential Tee
              </h3>
              <p className="featured-product-desc font-sans">
                Engineered for explosive motion and everyday luxury. Custom 280GSM heavyweight combed cotton featuring our liquid chrome-red energy symbol, reinforced rib collar, and laser-bonded hem tags.
              </p>

              <div className="featured-specs-grid font-mono">
                <div className="spec-item">
                  <span className="spec-label">FABRIC</span>
                  <span className="spec-value">280GSM Combed Cotton</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">FINISH</span>
                  <span className="spec-value">Cold-Dyed Obsidian</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">FIT</span>
                  <span className="spec-value">Relaxed Cyber Boxy</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">EMBELLISHMENT</span>
                  <span className="spec-value">Chrome-Red Liquid Foil</span>
                </div>
              </div>

              {/* Sizing Selector */}
              <div className="featured-size-selector">
                <div className="size-header font-mono">
                  <span>SELECT SIZE:</span>
                  <span className="size-guide-link">TRUE TO SIZE FIT</span>
                </div>
                <div className="size-btn-group">
                  {["S", "M", "L", "XL", "XXL"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`size-btn font-mono ${
                        featuredSize === sz ? "selected" : ""
                      }`}
                      onClick={() => setFeaturedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalization Section */}
              <div className="featured-personalize-section glass-panel">
                <div className="personalize-header font-mono">
                  <div className="personalize-title-group">
                    <span className="personalize-pulse-dot" />
                    <span className="personalize-title">
                      PERSONALIZE YOUR TEE
                    </span>
                  </div>
                  <span className="personalize-status-tag">
                    {hasPersonalization ? "CUSTOM ACTIVE" : "OPTIONAL"}
                  </span>
                </div>

                <div className="personalize-inputs-grid font-mono">
                  {/* Name on Jersey Input */}
                  <div className="personalize-field-block">
                    <label htmlFor="jersey-name" className="personalize-label">
                      <span>NAME ON JERSEY</span>
                      <span className="char-limit">{jerseyName.length}/12</span>
                    </label>
                    <input
                      id="jersey-name"
                      type="text"
                      className="personalize-input"
                      placeholder="ENTER YOUR NAME"
                      value={jerseyName}
                      maxLength={12}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={handleJerseyNameChange}
                    />
                  </div>

                  {/* Jersey Number Input */}
                  <div className="personalize-field-block">
                    <label htmlFor="jersey-number" className="personalize-label">
                      <span>JERSEY NUMBER</span>
                      <span className="char-limit">{jerseyNumber.length}/3</span>
                    </label>
                    <input
                      id="jersey-number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="personalize-input number-field"
                      placeholder="47"
                      value={jerseyNumber}
                      maxLength={3}
                      autoComplete="off"
                      onChange={handleJerseyNumberChange}
                    />
                  </div>
                </div>

                <div className="personalize-helper-row font-mono">
                  <span className="personalize-helper-icon">⚡</span>
                  <span className="personalize-helper-text">
                    LIVE PREVIEW — Your customization appears on the back instantly.
                  </span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="featured-action-row">
                <div className="featured-price-block">
                  <span className="price-usd font-display">$48.00</span>
                  <span className="price-inr font-mono">₹2,699</span>
                </div>

                <div className="featured-btn-group">
                  <button
                    type="button"
                    className="btn-primary featured-shop-btn font-mono"
                    onClick={() =>
                      handleAddToCart(
                        {
                          id: "essential-tee",
                          name: "PRIRP Cyber Thermal Essential Tee",
                          categoryLabel: "FLAGSHIP CAPSULE",
                          price: "$48.00",
                          numericPrice: 48,
                          image: "/merch/featured-essential.jpg",
                          sizes: ["S", "M", "L", "XL", "XXL"],
                        },
                        featuredSize,
                        hasPersonalization
                          ? {
                              nameOnJersey: previewName,
                              jerseyNumber: previewNumber,
                            }
                          : null
                      )
                    }
                  >
                    ADD TO BAG +
                  </button>
                  <button
                    type="button"
                    className="btn-secondary featured-buy-btn font-mono"
                    onClick={() =>
                      handleOpenSummary({
                        id: "essential-tee",
                        name: "PRIRP Cyber Thermal Essential Tee",
                        categoryLabel: "FLAGSHIP CAPSULE",
                        price: "$48.00",
                        numericPrice: 48,
                        inrPrice: "₹2,699",
                        tag: "LIMITED // 500 UNITS",
                        image: "/merch/featured-essential.jpg",
                        description:
                          "Custom 280GSM heavyweight combed cotton featuring our liquid chrome-red energy symbol, reinforced rib collar, and laser-bonded hem tags.",
                        sizes: ["S", "M", "L", "XL", "XXL"],
                        gsm: "280 GSM Heavyweight Organic",
                      })
                    }
                  >
                    SPECS & DETAILS →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================================================
          PRODUCT CATALOG GRID SECTION
          ========================================================================= */}
      <section id="product-grid" className="merch-catalog-section">
        <div className="section-container">
          <div className="catalog-header-row">
            <div className="catalog-title-wrapper">
              {/* Sticker positioned directly behind PRIRP Lineup */}
              <div className="merch-star-sticker-wrapper">
                <img
                  src="/assets/fire-sticker.png"
                  alt="Fire Sticker Graphic"
                  className="merch-star-sticker-img"
                />
              </div>
              <span className="catalog-eyebrow font-mono">ALL DROPS</span>
              <h2 className="catalog-heading font-display">
                PRIRP <span className="cursive-highlight">Lineup</span>
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="category-filter-tabs font-mono">
              {[
                { id: "all", label: "ALL PIECES (4)" },
                { id: "tees", label: "TEES (3)" },
                { id: "accessories", label: "ACCESSORIES (1)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`filter-tab-btn ${
                    activeCategory === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (Responsive: 3 cols desktop, 2 tablet, 1 mobile) */}
          <div className="merch-products-grid">
            {filteredProducts.map((product) => {
              const currentSize =
                selectedSizes[product.id] || product.sizes[0];
              const isAdded = addedAnimationId === product.id;

              return (
                <div key={product.id} className="merch-product-card glass-panel">
                  {/* Top Image Frame (Clickable for Quick View) */}
                  <div
                    className="product-card-media"
                    onClick={() => handleOpenSummary(product)}
                    title="Click for Product Details"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-card-img"
                      loading="lazy"
                    />
                    <span className="product-badge font-mono">{product.tag}</span>
                    <span className="product-gsm-badge font-mono">{product.gsm}</span>
                    <span className="card-hover-inspect font-mono">
                      QUICK VIEW
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="product-card-body">
                    <div className="product-card-meta font-mono">
                      <span className="product-cat-label">{product.categoryLabel}</span>
                      <span className="product-inr-price">{product.inrPrice}</span>
                    </div>

                    <h3
                      className="product-card-title font-display"
                      onClick={() => handleOpenSummary(product)}
                    >
                      {product.name}
                    </h3>

                    <p className="product-card-desc font-sans">
                      {product.description}
                    </p>

                    {/* Sizing Pills on Card */}
                    <div className="product-card-sizes font-mono">
                      <span className="sizes-label">SIZE:</span>
                      <div className="sizes-pill-row">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            className={`card-size-chip ${
                              currentSize === sz ? "active" : ""
                            }`}
                            onClick={() => handleSizeSelect(product.id, sz)}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer / Price & Buttons */}
                    <div className="product-card-footer">
                      <div className="card-price-stack">
                        <span className="card-price-usd font-display">
                          {product.price}
                        </span>
                      </div>

                      <div className="card-actions-group">
                        <button
                          type="button"
                          className="btn-secondary card-details-btn font-mono"
                          onClick={() => handleOpenSummary(product)}
                          title="View product summary and measurements"
                        >
                          SPECS
                        </button>
                        <button
                          type="button"
                          className={`btn-primary card-add-btn font-mono ${
                            isAdded ? "added-state" : ""
                          }`}
                          onClick={() => handleAddToCart(product, currentSize)}
                        >
                          {isAdded ? "ADDED ✓" : "ADD TO BAG +"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          GUARANTEE & PERKS BAR
          ========================================================================= */}
      <section className="merch-perks-section">
        <div className="section-container">
          <div className="perks-grid font-mono glass-panel">
            <div className="perk-item">
              <span className="perk-title">EXPRESS WORLDWIDE DISPATCH</span>
              <span className="perk-desc">Dispatched within 24 hours in insulated packaging</span>
            </div>
            <div className="perk-item">
              <span className="perk-title">AUTHENTIC PRIRP DROP</span>
              <span className="perk-desc">Each piece serialized with verified QR authentication</span>
            </div>
            <div className="perk-item">
              <span className="perk-title">30-DAY EXCHANGE GUARANTEE</span>
              <span className="perk-desc">Hassle-free size replacement and returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MERCHANDISE FOOTER
          ========================================================================= */}
      <footer className="merch-footer">
        <div className="section-container">
          <div className="merch-footer-top">
            <div className="footer-brand-col">
              <PrirqLogo size="small" />
              <p className="footer-tagline font-sans">
                Sub-Zero Glacial Power. Engineered for high performance & culture.
              </p>
            </div>

            <div className="footer-nav-grid font-mono">
              <div className="footer-nav-col">
                <span className="col-heading">NAVIGATION</span>
                <Link to="/">HOME</Link>
                <Link to="/#story">STORY</Link>
                <Link to="/#ingredients">INGREDIENTS</Link>
                <Link to="/#why-us">WHY US</Link>
              </div>

              <div className="footer-nav-col">
                <span className="col-heading">COLLECTIONS</span>
                <a href="#product-grid" onClick={() => setActiveCategory("all")}>ALL MERCH</a>
                <a href="#product-grid" onClick={() => setActiveCategory("tees")}>TEES & TOPS</a>
                <a href="#product-grid" onClick={() => setActiveCategory("accessories")}>CAPS & GEAR</a>
              </div>

              <div className="footer-nav-col">
                <span className="col-heading">PRIRP GLOBAL</span>
                <a href="#tokyo">TOKYO LAB</a>
                <a href="#nyc">NYC STUDIOS</a>
                <a href="#terms">TERMS OF SERVICE</a>
                <a href="#privacy">PRIVACY POLICY</a>
              </div>
            </div>
          </div>

          <div className="merch-footer-bottom font-mono">
            <span>© {new Date().getFullYear()} PRIRP ENERGY APPAREL DIVISION. ALL RIGHTS RESERVED.</span>
            <button
              type="button"
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              BACK TO TOP ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
