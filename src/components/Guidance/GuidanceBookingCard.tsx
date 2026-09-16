import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiLifeBuoy, FiClock, FiYoutube } from "react-icons/fi";
import { fetchBookingAllowance } from "../../services/private/guidanceApi";
import type { IGuidanceBookingAllowance } from "../../interface/GuidanceInterface";
import { useTranslation } from "../../i18n/useTranslation";
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
  const { guidance: t } = useTranslation();

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
          <h3 className="ndv-card-title">{t.cardTitle}</h3>
        </div>
        <div className="ndv-card-body">
          <p className="guidance-card-intro">{t.intro}</p>

          <ol className="guidance-steps">
            <li className="guidance-step">
              <span className="guidance-step-num">1</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">{t.step1Title}</div>
                <div className="guidance-step-desc">{t.step1Desc}</div>
                {guidanceLink ? (
                  <a
                    href={guidanceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guidance-chip-link guidance-chip-link--solid"
                  >
                    <FiYoutube aria-hidden="true" /> {t.watchVideo}
                  </a>
                ) : (
                  <div className="small text-muted" style={{ marginTop: 4 }}>
                    {t.videoUnavailable}
                  </div>
                )}
              </div>
            </li>

            <li className="guidance-step">
              <span className="guidance-step-num">2</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">{t.step2Title}</div>
                <div className="guidance-step-desc">{t.step2Desc}</div>
              </div>
            </li>

            <li className="guidance-step">
              <span className="guidance-step-num">3</span>
              <div className="guidance-step-body">
                <div className="guidance-step-title">{t.step3Title}</div>
                <div className="guidance-step-desc">{t.step3Desc}</div>

                {isAuthenticated && allowance && (
                  <div className="guidance-status-panel guidance-status-panel--meter">
                    <div className="guidance-card-allowance">
                      <span>{t.sessionsUsed(allowance.used, allowance.max)}</span>
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
                    <div>{t.upcomingSession}</div>
                    <Link
                      to="/dashboard?tab=guidance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="guidance-chip-link guidance-chip-link--solid"
                    >
                      {t.manageBooking} <span className="guidance-link-arrow">→</span>
                    </Link>
                  </div>
                ) : isAuthenticated && usedUp ? (
                  <div className="guidance-status-panel guidance-status-panel--muted">{t.usedUp}</div>
                ) : (
                  <button
                    type="button"
                    className="guidance-book-btn"
                    style={{ marginTop: 8 }}
                    onClick={handleBookClick}
                  >
                    <FiClock aria-hidden="true" /> {t.bookSlot}
                  </button>
                )}
              </div>
            </li>
          </ol>

          <div className="guidance-card-footer">
            <Link to="/testimonials" target="_blank" rel="noopener noreferrer" className="guidance-chip-link guidance-chip-link--ghost">
              {t.readTestimonials} <span className="guidance-link-arrow">→</span>
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
