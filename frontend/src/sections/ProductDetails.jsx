import { fetchProducts } from "../api/client";
import { useEffect, useRef, useState, useCallback } from "react";
import "./ProductDetails.css";

const FRAME_COUNT = 50;
const FRAME_PATH = "/Frames/ezgif-4c9006586d2b27a4-jpg/ezgif-frame-";

// Description words and special phrase emphasis tokens
const DESCRIPTION_PARAGRAPH = [
  { text: "Crisp", highlight: false },
  { text: "dark", highlight: "dark berry infusion" },
  { text: "berry", highlight: "dark berry infusion" },
  { text: "infusion", highlight: "dark berry infusion" },
  { text: "with", highlight: false },
  { text: "raw", highlight: false },
  { text: "green", highlight: false },
  { text: "tea", highlight: false },
  { text: "catechins,", highlight: false },
  { text: "2:1", highlight: "L-Theanine" },
  { text: "L-Theanine", highlight: "L-Theanine" },
  { text: "laser", highlight: false },
  { text: "synergy,", highlight: false },
  { text: "and", highlight: false },
  { text: "pure", highlight: false },
  { text: "Himalayan", highlight: false },
  { text: "glacial", highlight: false },
  { text: "electrolytes.", highlight: false },
  { text: "Engineered", highlight: false },
  { text: "for", highlight: false },
  { text: "sustained", highlight: "sustained physical and cognitive stamina" },
  { text: "physical", highlight: "sustained physical and cognitive stamina" },
  { text: "and", highlight: "sustained physical and cognitive stamina" },
  { text: "cognitive", highlight: "sustained physical and cognitive stamina" },
  { text: "stamina", highlight: "sustained physical and cognitive stamina" },
  { text: "with", highlight: false },
  { text: "zero", highlight: "zero crash" },
  { text: "crash.", highlight: "zero crash" },
];

// Math easing & interpolation helpers
const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);

