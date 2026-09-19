import React, { useEffect, useState } from "react";
import { getYouTubeEmbedUrl } from "../../utils/utils";

interface VideoUrlModalProps {
  show: boolean;
  title: string;
  message?: string;
  onConfirm: (url: string | undefined) => void;
  onCancel: () => void;
  confirmText?: string;
  /** When true the URL must be provided: no "(optional)" label and the confirm button stays disabled until it is. */
  required?: boolean;
}

const VideoUrlModal: React.FC<VideoUrlModalProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Mark as Done",
  required = false,
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

  const trimmedUrl = url.trim();
  // Whatever is typed must be a real YouTube link (same rule the video
  // preview uses to embed it); an empty value is only acceptable when the
  // field isn't required.
  const isInvalidUrl = trimmedUrl.length > 0 && !getYouTubeEmbedUrl(trimmedUrl);
  const canConfirm = !confirming && !isInvalidUrl && (!required || trimmedUrl.length > 0);

  const handleConfirmClick = () => {
    if (!canConfirm) return;
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
                YouTube URL{required ? <span className="text-danger ms-1">*</span> : " (optional)"}
              </label>
              <input
                id="video-url-input"
                type="url"
                className={`form-control ${isInvalidUrl ? "is-invalid" : ""}`}
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required={required}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmClick();
                }}
              />
              {isInvalidUrl && (
                <div className="invalid-feedback d-block">
                  Enter a valid YouTube link (youtube.com or youtu.be).
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleConfirmClick}
                disabled={!canConfirm}
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
