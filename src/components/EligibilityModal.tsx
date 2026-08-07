import React from "react";
import ReactDOM from "react-dom";
import { BsCheckCircleFill, BsXCircleFill, BsExclamationTriangleFill } from "react-icons/bs";
import type { IEligibilityResult } from "../services/private/eligibilityApi";
import { PROFILE_FIELD_LABELS } from "../constant/SharedConstant";
import "./EligibilityModal.css";

interface EligibilityModalProps {
  show: boolean;
  loading: boolean;
  result: IEligibilityResult | null;
  onClose: () => void;
}

const EligibilityModal: React.FC<EligibilityModalProps> = ({ show, loading, result, onClose }) => {
  if (!show) return null;

  const hasMissingFields = !!result && result.missingProfileFields.length > 0;

  return ReactDOM.createPortal(
    <div className="elig-overlay" onClick={onClose}>
      <div className="elig-modal" onClick={(e) => e.stopPropagation()}>
        <button className="elig-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {loading && (
          <div className="elig-loading">
            <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
              <span className="visually-hidden">Checking...</span>
            </div>
            <p className="mt-3 mb-0">Checking your eligibility…</p>
          </div>
        )}

        {!loading && result && hasMissingFields && (
          <div className="elig-result">
            <div className="elig-icon elig-icon--warn">
              <BsExclamationTriangleFill />
            </div>
            <h4 className="elig-title">Complete Your Profile</h4>
            <p className="elig-subtitle">
              We need a bit more information to check your eligibility for this notification:
            </p>
            <ul className="elig-reasons">
              {result.missingProfileFields.map((field) => (
                <li key={field}>{PROFILE_FIELD_LABELS[field] || field}</li>
              ))}
            </ul>
            <a href="/profile" className="elig-cta">
              Complete Profile
            </a>
          </div>
        )}

        {!loading && result && !hasMissingFields && result.eligible && (
          <div className="elig-result">
            <div className="elig-icon elig-icon--success">
              <BsCheckCircleFill />
            </div>
            <h4 className="elig-title elig-title--success">You are eligible to apply.</h4>
            <p className="elig-subtitle elig-subtitle--muted">
              Based on your profile, you meet all the eligibility criteria for this notification.
            </p>
          </div>
        )}

        {!loading && result && !hasMissingFields && !result.eligible && (
          <div className="elig-result">
            <div className="elig-icon elig-icon--danger">
              <BsXCircleFill />
            </div>
            <h4 className="elig-title elig-title--danger">You are not eligible to apply.</h4>
            <ul className="elig-reasons elig-reasons--danger">
              {result.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="elig-disclaimer">
          This result is informational only and does not guarantee selection or acceptance of your application.
        </p>
      </div>
    </div>,
    document.body
  );
};

export default EligibilityModal;
