import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(`prirp_cart_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Switch cart when logged-in user changes or logs out
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`prirp_cart_${userId}`);
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [userId]);

  // Sync cart to user-scoped storage
  useEffect(() => {
    try {
      localStorage.setItem(`prirp_cart_${userId}`, JSON.stringify(cart));
    } catch {}
  }, [cart, userId]);

  const addToCart = (product, size = "M", qty = 1, customization = null) => {
    const chosenSize = size || "M";
    const numericPrice =
      typeof product.numericPrice === "number"
        ? product.numericPrice
        : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 45;

    const custom = customization || product.customization || null;
    const customKey =
      custom && (custom.nameOnJersey || custom.jerseyNumber)
        ? `-${custom.nameOnJersey || ""}-${custom.jerseyNumber || ""}`
        : "";
    const itemKey = `${product.id}-${chosenSize}${customKey}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.key === itemKey ||
          (!item.key && item.id === product.id && item.size === chosenSize)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].qty += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            key: itemKey,
            name: product.name,
            size: chosenSize,
            price: product.price || `$${numericPrice.toFixed(2)}`,
            numericPrice,
            image: product.image || "/merch/tee-signature.jpg",
            category: product.categoryLabel || product.category || "APPAREL",
            qty,
            customization: custom,
          },
        ];
      }
    });

    setLastAddedItem({
      name: product.name,
      size: chosenSize,
      price: product.price || `$${numericPrice.toFixed(2)}`,
      customization: custom,
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, key = null) => {
    setCart((prev) =>
      prev.filter((item) =>
        key ? item.key !== key : !(item.id === id && item.size === size)
      )
    );
  };

  const updateQty = (id, size, delta, key = null) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const match = key
            ? item.key === key
            : item.id === id && item.size === size;
          if (match) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(`prirp_cart_${userId}`);
    } catch {}
  };

  const applyPromo = async (code) => {
    const clean = code.trim().toUpperCase();
    try {
      const { validatePromoCode } = await import("../api/client");
      const res = await validatePromoCode(clean);
      if (res.success) {
        setDiscountPercent(res.discount_percent);
        setPromoCode(clean);
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || "INVALID OR EXPIRED VAULT CODE" };
      }
    } catch {
      if (["PRIRP10", "SUBZERO", "ENERGY10"].includes(clean)) {
        setDiscountPercent(10);
        setPromoCode(clean);
        return { success: true, message: "10% VIP DISCOUNT APPLIED" };
      } else if (["PRIRP20", "CREW20"].includes(clean)) {
        setDiscountPercent(20);
        setPromoCode(clean);
        return { success: true, message: "20% VIP DROP DISCOUNT APPLIED" };
      }
      return { success: false, message: "INVALID OR EXPIRED VAULT CODE" };
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.numericPrice * item.qty,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        promoCode,
        discountPercent,
        discountAmount,
        applyPromo,
        subtotal,
        total,
        totalItems,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
