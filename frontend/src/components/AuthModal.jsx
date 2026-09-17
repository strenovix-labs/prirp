import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "Login failed. Please check credentials.");
        }
      } else {
        const res = await register(email, password, fullName);
        if (!res.success) {
          setErrorMsg(res.error || "Registration failed.");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@prirpenergy.com");
    setPassword("prirp_admin_2026");
    setTab("login");
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-top">
          <div className="auth-brand font-mono">
            <span className="dot-live" />
            <span>PRIRP SECURE IDENTITY</span>
          </div>
          <button
            type="button"
            className="auth-close-btn"
            onClick={closeAuthModal}
            aria-label="Close authentication modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs-header font-mono">
          <button
            type="button"
            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setErrorMsg(null);
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => {
              setTab("register");
              setErrorMsg(null);
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Title */}
        <h3 className="auth-form-title font-display">
          {tab === "login" ? "WELCOME BACK" : "JOIN THE COLLECTIVE"}
        </h3>
        <p className="auth-form-sub font-sans">
          {tab === "login"
            ? "Sign in to complete your sub-zero order and access express dispatch."
            : "Register your PRIRP profile to unlock priority drop access & order history."}
        </p>

        {/* Error Banner */}
        {errorMsg && (
          <div className="auth-error-banner font-mono">{errorMsg}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group font-mono">
            {tab === "register" && (
              <div className="auth-field">
                <label className="auth-label">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="ALEX RIDER"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="YOUR.EMAIL@DOMAIN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">PASSWORD</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn font-mono"
          >
            {loading
              ? "AUTHENTICATING..."
              : tab === "login"
              ? "SIGN IN & PROCEED →"
              : "CREATE ACCOUNT & PROCEED →"}
          </button>
        </form>

        {/* Quick Test Credential Filler */}
        <div className="auth-demo-hint font-mono">
          <span>QUICK TEST ACCOUNT:</span>
          <button
            type="button"
            className="demo-fill-btn"
            onClick={fillDemoAdmin}
          >
            FILL ADMIN LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}
