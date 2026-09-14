import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiLifeBuoy, FiClock, FiYoutube } from "react-icons/fi";
import { fetchBookingAllowance } from "../../services/private/guidanceApi";
import type { IGuidanceBookingAllowance } from "../../interface/GuidanceInterface";
import GuidanceBookingModal from "./GuidanceBookingModal";
import "./Guidance.css";

interface GuidanceBookingCardProps {
  notificationId: string;
  notificationTitle: string;
  isAuthenticated: boolean;
  onShowAuthPopup?: () => void;
  guidanceLink?: string | null;
}

const GuidanceBookingCard: React.FC<GuidanceBookingCardProps> = ({
  notificationId,
  notificationTitle,
  isAuthenticated,
  onShowAuthPopup,
  guidanceLink,
}) => {
  const [allowance, setAllowance] = useState<IGuidanceBookingAllowance | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadAllowance = () => {
    if (!isAuthenticated) return;
    fetchBookingAllowance(notificationId)
      .then((res) => setAllowance(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadAllowance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, notificationId]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      if (onShowAuthPopup) onShowAuthPopup();
      return;
    }
    setShowModal(true);
  };

  const usedUp = allowance ? allowance.used >= allowance.max : false;

  return (
    <div className="col-12">
      <div className="ndv-card" style={{ animationDelay: "0.28s" }}>
        <div className="ndv-card-header ndv-card-header--indigo">
          <div className="ndv-card-icon ndv-card-icon--indigo">
            <FiLifeBuoy />
          </div>
          <h3 className="ndv-card-title">Stuck While Applying?</h3>
        </div>
        <div className="ndv-card-body">
          <p className="guidance-card-intro">
            Before booking, follow these 3 quick steps — most applicants can finish on their own
            after watching the video.
          </p>

          <ol className="guidance-steps">
            <li className="guidance-step">
              <span className="guidance-step-num">1</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">Watch the guidance video</div>
                <div className="guidance-step-desc">
                  See a walkthrough of the exact application form and common mistakes to avoid.
                </div>
                {guidanceLink ? (
                  <a
                    href={guidanceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guidance-chip-link guidance-chip-link--solid"
                  >
                    <FiYoutube aria-hidden="true" /> Watch: How to Apply
                  </a>
                ) : (
                  <div className="small text-muted" style={{ marginTop: 4 }}>
                    Video not available for this notification yet.
                  </div>
                )}
              </div>
            </li>

            <li className="guidance-step">
              <span className="guidance-step-num">2</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">Try applying yourself</div>
                <div className="guidance-step-desc">
                  Head to the official application portal and fill the form using what you just
                  watched.
                </div>
              </div>
            </li>

            <li className="guidance-step">
              <span className="guidance-step-num">3</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">Still stuck? Book a free session</div>
                <div className="guidance-step-desc">
                  Get a FREE 15-minute 1:1 online guidance session. You can book up to 3 free
                  sessions for this application.
                </div>

                {isAuthenticated && allowance && (
                  <div className="guidance-status-panel guidance-status-panel--meter">
                    <div className="guidance-card-allowance">
                      <span>{allowance.used} of {allowance.max} free sessions used</span>
                      <div className="guidance-card-progress">
                        <div
                          className="guidance-card-progress-fill"
                          style={{ width: `${Math.min(100, (allowance.used / allowance.max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isAuthenticated && allowance?.hasActiveUpcoming ? (
                  <div className="guidance-status-panel guidance-status-panel--info">
                    <div>You have an upcoming session booked for this application.</div>
                    <Link
                      to="/dashboard?tab=guidance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="guidance-chip-link guidance-chip-link--solid"
                    >
                      Manage My Booking <span className="guidance-link-arrow">→</span>
                    </Link>
                  </div>
                ) : isAuthenticated && usedUp ? (
                  <div className="guidance-status-panel guidance-status-panel--muted">
                    You've used all 3 free guidance sessions for this application.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="guidance-book-btn"
                    style={{ marginTop: 8 }}
                    onClick={handleBookClick}
                  >
                    <FiClock aria-hidden="true" /> Book Free Guidance Slot
                  </button>
                )}
              </div>
            </li>
          </ol>

          <div className="guidance-card-footer">
            <Link to="/testimonials" target="_blank" rel="noopener noreferrer" className="guidance-chip-link guidance-chip-link--ghost">
              Read what others say <span className="guidance-link-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>

      <GuidanceBookingModal
        show={showModal}
        notificationId={notificationId}
        notificationTitle={notificationTitle}
        onClose={() => setShowModal(false)}
        onBooked={loadAllowance}
      />
    </div>
  );
};

export default GuidanceBookingCard;
