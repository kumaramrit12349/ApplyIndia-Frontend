import React, { useState, useEffect } from "react";
import type { HomePageNotification } from "../../../types/notification";
import { makeSlug } from "../../../utils/utils";
import { trackActivity, checkActivityForNotification, type UserActivityStatus } from "../../../services/private/userActivityApi";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../components/Generic/ConfirmationModal";
import CongratulationsPopup from "../../../components/CongratulationsPopup";

const STATUS_ORDER: UserActivityStatus[] = [1, 2, 3, 4];

const STATUS_CONFIG: Record<UserActivityStatus, { label: string; actionText: string; emoji: string; congratsTitle: string; congratsMessage: string }> = {
  1: {
    label: "Applied", actionText: "Mark as Applied", emoji: "📝",
    congratsTitle: "🎉 Application Submitted!",
    congratsMessage: "You've taken the first step towards your dream job! Stay focused and keep going!",
  },
  2: {
    label: "Admit Card", actionText: "Mark Admit Card", emoji: "🎫",
    congratsTitle: "🎉 Admit Card Ready!",
    congratsMessage: "Great progress! Your admit card is secured. Prepare well for the exam!",
  },
  3: {
    label: "Result", actionText: "Mark Result", emoji: "📊",
    congratsTitle: "🎉 Result Checked!",
    congratsMessage: "Awesome! You've checked your result. Keep pushing towards the finish line!",
  },
  4: {
    label: "Selected", actionText: "Mark Selected", emoji: "🏆",
    congratsTitle: "🏆 You Made It!",
    congratsMessage: "Incredible achievement! You've been selected! This is the start of something amazing!",
  },
};

const TrackButton = ({ notification, category }: { notification: HomePageNotification; category: string }) => {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<UserActivityStatus | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsConfig, setCongratsConfig] = useState({ title: "", message: "" });

  // ensure SK is fully formatted as the DB expects
  const fullSk = notification.sk?.startsWith("Notification#")
    ? notification.sk
    : `Notification#${notification.sk}#META`;

  useEffect(() => {
    if (!fullSk) return;

    // Attempt to fetch current status. If unauthenticated, it will fail silently.
    checkActivityForNotification(fullSk)
      .then((res) => {
        if (res.tracked && res.data) {
          setCurrentStatus(res.data.status);
        }
      })
      .catch(() => {
        // Silently fail for unauthenticated or first-time
      })
      .finally(() => {
        setHasChecked(true);
      });
  }, [fullSk]);

  const getNextStatus = (): UserActivityStatus | null => {
    if (!currentStatus) return 1;
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex >= STATUS_ORDER.length - 1) return null; // All done!
    return STATUS_ORDER[currentIndex + 1];
  };

  const nextStatus = getNextStatus();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nextStatus) return; // Completely done

    setLoading(true);
    try {
      if (!fullSk) throw new Error("Missing notification ID");
      await trackActivity(fullSk, notification.title, category, nextStatus);
      setCurrentStatus(nextStatus);

      const config = STATUS_CONFIG[nextStatus];
      setCongratsConfig({
        title: config.congratsTitle,
        message: config.congratsMessage,
      });
      setShowCongrats(true);
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes("401") || msg.includes("User not authenticated") || msg.includes("Failed to fetch") || msg.includes("AUTH_REDIRECT")) {
        toast.info("🔒 Please login to track your progress");
        window.dispatchEvent(new Event("openAuthPopup"));
      } else if (msg.includes("ATTEMPT_LIMIT_REACHED")) {
        setShowLimitModal(true);
      } else if (msg.includes("Invalid status transition") || msg.includes("400")) {
        toast.info("Please complete the previous step first.");
      } else {
        toast.error("Failed to mark activity.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Do not render anything until we've quickly verified the state, avoiding UI flashes
  if (!hasChecked && !currentStatus) {
    return (
      <button className="btn btn-sm btn-outline-secondary placeholder-wave" style={{ borderRadius: "20px", fontSize: "0.75rem", padding: "4px 12px", width: "115px", opacity: 0.5 }}>
        <span className="placeholder w-100"></span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || !nextStatus}
        className={`btn btn-sm ${!nextStatus ? "btn-success" : currentStatus ? "btn-primary" : "btn-outline-primary"}`}
        style={{ borderRadius: "20px", fontSize: "0.75rem", padding: "4px 12px", zIndex: 10, position: "relative" }}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : !nextStatus ? (
          "✓ All Steps Complete"
        ) : currentStatus ? (
          `${STATUS_CONFIG[nextStatus].emoji} ${STATUS_CONFIG[nextStatus].actionText}`
        ) : (
          "📝 Mark as Applied"
        )}
      </button>

      {/* Limit Exceeded Popup */}
      {showLimitModal && (
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <ConfirmationModal
            show={showLimitModal}
            onHide={() => setShowLimitModal(false)}
            onConfirm={() => setShowLimitModal(false)}
            title="Tracking Limit Reached"
            variant="primary"
            confirmText="Got it"
            cancelText="Close"
            message={
              <>
                <p>You have reached the maximum limit for marking and removing this particular application.</p>
                <div className="alert alert-warning mt-3 py-2 px-3 mb-0" style={{ fontSize: "0.85rem" }}>
                  <strong>Note:</strong> To prevent accidental spam, you can only track and restart an application heavily a maximum of <strong>2 times</strong>. This application is now locked from further tracking changes.
                </div>
              </>
            }
          />
        </div>
      )}

      {/* Congratulations Popup */}
      {showCongrats && (
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <CongratulationsPopup
            show={showCongrats}
            onClose={() => setShowCongrats(false)}
            title={congratsConfig.title}
            message={congratsConfig.message}
          />
        </div>
      )}
    </>
  );
};

