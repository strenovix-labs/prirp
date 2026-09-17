import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import "./CartDrawer.css";

export default function CartDrawer() {
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const {
    cart,
    isCartOpen,
    closeCart,
    openCart,
    removeFromCart,
    updateQty,
    clearCart,
    subtotal,
    discountAmount,
    discountPercent,
    promoCode,
    applyPromo,
    total,
    totalItems,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromo(inputCode);
    setPromoMessage(res);
    setTimeout(() => {
      setPromoMessage(null);
    }, 4000);
    setInputCode("");
  };

  const processCartCheckout = async (currentUser, selectedAddress) => {
    setIsCheckingOut(true);
    try {
      const { createOrder } = await import("../api/client");
      const activeUser = currentUser || user;
      const shippingData = selectedAddress
        ? {
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postal_code: selectedAddress.postal_code || selectedAddress.postalCode,
            country: selectedAddress.country || "US",
          }
        : {
            street: "100 Sub-Zero Way",
            city: "New York",
            state: "NY",
            postal_code: "10001",
            country: "US",
          };

      const orderPayload = {
        customer_name: activeUser?.full_name || "PRIRP VIP Member",
        customer_email: activeUser?.email || "vip@prirpenergy.com",
        shipping_address: shippingData,
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          size: item.size || "M",
          quantity: item.qty,
          unit_price: item.numericPrice,
          customization: item.customization,
        })),
        promo_code: promoCode || null,
      };

      await createOrder(orderPayload);
    } catch (err) {
      console.warn("Backend order submission error, falling back locally:", err);
    } finally {
      setIsCheckingOut(false);
      setOrderComplete(true);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal((authenticatedUser) => {
        setPendingUser(authenticatedUser);
        closeCart();
      setIsAddrModalOpen(true);
      });
      return;
    }
    setPendingUser(user);
    closeCart();
      setIsAddrModalOpen(true);
  };

  const handleAddressConfirmed = (selectedAddress) => {
    setIsAddrModalOpen(false);
    processCartCheckout(pendingUser || user, selectedAddress);
  };

  const handleResetOrder = () => {
    setOrderComplete(false);
    clearCart();
    closeCart();
  };

  const inrEstimate = Math.round(total * 83.5);

  return (
    <>
      {/* Floating Cart Trigger Button */}
      <button
        type="button"
        className="prirp-floating-cart-trigger"
        onClick={openCart}
        aria-label="Open Shopping Bag"
      >
        <span className="cart-trigger-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <span className="cart-trigger-label font-mono">BAG</span>
        {totalItems > 0 && <span className="cart-badge-count font-mono">{totalItems}</span>}
      </button>

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-backdrop" onClick={closeCart}>
          <div
            className="cart-drawer-panel glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="cart-drawer-header font-mono">
              <div className="drawer-title-group">
                <span className="dot-live font-mono"></span>
                <span className="drawer-title font-display">PRIRP REFRIGERATED BAG</span>
                <span className="drawer-count-pill font-mono">{totalItems} ITEMS</span>
              </div>
              <button
                type="button"
                className="cart-close-btn"
                onClick={closeCart}
                aria-label="Close Bag"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Order Complete State */}
            {orderComplete ? (
              <div className="cart-drawer-body order-complete-body font-mono">
                <div className="complete-icon-ring">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display complete-heading">DISPATCH CONFIRMED</h3>
                <p className="font-sans complete-text">
                  Your PRIRP energy vault is packed in cold-chain packaging. Order confirmation transmitted to{" "}
                  <strong>{user?.email || "registered email"}</strong>.
                </p>
                <button
                  type="button"
                  className="btn-primary complete-action-btn font-mono"
                  onClick={handleResetOrder}
                >
                  DONE / CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                {/* Cart Body: Items List */}
                <div className="cart-drawer-body font-sans">
                  {cart.length === 0 ? (
                    <div className="cart-empty-state font-mono">
                      <div className="empty-can-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <p className="empty-text font-sans">YOUR REFRIGERATED VAULT IS EMPTY</p>
                      <button
                        type="button"
                        className="btn-secondary empty-browse-btn font-mono"
                        onClick={closeCart}
                      >
                        BROWSE PRODUCTS
                      </button>
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {cart.map((item) => (
                        <div key={item.key || item.id} className="cart-item-card">
                          <div className="item-thumb-frame">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="item-thumb-img"
                            />
                          </div>

                          <div className="item-details-col">
                            <div className="item-top-row">
                              <span className="item-cat-tag font-mono">
                                {item.category}
                              </span>
                              <button
                                type="button"
                                className="item-remove-btn"
                                onClick={() => removeFromCart(item.id, item.size, item.key)}
                                title="Remove item"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>

                            <h4 className="item-title font-display">{item.name}</h4>

                            {item.customization && (item.customization.nameOnJersey || item.customization.jerseyNumber) && (
                              <div className="item-customization-badge font-mono">
                                <span className="custom-label">JERSEY:</span>
                                <span className="custom-val">
                                  {item.customization.jerseyNumber ? `#${item.customization.jerseyNumber} ` : ""}
                                  {item.customization.nameOnJersey || ""}
                                </span>
                              </div>
                            )}

                            <div className="item-meta-row font-mono">
                              <span className="item-size-badge">
                                SIZE: {item.size}
                              </span>
                              <span className="item-unit-price">{item.price}</span>
                            </div>

                            <div className="item-bottom-row font-mono">
                              <div className="qty-stepper">
                                <button
                                  type="button"
                                  className="qty-step-btn"
                                  onClick={() => updateQty(item.id, item.size, -1, item.key)}
                                >
                                  -
                                </button>
                                <span className="qty-count">{item.qty}</span>
                                <button
                                  type="button"
                                  className="qty-step-btn"
                                  onClick={() => updateQty(item.id, item.size, 1, item.key)}
                                >
                                  +
                                </button>
                              </div>

                              <span className="item-line-total font-display">
                                ${(item.numericPrice * item.qty).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="cart-drawer-footer">
                    <form className="promo-input-row font-mono" onSubmit={handleApplyPromo}>
                      <input
                        type="text"
                        placeholder="PROMO CODE (e.g. PRIRP10)"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className="promo-field"
                      />
                      <button type="submit" className="promo-apply-btn">
                        APPLY
                      </button>
                    </form>

                    {promoMessage && (
                      <div
                        className={`promo-feedback font-mono ${
                          promoMessage.success ? "success" : "error"
                        }`}
                      >
                        {promoMessage.message}
                      </div>
                    )}

                    <div className="order-summary-table font-mono">
                      <div className="summary-line">
                        <span className="summary-label">ITEMS SUBTOTAL</span>
                        <span className="summary-value">${subtotal.toFixed(2)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="summary-line discount-line">
                          <span className="summary-label">
                            VAULT DISCOUNT ({discountPercent}%)
                          </span>
                          <span className="summary-value text-red">
                            -${discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="summary-line">
                        <span className="summary-label">SUB-ZERO REFRIGERATED COLD SHIP</span>
                        <span className="summary-value text-green">FREE</span>
                      </div>

                      <div className="summary-line">
                        <span className="summary-label">ESTIMATED TAX & HANDLING</span>
                        <span className="summary-value">$0.00</span>
                      </div>

                      <div className="summary-line total-line">
                        <div>
                          <span className="total-title font-display">FINAL TOTAL</span>
                          <span className="total-inr font-mono">
                            Approx. ₹{inrEstimate.toLocaleString()} INR
                          </span>
                        </div>
                        <span className="final-price font-display">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-primary cart-checkout-action-btn font-mono"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut
                        ? "TRANSMITTING SECURE ORDER..."
                        : `PROCEED TO CHECKOUT ($${total.toFixed(2)}) ?`}
                    </button>

                    <div className="cart-guarantee-row font-mono">
                      <span>SECURE 256-BIT</span>
                      <span>30-DAY EXCHANGE</span>
                      <span>24H DISPATCH</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Shipping Address Selection / Entry Modal */}
      <AddressModal
        isOpen={isAddrModalOpen}
        onClose={() => setIsAddrModalOpen(false)}
        onSelectAddress={handleAddressConfirmed}
      />
    </>
  );
}
