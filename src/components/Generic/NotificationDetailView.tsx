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
  BsBarChartFill,
} from "react-icons/bs";
import { FcViewDetails } from "react-icons/fc";
import { formatCategoryTitle, formatStateName, getId } from "../../utils/utils";
import type { INotification } from "../../interface/NotificationInterface";
import CongratulationsPopup from "../CongratulationsPopup";
import SupportPopup from "../SupportPopup";
import EligibilityModal from "../EligibilityModal";
import {
  trackActivity,
  checkActivityForNotification,
  removeActivity,
  type UserActivityStatus,
} from "../../services/private/userActivityApi";
import { checkEligibility, type IEligibilityResult } from "../../services/private/eligibilityApi";
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

const formatPercentage = (value?: string | number | null) => {
  if (value === null || value === undefined || value === 0 || value === "0")
    return "Not Specified";
  return `${Number(value)} %`;
};

const getGroupedFees = (fee?: INotification["fee"]) => {
  if (fee === null || fee === undefined) return [];
  const map: Record<string, string[]> = {};
  const fees = [
    { key: "general_fee", label: "Gen" },
    { key: "ews_fee", label: "EWS" },
    { key: "obc_fee", label: "OBC" },
    { key: "sc_fee", label: "SC" },
    { key: "st_fee", label: "ST" },
    { key: "ph_fee", label: "PH" },
    { key: "female_fee", label: "Female" },
  ] as const;

  fees.forEach(({ key, label }) => {
    const value = fee[key];
    if (value !== null && value !== undefined) {
      const formatted = formatCurrency(value);
      map[formatted] = map[formatted] || [];
      map[formatted].push(label);
    }
  });

  return Object.entries(map).sort((a, b) => {
    // Put "₹ 0" group at the end if you want, or just alphabetical
    return b[1].length - a[1].length;
  });
};

