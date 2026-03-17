import React from "react";
import ReactDOM from "react-dom";

interface SupportPopupProps {
  show: boolean;
  onClose: () => void;
}

const SupportPopup: React.FC<SupportPopupProps> = ({ show, onClose }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="ai-wishlist-popup-overlay">
      <div className="ai-wishlist-popup">
        <button
          className="ai-wishlist-popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="ai-wishlist-popup-emoji">⚠️</div>
        <h4 className="ai-wishlist-popup-title" style={{ fontSize: "1.2rem", marginBottom: "12px", color: "#dc3545" }}>
          Limit Reached
        </h4>
        <p className="ai-wishlist-popup-message" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
          You have reached the maximum limit of 3 attempts for this notification. 
          <br /><br />
          If you want to track or mark this notification again, please mail us at:
          <br />
          <a href="mailto:support@applyinida.online" style={{ fontWeight: "bold", color: "#667eea", textDecoration: "none" }}>
            support@applyinida.online
          </a>
        </p>
        <button
          className="ai-wishlist-popup-btn"
          style={{ width: "100%", marginTop: "10px", background: "#f3f4f6", color: "#4b5563", boxShadow: "none" }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SupportPopup;
