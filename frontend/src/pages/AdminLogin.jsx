import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, fetchCurrentUser } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login: setAuthContext } = useAuth();

  const handleUseDemo = () => {
    setUsername("admin");
    setPassword("admin123");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in both username/email and password");
      return;
    }

    setLoading(true);
    setError(null);

    const emailToSend = username.trim().toLowerCase() === "admin" ? "admin@prirpenergy.com" : username.trim();
    const res = await loginUser(emailToSend, password);

    if (res.success && res.data.access_token) {
      const token = res.data.access_token;
      const userRes = await fetchCurrentUser(token);
      
      const userData = userRes.success ? userRes.data : res.data.user;
      
      // Store in auth context and local storage
      setAuthContext(token, userData);
      localStorage.setItem("prirp_admin_token", token);

      if (userData?.role === "admin" || emailToSend === "admin@prirpenergy.com") {
        navigate("/admin/dashboard");
      } else {
        setError("Account authenticated, but does not have Admin privileges.");
        setLoading(false);
      }
    } else {
      setError(res.error || "Invalid admin credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Header Badge */}
        <div className="admin-header-glow">
          <div className="admin-logo-badge font-mono">
            <span className="dot"></span>
            <span>RESTRICTED ACCESS // PORTAL</span>
          </div>
          <h2 className="font-display admin-login-title">PRIRP COMMAND CENTER</h2>
          <p className="font-sans admin-login-sub">
            Sub-Zero Store Management & Analytics System
          </p>
        </div>

        {/* Error Banner */}
        {error && <div className="admin-error-banner font-mono">{error}</div>}

        {/* Demo Credentials Quick Trigger */}
        <div className="admin-demo-hint font-mono" onClick={handleUseDemo}>
          <div>
            <strong>DEFAULT ADMIN LOGIN:</strong> <span>admin / admin123</span>
          </div>
          <span style={{ fontWeight: "bold" }}>AUTO-FILL →</span>
        </div>

        {/* Login Form */}
        <form className="admin-login-form font-mono" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label>ADMIN USERNAME / EMAIL</label>
            <input
              type="text"
              className="admin-input-field font-mono"
              placeholder="e.g. admin or admin@prirpenergy.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              className="admin-input-field font-mono"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn-submit font-mono"
            disabled={loading}
          >
            {loading ? "AUTHENTICATING COMMAND..." : "ACCESS DASHBOARD →"}
          </button>
        </form>

        <div className="admin-back-link font-mono">
          <Link to="/">← BACK TO PUBLIC STOREFRONT</Link>
        </div>
      </div>
    </div>
  );
}
