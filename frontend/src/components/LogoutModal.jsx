import { useAuth } from "../context/AuthContext";
import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="logout-modal-backdrop" onClick={onClose}>
      <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="logout-icon-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="font-display logout-title">TERMINATE SESSION?</h3>

        {/* Description */}
        <p className="font-sans logout-desc">
          Are you sure you want to sign out of PRIRP Sub-Zero Identity? Your encrypted session will be closed.
        </p>

        {/* Active User Badge */}
        {user && (
          <div className="logout-user-badge font-mono">
            <span className="user-status-dot"></span><span className="user-status-label">CONNECTED:</span>
            <strong>{user.full_name || user.email}</strong>
          </div>
        )}

        {/* Actions */}
        <div className="logout-actions font-mono">
          <button type="button" className="logout-btn-cancel" onClick={onClose}>
            CANCEL
          </button>
          <button type="button" className="logout-btn-confirm" onClick={handleConfirmLogout}>
            SIGN OUT
          </button>
        </div>
      </div>
    </div>
  );
}
