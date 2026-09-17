import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./ProductSummaryModal.css";

export default function ProductSummaryModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes ? product.sizes[0] : "M"
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    addToCart(product, selectedSize, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 900);
  };

  const numericPrice =
    typeof product.numericPrice === "number"
      ? product.numericPrice
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 45;

  const lineTotal = (numericPrice * quantity).toFixed(2);

  return (
    <div className="product-summary-backdrop" onClick={onClose}>
      <div
        className="product-summary-card glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="summary-close-btn"
          onClick={onClose}
          aria-label="Close summary"
        >
          ✕
        </button>

        <div className="summary-layout-grid">
          {/* Left Column: Image Showcase */}
          <div className="summary-media-col">
            <div className="summary-img-frame">
              <img
                src={product.image}
                alt={product.name}
                className="summary-hero-img"
              />
              <span className="summary-tag-badge font-mono">
                {product.tag || "OFFICIAL DROP"}
              </span>
            </div>
          </div>

          {/* Right Column: In-Depth Product Summary */}
          <div className="summary-details-col">
            <div className="summary-category-row font-mono">
              <span className="summary-category-pill">
                {product.categoryLabel || "PRIRP APPAREL"}
              </span>
              <span className="summary-in-stock">IN STOCK // DISPATCH 24H</span>
            </div>

            <h2 className="summary-product-title font-display">
              {product.name}
            </h2>

            <div className="summary-price-row font-mono">
              <span className="summary-price-main font-display">
                {product.price}
              </span>
              {product.inrPrice && (
                <span className="summary-price-alt">({product.inrPrice})</span>
              )}
            </div>

            <p className="summary-product-lead font-sans">
              {product.description}
            </p>

            {/* Technical Specification Summary Cards */}
            <div className="summary-specs-list font-mono">
              <div className="summary-spec-chip">
                <div>
                  <strong>FABRIC DENSITY</strong>
                  <span>{product.gsm || "280 GSM Heavyweight Combed Cotton"}</span>
                </div>
              </div>

              <div className="summary-spec-chip">
                <div>
                  <strong>STITCH ARCHITECTURE</strong>
                  <span>Reinforced double-needle flatlock seams</span>
                </div>
              </div>

              <div className="summary-spec-chip">
                <div>
                  <strong>TREATMENT</strong>
                  <span>Sub-zero pre-shrunk & anti-fade cold wash</span>
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div className="summary-size-section">
              <div className="summary-size-header font-mono">
                <span>SELECT SIZE:</span>
                <span className="size-fit-hint">RELAXED CYBER FIT</span>
              </div>
              <div className="summary-size-chips font-mono">
                {product.sizes?.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`summary-size-btn ${
                      selectedSize === sz ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add Button */}
            <div className="summary-action-block">
              <div className="summary-qty-box font-mono">
                <span className="qty-title">QTY:</span>
                <div className="qty-stepper-wrap">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="qty-text">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`btn-primary summary-add-btn font-mono ${
                  addedFeedback ? "added" : ""
                }`}
                onClick={handleAdd}
              >
                {addedFeedback
                  ? "ADDED TO BAG ✓"
                  : `ADD TO BAG • $${lineTotal}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