interface ListViewProps {
  category: string;
  items: HomePageNotification[];
  loading?: boolean;
  onItemClick?: (item: Notification) => void; // You can now ignore this if always opening links in new tab
  showSeeMore?: boolean;
  showAllItems?: boolean;
}

const ListView: React.FC<ListViewProps> = ({
  category,
  items,
  loading = false,
  showSeeMore = true,
  showAllItems = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayedItems = showAllItems
    ? items
    : showAll
      ? items
      : items.slice(0, 5);

  // Use a normalized path for category (lowercase, hyphens, e.g.: "Admit Cards" -> "admit-card")
  const getCategoryRoute = (category: string) => {
    return `/notification/category/${encodeURIComponent(category)}`;
  };

  return (
    <div>
      {/* Card Header */}
      <div
        className="card-header bg-primary text-white py-3"
        style={{
          borderTopLeftRadius: "0.6rem",
          borderTopRightRadius: "0.6rem",
        }}
      >
        <h5
          className="mb-0 fw-semibold text-capitalize ms-2"
          style={{ fontSize: "1.1rem" }}
        >
          {category
            ?.replace(/[-]/g, " ")
            ?.replace(/\b\w/g, (l) => l?.toUpperCase())}
        </h5>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0">No notifications available</p>
          </div>
        ) : (
          <>
            <ul className="list-group list-group-flush px-1 px-sm-2">
              {displayedItems.map((item, index) => {
                const itemUrl = `/notification/${makeSlug(item.title, item.sk)}`;

                return (
                  <div
                    key={item.sk || index}
                    onClick={() => window.open(itemUrl, "_blank")}
                    className="list-group-item d-flex align-items-center gap-2 py-3 border-0"
                    style={{
                      cursor: "pointer",
                      transition: "background 0.2s, box-shadow 0.2s",
                      borderRadius: "0.6rem",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      fontSize: "1.06rem",
                      color: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f9fd";
                      e.currentTarget.style.boxShadow = "0 2px 8px #d9e8fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div className="flex-grow-1">
                      <span
                        className="text-dark fw-medium"
                        style={{ wordBreak: "break-word", fontSize: "1.08rem", display: "block", marginBottom: "4px" }}
                      >
                        {item.title}
                      </span>

                      {/* Mark as Applied Button Area */}
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <TrackButton
                          notification={item}
                          category={category}
                        />
                      </div>
                    </div>
                    <div className="ms-2 d-flex flex-column align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="text-muted"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </ul>
            {showSeeMore && !showAllItems && items.length > 5 && (
              <div className="p-3 bg-light border-top">
                {showAll ? (
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => setShowAll(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="me-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
                      />
                    </svg>
                    See Less
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => {
                      window.open(getCategoryRoute(category), "_blank");
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="me-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                    See More
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListView;
