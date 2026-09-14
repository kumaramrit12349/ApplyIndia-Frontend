import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CancelSlotModalProps {
  show: boolean;
  title: string;
  message?: string;
  onConfirm: (reason: string) => Promise<void> | void;
  onCancel: () => void;
}

const CancelSlotModal: React.FC<CancelSlotModalProps> = ({ show, title, message, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (show) {
      setReason("");
      setConfirming(false);
    }
  }, [show]);

  if (!show) return null;

  const handleConfirmClick = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setConfirming(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              {message && <p className="text-muted small mb-3">{message}</p>}
              <label htmlFor="cancel-reason-input" className="form-label small fw-semibold">
                Reason (shown to the user in the cancellation email, optional)
              </label>
              <textarea
                id="cancel-reason-input"
                className="form-control"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Back
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmClick} disabled={confirming}>
                {confirming ? "Cancelling..." : "Cancel Slot"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CancelSlotModal;