const getProgress = (currentP, startP, endP) => {
  if (endP <= startP) return currentP >= startP ? 1 : 0;
  return clamp((currentP - startP) / (endP - startP), 0, 1);
};

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export default function ProductDetails({ onOpenCheckout }) {
  const [drinkPrices, setDrinkPrices] = useState({ "12pack": 29.99, "24pack": 54.99 });

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
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const rafRef = useRef(null);

  const [selectedPack, setSelectedPack] = useState("24pack");
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(1);
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1

  // Draw 50-frame image to canvas with cover fit & studio tone
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frameIndex)));
    const img = imagesRef.current[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    // Studio tone background - Pitch Black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = width / height;

    let drawW;
    let drawH;

    // Contain calculation to fit 100% of the can inside the canvas wrapper without cropping
    if (imgRatio > containerRatio) {
      drawW = width;
      drawH = width / imgRatio;
    } else {
      drawH = height;
      drawW = height * imgRatio;
    }

    const x = (width - drawW) / 2;
    const y = (height - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);
  }, []);

  // Resize canvas with 2x Retina DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Preload all 50 unboxing frames on mount
  useEffect(() => {
    const images = new Array(FRAME_COUNT);
    imagesRef.current = images;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(3, "0");
      img.src = `${FRAME_PATH}${frameNumber}.jpg`;

      const frameIdx = i - 1;
      images[frameIdx] = img;

      img.onload = () => {
        if (frameIdx === 0 && currentFrameRef.current === 0) {
          drawFrame(0);
        } else if (Math.round(targetFrameRef.current) === frameIdx) {
          drawFrame(frameIdx);
        }
      };

      if (i === 1 && img.complete && img.naturalWidth > 0) {
        drawFrame(0);
      }
    }

    let lastReportedFrame = -1;

    // Smooth RAF animation loop for frame & continuous progress interpolation
    const animate = () => {
      // Interpolate scroll progress
      const pDiff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(pDiff) > 0.0001) {
        currentProgressRef.current += pDiff * 0.35;
        setAnimProgress(currentProgressRef.current);
      }

      // Interpolate canvas frame index
      const fDiff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(fDiff) > 0.002) {
        currentFrameRef.current += fDiff * 0.35;
        const frameToDraw = Math.round(currentFrameRef.current);
        const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, frameToDraw));

        drawFrame(clamped);

        if (clamped !== lastReportedFrame) {
          lastReportedFrame = clamped;
          setCurrentFrameDisplay(clamped + 1);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, resizeCanvas]);

  // Track scroll position strictly across the pinned 500vh container
  useEffect(() => {
    const handleScroll = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalScrollable = track.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) return;

      const scrolledInside = -rect.top;
      let progress = scrolledInside / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));

      targetProgressRef.current = progress;
      targetFrameRef.current = progress * (FRAME_COUNT - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleOrderClick = () => {
    if (onOpenCheckout) {
      onOpenCheckout(selectedPack);
    }
  };

  const p = animProgress; // Current smooth progress (0 to 1)

  // =========================================================================
  // SCROLL-DRIVEN PHYSICAL TRANSFORMATION CALCULATIONS
  // =========================================================================

  // 1. SECTION NAVIGATION (01 UNBOX -> 02 SPECS -> 03 ORDER)
  const navActiveIndex = p < 0.36 ? 1 : p < 0.72 ? 2 : 3;

  // 2. MAIN BRAND TITLE: PRIRP ENERGY (0% - 15%)
  const pripP = getProgress(p, 0.0, 0.14);
  const pripEase = easeOutCubic(pripP);
  const pripWordStyle = {
    opacity: 0.3 + pripEase * 0.7,
    transform: `translate3d(${(1 - pripEase) * -35}px, 0, 0)`,
  };

  const energyP = getProgress(p, 0.02, 0.16);
  const energyEase = easeOutCubic(energyP);
  const energyWordStyle = {
    opacity: 0.3 + energyEase * 0.7,
    transform: `translate3d(${(1 - energyEase) * 35}px, 0, 0)`,
  };

  // 330ML
  const volP = getProgress(p, 0.04, 0.20);
  const volEase = easeOutBack(volP);
  const volStyle = {
    opacity: 0.3 + volP * 0.7,
    transform: `scale(${0.88 + clamp(volEase, 0, 1.05) * 0.12})`,
  };

  // 3. ACTIVE INGREDIENT MATRIX HEADING (18% - 35%)
  const matrixHeadP = getProgress(p, 0.18, 0.35);
  const matrixHeadEase = easeOutCubic(matrixHeadP);
  const matrixHeadingStyle = {
    opacity: 0.35 + matrixHeadEase * 0.65,
    transform: `translate3d(${(1 - matrixHeadEase) * -25}px, 0, 0)`,
  };

  // 4. 2x2 SPECIFICATION GRID (22% - 55%)
  const cafP = getProgress(p, 0.22, 0.42);
  const cafEase = easeOutCubic(cafP);
  const cafStyle = {
    opacity: 0.35 + cafEase * 0.65,
    transform: `translate3d(${(1 - cafEase) * -30}px, 0, 0)`,
  };

  const sugP = getProgress(p, 0.25, 0.45);
  const sugEase = easeOutCubic(sugP);
  const sugStyle = {
    opacity: 0.35 + sugEase * 0.65,
    transform: `translate3d(${(1 - sugEase) * 30}px, 0, 0)`,
  };

  const specVolP = getProgress(p, 0.28, 0.48);
  const specVolEase = easeOutCubic(specVolP);
  const specVolStyle = {
    opacity: 0.35 + specVolEase * 0.65,
    transform: `translate3d(0, ${(1 - specVolEase) * 20}px, 0)`,
  };

  const calP = getProgress(p, 0.30, 0.50);
  const calEase = easeOutCubic(calP);
  const calStyle = {
    opacity: 0.35 + calEase * 0.65,
    transform: `translate3d(0, ${(1 - calEase) * -20}px, 0)`,
  };

  const numP = getProgress(p, 0.30, 0.52);
  const numEase = easeOutBack(numP);
  const numValStyle = {
    transform: `scale(${0.9 + clamp(numEase, 0, 1.05) * 0.1})`,
  };

  const specDescStyle = {};

  // 5. PACK OPTIONS HEADING (42% - 62%)
  const packHeadP = getProgress(p, 0.42, 0.62);
  const packHeadEase = easeOutCubic(packHeadP);
  const packHeadingStyle = {
    opacity: 0.35 + packHeadEase * 0.65,
    transform: `translate3d(${(1 - packHeadEase) * -25}px, 0, 0)`,
  };

  // 6. 12-PACK & 24-PACK CARDS (48% - 72%)
  const pack12P = getProgress(p, 0.48, 0.70);
  const pack12Ease = easeOutCubic(pack12P);
  const pack12Style = {
    opacity: 0.35 + pack12Ease * 0.65,
    transform: `translate3d(${(1 - pack12Ease) * -35}px, 0, 0)`,
  };

  const pack24P = getProgress(p, 0.52, 0.74);
  const pack24Ease = easeOutCubic(pack24P);
  const pack24Style = {
    opacity: 0.35 + pack24Ease * 0.65,
    transform: `translate3d(${(1 - pack24Ease) * 35}px, 0, 0)`,
  };

  const price24Style = {};
  const badgeStyle = {};

  // 7. ORDER NOW BUTTON (58% - 80%)
  const btnP = getProgress(p, 0.58, 0.80);
  const btnEase = easeOutBack(btnP);
  const btnStyle = {
    opacity: 0.4 + btnP * 0.6,
    transform: `translate3d(0, ${(1 - btnP) * 20}px, 0) scale(${0.92 + clamp(btnEase, 0, 1.02) * 0.08})`,
  };

  // 8. TRUST INDICATORS (65% - 85%)
  const trustP = getProgress(p, 0.65, 0.85);
  const trustEase = easeOutCubic(trustP);
  const trustStyle = {
    opacity: 0.4 + trustEase * 0.6,
    transform: `translate3d(0, ${(1 - trustEase) * 12}px, 0)`,
  };

  return (
    <section id="product" ref={trackRef} className="product-details-track">
      {/* Sticky Viewport pinned at top:0 until entire sequence reaches 100% */}
      <div className="product-details-sticky">
        {/* Ambient Studio Background Glow */}
        <div className="product-ambient-glow" />

        <div className="product-details-container">
          {/* ========================================================= */}
          {/* LEFT SIDE: 50-Frame Scroll-Controlled Canvas Animation    */}
          {/* ========================================================= */}
          <div className="product-visual-col" data-cursor="scroll">
            {/* Retro Laughing Lips Overlay Sticker */}
            <div className="lips-overlay-wrapper">
              <img
                src="/assets/lips-overlay.png"
                alt="Laughing Lips Overlay"
                className="lips-overlay-img"
              />
            </div>

            <div className="product-canvas-wrapper">
              <canvas ref={canvasRef} className="product-canvas" />

              {/* Real-time Progress Line */}
              <div className="product-canvas-progress-track">
                <div
                  className="product-canvas-progress-fill"
                  style={{ width: `${p * 100}%` }}
                />
              </div>
            </div>

            {/* Scroll Cue Label */}
            <div className="scroll-hint-label">
              <span>{p < 0.98 ? "SCROLL TO UNBOX PRODUCT" : "SEQUENCE COMPLETE • SCROLL DOWN"}</span>
              <span className="scroll-hint-arrow">{p < 0.98 ? "↓" : "✓"}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: 3D Scroll-Driven Physical Text Construction   */}
          {/* ========================================================= */}
          <div className="product-info-col perspective-stage">
            <div className="product-info-inner">

              {/* MAIN BRAND TITLE: PRIRP ENERGY */}
              <div className="product-header-block">
                <div className="product-title-row">
                  <h1 className="product-main-title split-title-row">
                    <span className="word-split word-prip" style={pripWordStyle}>
                      PRIRP
                    </span>
                    <span className="word-split-space">&nbsp;</span>
                    <span className="word-split word-energy" style={energyWordStyle}>
                      ENERGY
                    </span>
                  </h1>

                  {/* 330ML VOLUME */}
                  <div className="product-volume-title font-cursive" style={volStyle}>
                    330ml
                  </div>
                </div>
              </div>

              <div className="product-section-divider" />

              {/* ACTIVE INGREDIENT MATRIX HEADING */}
              <div className="specs-section-wrapper">
                <div className="specs-section-header">
                  <span className="specs-section-title" style={matrixHeadingStyle}>
                    ACTIVE INGREDIENT <span className="font-cursive cursive-accent">Matrix:</span>
                  </span>
                </div>

                {/* 2x2 SPECIFICATION GRID */}
                <div className="product-specs-grid">
                  {/* CAFFEINE - from LEFT */}
                  <div className="spec-item-box from-left" style={cafStyle}>
                    <span className="spec-name">CAFFEINE</span>
                    <strong className="spec-val" style={numValStyle}>
                      180MG
                    </strong>
                    <div className="spec-desc-clip">
                      <span className="spec-note" style={specDescStyle}>
                        Organic Green Tea
                      </span>
                    </div>
                  </div>

                  {/* SUGAR - from RIGHT */}
                  <div className="spec-item-box from-right" style={sugStyle}>
                    <span className="spec-name">SUGAR</span>
                    <strong className="spec-val" style={numValStyle}>
                      0.0G
                    </strong>
                    <div className="spec-desc-clip">
                      <span className="spec-note" style={specDescStyle}>
                        Zero Crash Guarantee
                      </span>
                    </div>
                  </div>

                  {/* VOLUME - from BOTTOM */}
                  <div className="spec-item-box from-bottom" style={specVolStyle}>
                    <span className="spec-name">VOLUME</span>
                    <strong className="spec-val" style={numValStyle}>
                      330ML
                    </strong>
                    <div className="spec-desc-clip">
                      <span className="spec-note" style={specDescStyle}>
                        Tactical Matte Can
                      </span>
                    </div>
                  </div>

                  {/* CALORIES - from TOP */}
                  <div className="spec-item-box from-top" style={calStyle}>
                    <span className="spec-name">CALORIES</span>
                    <strong className="spec-val" style={numValStyle}>
                      5 KCAL
                    </strong>
                    <div className="spec-desc-clip">
                      <span className="spec-note" style={specDescStyle}>
                        Glacial Electrolytes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="product-section-divider" />

              {/* PACK OPTIONS & CARDS */}
              <div className="pack-selection-wrapper">
                <div className="pack-section-header">
                  <span className="pack-selection-title" style={packHeadingStyle}>
                    PACK <span className="font-cursive cursive-accent">Options</span>
                  </span>
                  <span className="pack-revealing-sub">
                    <em>REVEALING PACKS</em>
                  </span>
                </div>

                <div className="pack-options-row">
                  {/* 12-PACK CARD (from LEFT) */}
                  <button
                    type="button"
                    data-cursor="card"
                    className={`pack-select-card ${selectedPack === "12pack" ? "selected" : ""}`}
                    style={pack12Style}
                    onClick={() => setSelectedPack("12pack")}
                  >
                    <div className="pack-card-top">
                      <span className="pack-title">12-PACK</span>
                      <span className="pack-unit-price">$2.50 / can</span>
                    </div>
                    <strong className="pack-price">${drinkPrices["12pack"].toFixed(2)}</strong>
                    <span className="pack-shipping-text">Standard Shipping</span>
                  </button>

                  {/* 24-PACK PRO CARD (from RIGHT - RECOMMENDED CHOICE) */}
                  <button
                    type="button"
                    data-cursor="card"
                    className={`pack-select-card card-pro ${selectedPack === "24pack" ? "selected" : ""}`}
                    style={pack24Style}
                    onClick={() => setSelectedPack("24pack")}
                  >
                    <span className="pack-best-value-badge" style={badgeStyle}>
                      BEST VALUE • FREE SHIPPING
                    </span>
                    <div className="pack-card-top">
                      <span className="pack-title">24-PACK PRO</span>
                      <span className="pack-unit-price">$2.29 / can</span>
                    </div>
                    <strong className="pack-price price-pro" style={price24Style}>
                      ${drinkPrices["24pack"].toFixed(2)}
                    </strong>
                    <span className="pack-shipping-text">48H Cold-Chain Dispatch</span>
                  </button>
                </div>
              </div>

              {/* ORDER NOW CTA BUTTON (3D Drop-In & Physical Settle) */}
              <button
                type="button"
                data-cursor="order"
                className={`product-order-btn ${p >= 0.88 ? "btn-energized" : ""}`}
                style={btnStyle}
                onClick={handleOrderClick}
              >
                ORDER NOW — {selectedPack === "12pack" ? `12-PACK ($${drinkPrices["12pack"].toFixed(2)})` : `24-PACK ($${drinkPrices["24pack"].toFixed(2)})`}
              </button>

              {/* Trust Indicators (90% - 100%) */}
              <div className="product-trust-row" style={trustStyle}>
                <span>✓ 48H EXPRESS COLD-DISPATCH</span>
                <span>✓ 100% SATISFACTION GUARANTEE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
