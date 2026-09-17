import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PillNav from "./components/PillNav";
import Home from "./pages/Home";
import Merchandise from "./pages/Merchandise";
import Founder from "./pages/Founder";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import OrderModal from "./components/OrderModal";
import CartDrawer from "./components/CartDrawer";
import AuthModal from "./components/AuthModal";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function AppContent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState("24pack");
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleOpenCheckout = (pack) => {
    if (pack) {
      setSelectedPack(pack);
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="prip-app">
      {/* Global Auth Modal */}
      {!isAdminRoute && <AuthModal />}

      {/* Global Cart Drawer & Order Summary */}
      {!isAdminRoute && <CartDrawer />}

      {/* Global GSAP Pill Navigation */}
      {!isAdminRoute && (
        <PillNav
          logo="/prirplogoo.png"
          logoAlt="PRIRP Energy Logo"
          ease="power2.easeOut"
          baseColor="#000000"
          pillColor="#880504"
          hoveredPillTextColor="#d1b2b2"
          pillTextColor="#d1b2b2"
        />
      )}

      {/* ROUTING */}
      <Routes>
        <Route
          path="/"
          element={<Home onOpenCheckout={handleOpenCheckout} />}
        />
        <Route
          path="/merchandise"
          element={<Merchandise onOpenCheckout={handleOpenCheckout} />}
        />
        <Route
          path="/founder"
          element={<Founder />}
        />
        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback Catch-all Route */}
        <Route
          path="*"
          element={<Home onOpenCheckout={handleOpenCheckout} />}
        />
      </Routes>

      {/* Global Drink Checkout Modal */}
      {!isAdminRoute && (
        <OrderModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          selectedPack={selectedPack}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
