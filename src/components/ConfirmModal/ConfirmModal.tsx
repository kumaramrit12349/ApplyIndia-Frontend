import React, { useEffect, useState } from "react";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmVariant?: string;
  confirmButtonClassName?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  confirmVariant = "primary",
  confirmButtonClassName,
}) => {
  // Guards against a double-click firing onConfirm (and whatever async
  // action it kicks off, e.g. approve/archive/delete) twice before the
  // caller's own state update closes the modal — that update happens on the
  // next React render, which isn't necessarily fast enough to beat a second
  // click. Resets whenever the modal is freshly shown again.
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (show) setConfirming(false);
  }, [show]);

  if (!show) return null;

  const handleConfirmClick = () => {
    if (confirming) return;
    setConfirming(true);
    onConfirm();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
              ></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className={confirmButtonClassName || `btn btn-${confirmVariant}`}
                onClick={handleConfirmClick}
                disabled={confirming}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
