import React, { useEffect, useState } from "react";
import {
  BsCalendar,
  BsFillPersonFill,
  BsCurrencyRupee,
  BsLink45Deg,
  BsArrowUpRightCircle,
  BsGear,
  BsDownload,
  BsFileEarmarkText,
  BsGlobe,
  BsCheckCircle,
  BsYoutube,
  BsCheckCircleFill,
  BsLockFill,
  BsHeart,
  BsHeartFill,
} from "react-icons/bs";
import { FcViewDetails } from "react-icons/fc";
import { formatCategoryTitle, formatStateName, getId } from "../../utils/utils";
import type { INotification } from "../../interface/NotificationInterface";
import CongratulationsPopup from "../CongratulationsPopup";
import {
  trackActivity,
  checkActivityForNotification,
  removeActivity,
  type UserActivityStatus,
} from "../../services/private/userActivityApi";
import { toast } from "react-toastify";
import "./NotificationDetailView.css";

/* ──────────────── Helpers ──────────────── */

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "Not Released";

const formatDateTime = (d?: number | string | null) => {
  if (!d) return "—";
  const date = typeof d === "number" ? new Date(d) : new Date(d);
  return isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN");
};

const formatCurrency = (amount?: string | number | null) => {
  if (amount === null || amount === undefined) return "—";
  return `₹ ${Number(amount).toLocaleString()}`;
};

const formatPercentage = (value?: string | number) => {
  if (value === null || value === undefined) return "Not Specified";
  return `${Number(value)}`;
};

const getGroupedFees = (fee?: INotification["fee"]) => {
  if (fee === null || fee === undefined) return [];
  const map: Record<string, string[]> = {};
  const fees = [
    { key: "general_fee", label: "Gen" },
    { key: "obc_fee", label: "OBC" },
    { key: "sc_fee", label: "SC" },
    { key: "st_fee", label: "ST" },
    { key: "ph_fee", label: "PH" },
  ] as const;

  fees.forEach(({ key, label }) => {
    const value = fee[key];
    if (value !== null && value !== undefined) {
      const formatted = formatCurrency(value);
      map[formatted] = map[formatted] || [];
      map[formatted].push(label);
    }
  });
  return Object.entries(map);
};

/* ──────────────── Tracking Steps Config ──────────────── */

const TRACKING_STEPS: {
  status: UserActivityStatus;
  label: string;
  emoji: string;
  congratsTitle: string;
  congratsMessage: string;
}[] = [
    {
      status: 1,
      label: "Mark as Applied",
      emoji: "📝",
      congratsTitle: "🎉 Application Submitted!",
      congratsMessage:
        "You've taken the first step towards your dream job! Stay focused and keep going!",
    },
    {
      status: 2,
      label: "Admit Card Downloaded",
      emoji: "🎫",
      congratsTitle: "🎉 Admit Card Ready!",
      congratsMessage:
        "Great progress! Your admit card is secured. Prepare well for the exam!",
    },
    {
      status: 3,
      label: "Result Downloaded",
      emoji: "📊",
      congratsTitle: "🎉 Result Checked!",
      congratsMessage:
        "Awesome! You've checked your result. Keep pushing towards the finish line!",
    },
    {
      status: 4,
      label: "Selected / Joined",
      emoji: "🏆",
      congratsTitle: "🏆 You Made It!",
      congratsMessage:
        "Incredible achievement! You've been selected! This is the start of something amazing!",
    },
  ];

const STATUS_ORDER: UserActivityStatus[] = [1, 2, 3, 4];

/* ──────────────── Sub-components ──────────────── */

const LabelValue = ({
  label,
  value,
  highlight = false,
  fallback,
}: {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
  fallback?: string;
}) => {
  const displayValue = value ? value : (fallback ?? "Not Available");
  return (
    <div className="ndv-lv">
      <span className="ndv-lv-label">{label}</span>
      <span
        className={`ndv-lv-value ${highlight ? "ndv-lv-value--highlight" : ""} ${!value ? "ndv-lv-value--muted" : ""}`}
      >
        {displayValue}
      </span>
    </div>
  );
};

/* ──────────────── Main Component ──────────────── */

