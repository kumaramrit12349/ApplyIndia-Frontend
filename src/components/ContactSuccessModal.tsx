import React from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

interface ContactSuccessModalProps {
  show: boolean;
  referenceId: string;
  onClose: () => void;
}

/**
 * Rendered via createPortal straight to document.body — same reason as
 * GuidanceBookingModal/ConfirmModal: position:fixed here needs to resolve
 * against the real viewport, not whatever transformed ancestor might sit
 * between this and <body> in the normal render tree.
 */
const ContactSuccessModal: React.FC<ContactSuccessModalProps> = ({ show, referenceId, onClose }) => {
  if (!show) return null;

  const copyReferenceId = () => {
    navigator.clipboard?.writeText(referenceId).then(() => toast.success("Reference ID copied"));
  };

  return createPortal(
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4 p-md-5">
              <div className="ai-feedback-icon mx-auto" aria-hidden="true">
                <FiCheckCircle size={26} />
              </div>
              <h2 className="ai-feedback-title">Thank You!</h2>
              <p className="ai-feedback-subtitle">
                Your message has been submitted successfully. We'll review it and respond if a response is required.
              </p>
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-3"
                style={{ border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-bg)" }}
              >
                <strong>{referenceId}</strong>
                <button type="button" className="btn btn-sm btn-link p-0" onClick={copyReferenceId} aria-label="Copy reference ID">
                  <FiCopy />
                </button>
              </div>
              <p className="small" style={{ color: "var(--color-muted)" }}>
                Keep this reference ID handy if you need to follow up.
              </p>
              <div className="mt-3">
                <button type="button" className="btn btn-primary btn-sm px-4" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ContactSuccessModal;