const renderAgeInfo = (min?: number | null, max?: number | null) => {
  const isMinZero = min === null || min === undefined || min === 0;
  const isMaxZero = max === null || max === undefined || max === 0;

  if (isMinZero && isMaxZero) return "Not Specified";
  if (!isMinZero && isMaxZero) return `Minimum ${min} Years`;
  if (isMinZero && !isMaxZero) return `Maximum ${max} Years`;
  return `${min} – ${max} Years`;
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

const ACTIVITY_STAT_ITEMS: {
  field: "count_wishlisted" | "count_applied" | "count_admit_card" | "count_result" | "count_selected";
  label: string;
  emoji: string;
}[] = [
  { field: "count_wishlisted", label: "Wishlisted", emoji: "❤️" },
  { field: "count_applied", label: "Applied", emoji: "📝" },
  { field: "count_admit_card", label: "Admit Card", emoji: "🎫" },
  { field: "count_result", label: "Result Checked", emoji: "📊" },
  { field: "count_selected", label: "Selected", emoji: "🏆" },
];

const isDeadlinePassed = (lastDateToApply?: string): boolean => {
  if (!lastDateToApply) return false;
  const deadline = new Date(lastDateToApply).getTime();
  if (isNaN(deadline)) return false;
  return deadline < Date.now();
};

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
  const displayValue =
    value === null || value === undefined || value === ""
      ? (fallback ?? "Not Available")
      : value;

  if (displayValue === "Not Available") {
    return null; // hide completely if totally missing and no fallback provided
  }

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
  const [currentStatus, setCurrentStatus] = useState<UserActivityStatus | null>(
    null,
  );
  const [trackingLoading, setTrackingLoading] =
    useState<UserActivityStatus | null>(null);
  const [isWishlistedLoading, setIsWishlistedLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [congratsConfig, setCongratsConfig] = useState({
    title: "",
    message: "",
  });
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<IEligibilityResult | null>(null);

  useEffect(() => {
    if (isAuthenticated && notification?.sk) {
      checkActivityForNotification(notification.sk)
        .then((res) => {
          if (res.tracked && res.data) {
            setCurrentStatus(res.data.status);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, notification?.sk]);

  const handleTrackAction = async (step: (typeof TRACKING_STEPS)[number]) => {
    if (!isAuthenticated) {
      toast.info("🔒 Please login to track your progress!", {
        autoClose: 3000,
      });
      if (onShowAuthPopup) onShowAuthPopup();
      return;
    }
    setTrackingLoading(step.status);
    try {
      await trackActivity(
        notification.sk,
        notification.title,
        notification.category,
        step.status,
      );
      setCurrentStatus(step.status);
      setCongratsConfig({
        title: step.congratsTitle,
        message: step.congratsMessage,
      });
      setShowCongrats(true);
    } catch (error: any) {
      const msg = error?.message || "Failed to track activity";
      if (msg.includes("ATTEMPT_LIMIT_REACHED")) {
        setShowSupport(true);
      } else if (msg.includes("DEADLINE_PASSED")) {
        toast.error("Applications for this notification have closed.");
      } else if (msg.includes("Invalid status transition")) {
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
    if (currentStatus !== 0 && deadlinePassed) {
      toast.error("Applications for this notification have closed.");
      return;
    }

    setIsWishlistedLoading(true);
    try {
      if (currentStatus === 0) {
        await removeActivity(notification.sk);
        setCurrentStatus(null);
        toast.success("Removed from wishlist");
      } else {
        await trackActivity(
          notification.sk,
          notification.title,
          notification.category,
          0,
        );
        setCurrentStatus(0);
        toast.success("Added to wishlist!");
      }
    } catch (error: any) {
      const msg = error?.message || "Failed to update wishlist";
      if (msg.includes("ATTEMPT_LIMIT_REACHED")) {
        setShowSupport(true);
      } else if (msg.includes("DEADLINE_PASSED")) {
        toast.error("Applications for this notification have closed.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsWishlistedLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!isAuthenticated) {
      toast.info("🔒 Please login to check your eligibility!", { autoClose: 3000 });
      if (onShowAuthPopup) onShowAuthPopup();
      return;
    }
    setShowEligibility(true);
    setEligibilityLoading(true);
    setEligibilityResult(null);
    try {
      const id = getId(notification.sk);
      const result = await checkEligibility(id);
      setEligibilityResult(result);
    } catch (error: any) {
      setShowEligibility(false);
      toast.error(error?.message || "Failed to check eligibility");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const deadlinePassed = isDeadlinePassed(notification.last_date_to_apply);
  const hasAlreadyApplied = currentStatus !== null && currentStatus !== 0;

  const getStepState = (stepIndex: number) => {
    if (currentStatus === null || currentStatus === 0) {
      if (stepIndex !== 0) return "locked";
      return deadlinePassed ? "locked" : "active";
    }
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
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: React.ReactNode;
    iconClass: string;
  }[];

  const hasAnyLinks =
    notification.links?.apply_online_url || linkItems.length > 0;

  const isJob = notification.category === "job";
  const needsFeesAndDates = ["job", "entrance-exam", "admission"].includes(
    notification.category,
  );
  const needsEligibility = notification.category !== "documents";
  const groupedFees = getGroupedFees(notification.fee);
  const isAllFeesZero = groupedFees.length === 1 && groupedFees[0][0] === "₹ 0";

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
              {(!adminRole ||
                adminRole === "creator" ||
                adminRole === "senior_reviewer" ||
                adminRole === "admin") &&
                (adminRole === "admin" ||
                  adminRole === "senior_reviewer" ||
                  !notification.approved_at) && (
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
          {!isAdmin && (
            <div className="ndv-hero-actions">
              {(currentStatus === 0 ||
                (currentStatus === null && !deadlinePassed)) && (
                <button
                  className={`ndv-btn-wishlist ${currentStatus === 0 ? "ndv-btn-wishlist--active" : ""}`}
                  onClick={handleWishlistToggle}
                  disabled={isWishlistedLoading}
                >
                  {isWishlistedLoading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : currentStatus === 0 ? (
                    <>
                      <BsHeartFill /> Wishlisted
                    </>
                  ) : (
                    <>
                      <BsHeart /> Add to Wishlist
                    </>
                  )}
                </button>
              )}
              <button
                className="ndv-btn-eligibility"
                onClick={handleCheckEligibility}
              >
                <BsCheckCircle /> Check Eligibility
              </button>
            </div>
          )}
        </div>
      </section>

      <EligibilityModal
        show={showEligibility}
        loading={eligibilityLoading}
        result={eligibilityResult}
        onClose={() => setShowEligibility(false)}
      />

      {/* ═══════════════ CONTENT ═══════════════ */}
      <div className="ndv-content">
        {/* Short description */}
        {notification.details?.short_description && (
          <div
            className="ndv-short-desc"
            dangerouslySetInnerHTML={{
              __html: notification.details.short_description.replace(
                /&nbsp;/g,
                " ",
              ),
            }}
          />
        )}

        {/* ═══════════════ INFO CARDS ═══════════════ */}
        <div className="row g-3 mb-3">
          {/* Basic Details */}
          <div className="col-12 col-md-6">
            <div className="ndv-card" style={{ animationDelay: "0.1s" }}>
              <div className="ndv-card-header ndv-card-header--blue">
                <div className="ndv-card-icon ndv-card-icon--blue">
                  <FcViewDetails />
                </div>
                <h3 className="ndv-card-title">Basic Details</h3>
              </div>
              <div className="ndv-card-body">
                <LabelValue
                  label="Category"
                  value={formatCategoryTitle(notification.category)}
                />
                <LabelValue
                  label="Department"
                  value={notification.department}
                />
                <LabelValue
                  label="State / Region"
                  value={formatStateName(notification.state)}
                  highlight
                />
                {isJob && (
                  <LabelValue
                    label="Total Vacancies"
                    value={
                      notification.total_vacancies
                        ? notification.total_vacancies
                        : "Not Specified"
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Important Dates */}
          {needsFeesAndDates && (
            <div className="col-12 col-md-6">
              <div className="ndv-card" style={{ animationDelay: "0.15s" }}>
                <div className="ndv-card-header ndv-card-header--orange">
                  <div className="ndv-card-icon ndv-card-icon--orange">
                    <BsCalendar />
                  </div>
                  <h3 className="ndv-card-title">Important Dates</h3>
                </div>
                <div className="ndv-card-body">
                  <LabelValue
                    label="Start Date"
                    value={formatDate(notification.start_date)}
                  />
                  <LabelValue
                    label="Last Date To Apply"
                    value={formatDate(notification.last_date_to_apply)}
                    highlight
                  />
                  <LabelValue
                    label="Exam Date"
                    value={formatDate(notification.exam_date)}
                  />
                  {(notification as any).admit_card_date && (
                    <LabelValue
                      label="Admit Card Date"
                      value={formatDate((notification as any).admit_card_date)}
                    />
                  )}
                  {(notification as any).result_date && (
                    <LabelValue
                      label="Result Date"
                      value={formatDate((notification as any).result_date)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fees */}
          {needsFeesAndDates && (
            <div className="col-12 col-md-6">
              <div className="ndv-card" style={{ animationDelay: "0.2s" }}>
                <div className="ndv-card-header ndv-card-header--green">
                  <div className="ndv-card-icon ndv-card-icon--green">
                    <BsCurrencyRupee />
                  </div>
                  <h3 className="ndv-card-title">Application Fees</h3>
                </div>
                <div className="ndv-card-body">
                  {isAllFeesZero ? (
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span
                        className="badge"
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          fontSize: "0.9rem",
                          padding: "0.4rem 0.8rem",
                        }}
                      >
                        No Application Fee
                      </span>
                    </div>
                  ) : (
                    groupedFees.map(([fee, cats]) => (
                      <LabelValue
                        key={fee}
                        label={`${cats.join("/")} Fee`}
                        value={fee}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Eligibility */}
          {needsEligibility && (
            <div className="col-12 col-md-6">
              <div className="ndv-card" style={{ animationDelay: "0.25s" }}>
                <div className="ndv-card-header ndv-card-header--purple">
                  <div className="ndv-card-icon ndv-card-icon--purple">
                    <BsFillPersonFill />
                  </div>
                  <h3 className="ndv-card-title">Eligibility</h3>
                </div>
                <div className="ndv-card-body">
                  <LabelValue
                    label="Age"
                    value={renderAgeInfo(
                      notification.eligibility?.min_age,
                      notification.eligibility?.max_age,
                    )}
                  />
                  <LabelValue
                    label="Qualification"
                    value={notification.eligibility?.qualification}
                  />
                  <LabelValue
                    label="Specialization"
                    value={notification.eligibility?.specialization}
                  />
                  {notification.eligibility?.min_percentage ? (
                    <LabelValue
                      label="Minimum Percentage"
                      value={formatPercentage(
                        notification.eligibility?.min_percentage,
                      )}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════ LONG DESCRIPTION ═══════════════ */}
        {notification.details?.long_description && (
          <div
            className="ndv-long-desc"
            dangerouslySetInnerHTML={{
              __html: notification.details.long_description.replace(
                /&nbsp;/g,
                " ",
              ),
            }}
          />
        )}

        {/* ═══════════════ IMPORTANT LINKS ═══════════════ */}
        {hasAnyLinks && (
          <div className="ndv-links">
            <h2 className="ndv-links-title">
              <BsLink45Deg style={{ color: "var(--color-secondary)" }} /> Important Links
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
                    <span className={`ndv-link-icon ${item.iconClass}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ APPLICANT ACTIVITY ═══════════════ */}
        <div className="row g-3 mb-3">
          <div className="col-12">
            <div className="ndv-card" style={{ animationDelay: "0.3s" }}>
              <div className="ndv-card-header ndv-card-header--teal">
                <div className="ndv-card-icon ndv-card-icon--teal">
                  <BsBarChartFill />
                </div>
                <h3 className="ndv-card-title">Applicant Activity</h3>
              </div>
              <div className="ndv-card-body">
                <div className="ndv-stats-grid">
                  {ACTIVITY_STAT_ITEMS.map((item) => (
                    <div className="ndv-stat-pill" key={item.field}>
                      <span className="ndv-stat-value">
                        {notification[item.field] ?? 0}
                      </span>
                      <span className="ndv-stat-label">
                        {item.emoji} {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ TRACK YOUR PROGRESS ═══════════════ */}
        {!isAdmin && (
          <div className="ndv-track" id="track-progress-section">
            <div className="ndv-track-title">🚀 Track Your Progress</div>
            <p className="ndv-track-subtitle">
              Follow your journey step by step — each milestone unlocks the
              next!
            </p>

            {deadlinePassed && !hasAlreadyApplied && (
              <div className="ndv-track-note" style={{ borderColor: "var(--color-danger)" }}>
                <BsLockFill color="var(--color-danger)" />
                <span>
                  <strong>Applications closed</strong> — the last date to
                  apply for this notification has passed, so it can no
                  longer be marked as Applied.
                </span>
              </div>
            )}

            <div className="ndv-track-note">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="var(--color-secondary)"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
              <span className="d-flex align-items-center flex-wrap gap-2">
                <strong>Note:</strong> You can track an application a maximum of{" "}
                <strong>3 times</strong>. To remove it, go to your
                <button
                  onClick={() => window.open("/dashboard", "_blank")}
                  style={{
                    background: "var(--color-secondary)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "0.85em",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Dashboard
                </button>
              </span>
            </div>

            {/* Stepper */}
            <div className="ndv-stepper">
              {TRACKING_STEPS.map((step, i) => {
                const state = getStepState(i);
                return (
                  <React.Fragment key={step.status}>
                    <div className="ndv-step">
                      <div
                        className={`ndv-step-circle ndv-step-circle--${state}`}
                      >
                        {state === "completed" ? "✓" : i + 1}
                      </div>
                      <span
                        className={`ndv-step-label ndv-step-label--${state}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div
                        className={`ndv-step-connector ${
                          getStepState(i) === "completed"
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
                    disabled={
                      state === "locked" || state === "completed" || isLoading
                    }
                    title={
                      i === 0 && state === "locked" && deadlinePassed
                        ? "Applications for this notification have closed"
                        : undefined
                    }
                    onClick={() => handleTrackAction(step)}
                  >
                    {isLoading ? (
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                      >
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

        {/* ═══════════════ ADMIN METADATA ═══════════════ */}
        {isAdmin && (
          <div className="ndv-admin-meta">
            <div
              className="ndv-card-header ndv-card-header--blue"
              style={{
                margin: "-1.5rem -1.5rem 1rem",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <div className="ndv-card-icon ndv-card-icon--blue">
                <BsGear />
              </div>
              <h3 className="ndv-card-title">Admin Metadata</h3>
            </div>
            <LabelValue
              label="Created By"
              value={notification.created_by || "Unknown"}
            />
            <LabelValue
              label="Created At"
              value={formatDateTime(notification.created_at)}
            />
            <LabelValue
              label="Modified At"
              value={formatDateTime(notification.modified_at)}
            />
            <LabelValue
              label="Approved By"
              value={notification.approved_by || "Pending"}
            />
            <LabelValue
              label="Approved At"
              value={
                notification.approved_at
                  ? formatDateTime(notification.approved_at)
                  : "Pending approval"
              }
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

      {/* Support Popup for Limit Reached */}
      <SupportPopup show={showSupport} onClose={() => setShowSupport(false)} />
    </main>
  );
}
