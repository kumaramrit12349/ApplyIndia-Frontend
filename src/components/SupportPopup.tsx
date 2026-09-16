import React from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "../i18n/useTranslation";

interface SupportPopupProps {
  show: boolean;
  onClose: () => void;
}

const SupportPopup: React.FC<SupportPopupProps> = ({ show, onClose }) => {
  const { support: t } = useTranslation();

  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="ai-wishlist-popup-overlay">
      <div className="ai-wishlist-popup">
        <button
          className="ai-wishlist-popup-close"
          onClick={onClose}
          aria-label={t.close}
        >
          ✕
        </button>
        <div className="ai-wishlist-popup-emoji">⚠️</div>
        <h4 className="ai-wishlist-popup-title" style={{ fontSize: "1.2rem", marginBottom: "12px", color: "#dc3545" }}>
          {t.limitReached}
        </h4>
        <p className="ai-wishlist-popup-message" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
          {t.limitReachedDesc}
          <br /><br />
          {t.contactPrompt}
          <br />
          <a href="mailto:support@applyinida.online" style={{ fontWeight: "bold", color: "var(--color-secondary)", textDecoration: "none" }}>
            support@applyinida.online
          </a>
        </p>
        <button
          className="ai-wishlist-popup-btn"
          style={{ width: "100%", marginTop: "10px", background: "#f3f4f6", color: "#4b5563", boxShadow: "none" }}
          onClick={onClose}
        >
          {t.close}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SupportPopup;
