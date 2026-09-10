import React from "react";
import { getYouTubeEmbedUrl } from "../../utils/utils";

interface VideoPreviewModalProps {
  show: boolean;
  title: string;
  url: string | null;
  onClose: () => void;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ show, title, url, onClose }) => {
  if (!show || !url) return null;

  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-0">
              {embedUrl ? (
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              ) : (
                <div className="p-4 text-center text-muted">
                  <p className="mb-2">This link couldn't be embedded here.</p>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    Open it in a new tab
                  </a>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary me-auto">
                Open on YouTube
              </a>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPreviewModal;