export default function NotificationDetailView({
  notification,
  isAdmin = false,
  adminRole,
  isAuthenticated = false,
  onShowAuthPopup,
  onApprove,
  approving,
}: {
  notification: INotification;
  isAdmin?: boolean;
  adminRole?: string;
  isAuthenticated?: boolean;
  onShowAuthPopup?: () => void;
  onApprove?: () => void;
  approving?: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState<UserActivityStatus | null>(null);
  const [trackingLoading, setTrackingLoading] = useState<UserActivityStatus | null>(null);
  const [isWishlistedLoading, setIsWishlistedLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsConfig, setCongratsConfig] = useState({ title: "", message: "" });

  useEffect(() => {
    if (isAuthenticated && notification?.sk) {
      checkActivityForNotification(notification.sk)
        .then((res) => {
          if (res.tracked && res.data) {
            setCurrentStatus(res.data.status);
          }
        })
        .catch(() => { });
    }
  }, [isAuthenticated, notification?.sk]);

  const handleTrackAction = async (step: (typeof TRACKING_STEPS)[number]) => {
    if (!isAuthenticated) {
      toast.info("🔒 Please login to track your progress!", { autoClose: 3000 });
      if (onShowAuthPopup) onShowAuthPopup();
      return;
    }
    setTrackingLoading(step.status);
    try {
      await trackActivity(notification.sk, notification.title, notification.category, step.status);
      setCurrentStatus(step.status);
      setCongratsConfig({ title: step.congratsTitle, message: step.congratsMessage });
      setShowCongrats(true);
    } catch (error: any) {
      const msg = error?.message || "Failed to track activity";
      if (msg.includes("Invalid status transition")) {
        toast.warning("Complete the previous step first!");
      } else {
        toast.error(msg);
      }
    } finally {
      setTrackingLoading(null);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info("🔒 Please login to add to wishlist!", { autoClose: 3000 });
      if (onShowAuthPopup) onShowAuthPopup();
      return;
    }
    setIsWishlistedLoading(true);
    try {
      if (currentStatus === 0) {
        await removeActivity(notification.sk);
        setCurrentStatus(null);
        toast.success("Removed from wishlist");
      } else {
        await trackActivity(notification.sk, notification.title, notification.category, 0);
        setCurrentStatus(0);
        toast.success("Added to wishlist!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update wishlist");
    } finally {
      setIsWishlistedLoading(false);
    }
  };

  const getStepState = (stepIndex: number) => {
    if (currentStatus === null || currentStatus === 0) return stepIndex === 0 ? "active" : "locked";
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (stepIndex <= currentIndex) return "completed";
    if (stepIndex === currentIndex + 1) return "active";
    return "locked";
  };

  if (!notification) return null;

  /* ── Build link items array ── */
  const linkItems = [
    notification.links?.admit_card_url && {
      href: notification.links.admit_card_url,
      label: "Admit Card",
      icon: <BsDownload />,
      iconClass: "ndv-link-icon--green",
    },
    notification.links?.notification_pdf_url && {
      href: notification.links.notification_pdf_url,
      label: "Notification PDF",
      icon: <BsFileEarmarkText />,
      iconClass: "ndv-link-icon--red",
    },
    notification.links?.official_website_url && {
      href: notification.links.official_website_url,
      label: "Official Website",
      icon: <BsGlobe />,
      iconClass: "ndv-link-icon--dark",
    },
    notification.links?.result_url && {
      href: notification.links.result_url,
      label: "Result",
      icon: <BsCheckCircle />,
      iconClass: "ndv-link-icon--amber",
    },
    notification.links?.answer_key_url && {
      href: notification.links.answer_key_url,
      label: "Answer Key",
      icon: <BsFileEarmarkText />,
      iconClass: "ndv-link-icon--gray",
    },
    notification.links?.youtube_link && {
      href: notification.links.youtube_link,
      label: "YouTube",
      icon: <BsYoutube />,
      iconClass: "ndv-link-icon--youtube",
    },
    notification.links?.other_links && {
      href: notification.links.other_links,
      label: "Other Links",
      icon: <BsLink45Deg />,
      iconClass: "ndv-link-icon--dark",
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; iconClass: string }[];

  const hasAnyLinks = notification.links?.apply_online_url || linkItems.length > 0;

  return (
    <main className="ndv-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="ndv-hero">
        <div className="ndv-hero-inner">
          {/* Admin bar inside hero */}
          {isAdmin && (
            <div className="ndv-admin-bar">
              <button
                className="ndv-admin-btn ndv-admin-btn--back"
                onClick={() => window.history.back()}
              >
                ← Dashboard
              </button>
              {(!adminRole || adminRole === "creator" || adminRole === "admin") && (
                <a
                  href={`/admin/edit/${getId(notification.sk)}`}
                  className="ndv-admin-btn ndv-admin-btn--edit"
                >
                  ✏️ Edit
                </a>
              )}
              {!notification.approved_at && onApprove && (
                <button
                  className="ndv-admin-btn ndv-admin-btn--approve"
                  onClick={onApprove}
                  disabled={approving}
                >
                  {approving ? "Approving…" : "✓ Approve"}
                </button>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="ndv-badge-row">
            {notification.category && (
              <span className="ndv-badge ndv-badge--category">
                {formatCategoryTitle(notification.category)}
              </span>
            )}
            {notification.state && (
              <span className="ndv-badge ndv-badge--state">
                📍 {formatStateName(notification.state)}
              </span>
            )}
            {notification.department && (
              <span className="ndv-badge ndv-badge--dept">
                🏛 {notification.department}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="ndv-hero-title">{notification.title}</h1>

          {/* Hero actions */}
          {!isAdmin && (currentStatus === null || currentStatus === 0) && (
            <div className="ndv-hero-actions">
              <button
                className={`ndv-btn-wishlist ${currentStatus === 0 ? "ndv-btn-wishlist--active" : ""}`}
                onClick={handleWishlistToggle}
                disabled={isWishlistedLoading}
              >
                {isWishlistedLoading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : currentStatus === 0 ? (
                  <><BsHeartFill /> Wishlisted</>
                ) : (
                  <><BsHeart /> Add to Wishlist</>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div className="ndv-content">
        {/* Short description */}
        {notification.details?.short_description && (
          <div
            className="ndv-short-desc"
            dangerouslySetInnerHTML={{ __html: notification.details.short_description }}
          />
        )}

        {/* ═══════════════ TRACK YOUR PROGRESS ═══════════════ */}
        {!isAdmin && (
          <div className="ndv-track" id="track-progress-section">
            <div className="ndv-track-title">🚀 Track Your Progress</div>
            <p className="ndv-track-subtitle">
              Follow your journey step by step — each milestone unlocks the next!
            </p>

            <div className="ndv-track-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#667eea" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
              <span>
                <strong>Note:</strong> You can track and remove an application a maximum of <strong>2 times</strong>.
              </span>
            </div>

            {/* Stepper */}
            <div className="ndv-stepper">
              {TRACKING_STEPS.map((step, i) => {
                const state = getStepState(i);
                return (
                  <React.Fragment key={step.status}>
                    <div className="ndv-step">
                      <div className={`ndv-step-circle ndv-step-circle--${state}`}>
                        {state === "completed" ? "✓" : i + 1}
                      </div>
                      <span className={`ndv-step-label ndv-step-label--${state}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`ndv-step-connector ${getStepState(i) === "completed"
                          ? "ndv-step-connector--done"
                          : "ndv-step-connector--pending"
                          }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="ndv-track-actions">
              {TRACKING_STEPS.map((step, i) => {
                const state = getStepState(i);
                const isLoading = trackingLoading === step.status;
                return (
                  <button
                    key={step.status}
                    id={`track-btn-${step.status}`}
                    className={`ndv-track-btn ndv-track-btn--${state}`}
                    disabled={state === "locked" || state === "completed" || isLoading}
                    onClick={() => handleTrackAction(step)}
                  >
                    {isLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <span className="ndv-track-btn-emoji">
                          {state === "completed" ? (
                            <BsCheckCircleFill />
                          ) : state === "locked" ? (
                            <BsLockFill />
                          ) : (
                            step.emoji
                          )}
                        </span>
                        <span>{step.label}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ INFO CARDS ═══════════════ */}
        <div className="row g-3 mb-3">
          {/* Basic Details */}
          <div className="col-12 col-md-6">
            <div className="ndv-card" style={{ animationDelay: "0.1s" }}>
              <div className="ndv-card-header ndv-card-header--blue">
                <div className="ndv-card-icon ndv-card-icon--blue"><FcViewDetails /></div>
                <h3 className="ndv-card-title">Basic Details</h3>
              </div>
              <div className="ndv-card-body">
                <LabelValue label="Category" value={formatCategoryTitle(notification.category)} />
                <LabelValue label="Department" value={notification.department} />
                <LabelValue label="State / Region" value={formatStateName(notification.state)} highlight />
                <LabelValue label="Total Vacancies" value={notification.total_vacancies} />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="col-12 col-md-6">
            <div className="ndv-card" style={{ animationDelay: "0.15s" }}>
              <div className="ndv-card-header ndv-card-header--orange">
                <div className="ndv-card-icon ndv-card-icon--orange"><BsCalendar /></div>
                <h3 className="ndv-card-title">Important Dates</h3>
              </div>
              <div className="ndv-card-body">
                <LabelValue label="Start Date" value={formatDate(notification.start_date)} />
                <LabelValue label="Last Date To Apply" value={formatDate(notification.last_date_to_apply)} highlight />
                <LabelValue label="Exam Date" value={formatDate(notification.exam_date)} />
                <LabelValue label="Admit Card Date" value={formatDate((notification as any).admit_card_date)} />
                <LabelValue label="Result Date" value={formatDate((notification as any).result_date)} />

                {notification.details?.important_date_details && (
                  <div
                    className="mt-3"
                    style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.6, wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{ __html: notification.details.important_date_details }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="col-12 col-md-6">
            <div className="ndv-card" style={{ animationDelay: "0.2s" }}>
              <div className="ndv-card-header ndv-card-header--green">
                <div className="ndv-card-icon ndv-card-icon--green"><BsCurrencyRupee /></div>
                <h3 className="ndv-card-title">Application Fees</h3>
              </div>
              <div className="ndv-card-body">
                {getGroupedFees(notification.fee).map(([fee, cats]) => (
                  <LabelValue key={fee} label={`${cats.join("/")} Fee`} value={fee} />
                ))}

                {notification.fee?.other_fee_details && (
                  <div className="mt-3">
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1f2937", display: "block", marginBottom: 4 }}>
                      Other Fee Details
                    </span>
                    <div
                      style={{ fontSize: "0.85rem", color: "#6b7280", wordBreak: "break-word", lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: notification.fee.other_fee_details }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="col-12 col-md-6">
            <div className="ndv-card" style={{ animationDelay: "0.25s" }}>
              <div className="ndv-card-header ndv-card-header--purple">
                <div className="ndv-card-icon ndv-card-icon--purple"><BsFillPersonFill /></div>
                <h3 className="ndv-card-title">Eligibility</h3>
              </div>
              <div className="ndv-card-body">
                <LabelValue
                  label="Age"
                  value={`${notification.eligibility?.min_age ?? "—"} – ${notification.eligibility?.max_age ?? "—"} Years`}
                />
                <LabelValue label="Qualification" value={notification.eligibility?.qualification} />
                <LabelValue label="Specialization" value={notification.eligibility?.specialization} />
                <LabelValue label="Minimum %" value={formatPercentage(notification.eligibility?.min_percentage)} />

                {notification.eligibility?.age_relaxation_details && (
                  <div className="mt-3">
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1f2937", display: "block", marginBottom: 4 }}>
                      Age Relaxation
                    </span>
                    <div
                      style={{ fontSize: "0.85rem", color: "#6b7280", wordBreak: "break-word", lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: notification.eligibility.age_relaxation_details }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ IMPORTANT LINKS ═══════════════ */}
        {hasAnyLinks && (
          <div className="ndv-links">
            <h2 className="ndv-links-title">
              <BsLink45Deg style={{ color: "#667eea" }} /> Important Links
            </h2>

            {notification.links?.apply_online_url && (
              <a
                href={notification.links.apply_online_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ndv-links-primary"
              >
                <BsArrowUpRightCircle style={{ marginRight: 8 }} />
                Apply Online
              </a>
            )}

            {linkItems.length > 0 && (
              <div className="ndv-links-grid">
                {linkItems.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ndv-link-item"
                  >
                    <span className={`ndv-link-icon ${item.iconClass}`}>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ LONG DESCRIPTION ═══════════════ */}
        {notification.details?.long_description && (
          <div
            className="ndv-long-desc"
            dangerouslySetInnerHTML={{ __html: notification.details.long_description }}
          />
        )}

        {/* ═══════════════ ADMIN METADATA ═══════════════ */}
        {isAdmin && (
          <div className="ndv-admin-meta">
            <div className="ndv-card-header ndv-card-header--blue" style={{ margin: "-1.5rem -1.5rem 1rem", borderRadius: "16px 16px 0 0" }}>
              <div className="ndv-card-icon ndv-card-icon--blue"><BsGear /></div>
              <h3 className="ndv-card-title">Admin Metadata</h3>
            </div>
            <LabelValue label="Created At" value={formatDateTime(notification.created_at)} />
            <LabelValue label="Modified At" value={formatDateTime(notification.modified_at)} />
            <LabelValue label="Approved By" value={notification.approved_by || "Pending"} />
            <LabelValue
              label="Approved At"
              value={notification.approved_at ? formatDateTime(notification.approved_at) : "Pending approval"}
            />
          </div>
        )}
      </div>

      {/* Congratulations Popup */}
      <CongratulationsPopup
        show={showCongrats}
        onClose={() => setShowCongrats(false)}
        title={congratsConfig.title}
        message={congratsConfig.message}
      />
    </main>
  );
}
