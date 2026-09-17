import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./AddressModal.css";

export default function AddressModal({ isOpen, onClose, onSelectAddress }) {
  const { user, saveAddress, deleteAddress } = useAuth();
  const savedAddresses = user?.saved_addresses || [];

  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState("");

  // Form State
  const [tag, setTag] = useState("HOME");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (savedAddresses.length > 0) {
      setView("list");
      const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
      setSelectedId(defaultAddr.id);
    } else {
      setView("form");
    }
  }, [isOpen, savedAddresses.length]);

  if (!isOpen) return null;

  const handleConfirmSelected = () => {
    const chosen = savedAddresses.find((a) => a.id === selectedId) || savedAddresses[0];
    if (!chosen) {
      setView("form");
      return;
    }
    onSelectAddress(chosen);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMsg("Please complete all shipping address fields.");
      return;
    }

    setIsSubmitting(true);
    const newAddr = {
      tag: tag.toUpperCase(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postal_code: postalCode.trim(),
      country: country.trim() || "US",
    };

    try {
      if (saveToProfile) {
        await saveAddress(newAddr);
      }
      onSelectAddress(newAddr);
    } catch {
      onSelectAddress(newAddr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteAddress(id);
  };

  return (
    <div className="addr-modal-backdrop" onClick={onClose}>
      <div className="addr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="addr-modal-top">
          <div className="addr-modal-title font-mono">
            <span className="dot-live" style={{ background: "#ef4444" }}></span>
            <span>{view === "list" ? "SHIPPING DESTINATION" : "ADD DELIVERY ADDRESS"}</span>
          </div>
          <button className="addr-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* LIST VIEW (Select Saved Address) */}
        {view === "list" && savedAddresses.length > 0 ? (
          <div>
            <div className="addr-list-container font-sans">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`addr-card ${selectedId === addr.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(addr.id)}
                >
                  <input
                    type="radio"
                    name="addressSelect"
                    checked={selectedId === addr.id}
                    onChange={() => setSelectedId(addr.id)}
                    className="addr-radio"
                  />
                  <div className="addr-details">
                    <div className="addr-header-row font-mono">
                      <span className="addr-tag-badge">{addr.tag || "HOME"}</span>
                      {addr.is_default && <span className="addr-default-badge">DEFAULT</span>}
                    </div>
                    <div className="addr-street font-sans">{addr.street}</div>
                    <div className="addr-city-state font-mono">
                      {addr.city}, {addr.state} {addr.postal_code} ({addr.country})
                    </div>
                  </div>
                  <button
                    type="button"
                    className="addr-delete-btn"
                    onClick={(e) => handleDelete(e, addr.id)}
                    title="Delete address"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="addr-actions font-mono">
              <button
                type="button"
                className="addr-btn-secondary"
                onClick={() => setView("form")}
              >
                + ADD NEW
              </button>
              <button
                type="button"
                className="addr-btn-primary"
                onClick={handleConfirmSelected}
              >
                CONFIRM ADDRESS & CONTINUE
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW (Create New Address) */
          <form className="addr-form font-mono" onSubmit={handleFormSubmit}>
            {/* Address Label Tags */}
            <div className="addr-tag-group font-mono">
              {[
                { label: "HOME", icon: "" },
                { label: "WORK", icon: "" },
                { label: "OTHER", icon: "" }
              ].map(({ label: t }) => (
                <button
                  key={t}
                  type="button"
                  className={`addr-tag-btn ${tag === t ? "active" : ""}`}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="STREET ADDRESS (e.g. 100 Sub-Zero Way)"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="addr-input-field"
              required
            />

            <div className="addr-grid-2">
              <input
                type="text"
                placeholder="CITY (e.g. New York)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="addr-input-field"
                required
              />
              <input
                type="text"
                placeholder="STATE / PROV (e.g. NY)"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="addr-input-field"
                required
              />
            </div>

            <div className="addr-grid-2">
              <input
                type="text"
                placeholder="POSTAL / PIN CODE (e.g. 10001)"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="addr-input-field"
                required
              />
              <input
                type="text"
                placeholder="COUNTRY (e.g. US)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="addr-input-field"
                required
              />
            </div>

            <label className="addr-save-checkbox font-mono">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
              />
              <span>SAVE THIS ADDRESS FOR FUTURE 1-CLICK CHECKOUTS</span>
            </label>

            {errorMsg && <div className="addr-error font-mono">{errorMsg}</div>}

            <div className="addr-actions font-mono">
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  className="addr-btn-secondary"
                  onClick={() => setView("list")}
                >
                  ← BACK
                </button>
              )}
              <button
                type="submit"
                className="addr-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "SAVING..." : "SAVE & PROCEED TO CHECKOUT"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
