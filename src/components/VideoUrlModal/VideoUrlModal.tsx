import React, { useEffect, useState } from "react";

interface VideoUrlModalProps {
  show: boolean;
  title: string;
  message?: string;
  onConfirm: (url: string | undefined) => void;
  onCancel: () => void;
  confirmText?: string;
}

const VideoUrlModal: React.FC<VideoUrlModalProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Mark as Done",
}) => {
  const [url, setUrl] = useState("");
  // Guards against a double-click firing onConfirm twice — same pattern as ConfirmModal.
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (show) {
      setUrl("");
      setConfirming(false);
    }
  }, [show]);

  if (!show) return null;

  const handleConfirmClick = () => {
    if (confirming) return;
    setConfirming(true);
    onConfirm(url.trim() || undefined);
  };

  return (
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
              <label htmlFor="video-url-input" className="form-label small fw-semibold">
                YouTube URL (optional)
              </label>
              <input
                id="video-url-input"
                type="url"
                className="form-control"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmClick();
                }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
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

export default VideoUrlModal;
