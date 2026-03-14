import React, { useState, useEffect } from "react";
import type { HomePageNotification } from "../../../types/notification";
import { makeSlug } from "../../../utils/utils";
import { trackActivity, checkActivityForNotification, removeActivity, type UserActivityStatus } from "../../../services/private/userActivityApi";
import { toast } from "react-toastify";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import ConfirmationModal from "../../../components/Generic/ConfirmationModal";
import CongratulationsPopup from "../../../components/CongratulationsPopup";

const STATUS_ORDER: UserActivityStatus[] = [1, 2, 3, 4];

const STATUS_CONFIG: Record<UserActivityStatus, { label: string; actionText: string; emoji: string; congratsTitle: string; congratsMessage: string }> = {
  0: {
    label: "Wishlisted", actionText: "Wishlist", emoji: "❤️",
    congratsTitle: "Added to Wishlist!",
    congratsMessage: "You can find this application in your dashboard.",
  },
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
  const [currentStatus, setCurrentStatus] = useState<UserActivityStatus | 0 | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsConfig, setCongratsConfig] = useState({ title: "", message: "" });

  const fullSk = notification.sk?.startsWith("Notification#")
    ? notification.sk
    : `Notification#${notification.sk}#META`;

  useEffect(() => {
    if (!fullSk) return;
    checkActivityForNotification(fullSk)
      .then((res) => {
        if (res.tracked && res.data) {
          setCurrentStatus(res.data.status);
        }
      })
      .catch(() => { })
      .finally(() => setHasChecked(true));
  }, [fullSk]);

  const getNextStatus = (): UserActivityStatus | null => {
    if (currentStatus === null || currentStatus === 0) return 1;
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex >= STATUS_ORDER.length - 1) return null;
    return STATUS_ORDER[currentIndex + 1];
  };

  const nextStatus = getNextStatus();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nextStatus) return;

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

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (!fullSk) throw new Error("Missing notification ID");
      if (currentStatus === 0) {
        await removeActivity(fullSk);
        setCurrentStatus(null);
        toast.success("Removed from wishlist");
      } else {
        await trackActivity(fullSk, notification.title, category, 0);
        setCurrentStatus(0);
        toast.success("Added to wishlist!");
      }
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes("401") || msg.includes("User not authenticated") || msg.includes("Failed to fetch") || msg.includes("AUTH_REDIRECT")) {
        toast.info("🔒 Please login to add to wishlist");
        window.dispatchEvent(new Event("openAuthPopup"));
      } else {
        toast.error("Failed to update wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasChecked && !currentStatus) {
    return (
      <button className="ai-btn-track ai-btn-track-outline placeholder-wave" style={{ opacity: 0.5, width: 115 }}>
        <span className="placeholder w-100"></span>
      </button>
    );
  }

  let btnClass = "ai-btn-track ";
  if (!nextStatus) {
    btnClass += "ai-btn-track-success";
  } else if (currentStatus) {
    btnClass += "ai-btn-track-primary";
  } else {
    btnClass += "ai-btn-track-outline";
  }

  return (
    <div className="d-flex gap-2">
      <button
        onClick={handleClick}
        disabled={loading || !nextStatus}
        className={btnClass}
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

      {!currentStatus && (
        <button
          onClick={handleWishlistClick}
          disabled={loading}
          className={`ai-btn-wishlist ${currentStatus === 0 ? 'active' : ''}`}
          title={currentStatus === 0 ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true" style={{ width: 14, height: 14 }}></span>
          ) : currentStatus === 0 ? (
            <BsHeartFill size={20} />
          ) : (
            <BsHeart size={20} />
          )}
        </button>
      )}

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
    </div>
  );
};

interface ListViewProps {
  category: string;
  items: HomePageNotification[];
  loading?: boolean;
  onItemClick?: (item: Notification) => void;
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

  const getCategoryRoute = (category: string) => {
    return `/notification/category/${encodeURIComponent(category)}`;
  };

  return (
    <div className="ai-list-card">
      <div className="ai-list-header">
        <h5 className="ai-list-header-title">
          {category
            ?.replace(/[-]/g, " ")
            ?.replace(/\b\w/g, (l) => l?.toUpperCase())}
        </h5>
      </div>

      <div className="ai-list-body">
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
          <div>
            {displayedItems.map((item, index) => {
              const itemUrl = `/notification/${makeSlug(item.title, item.sk)}`;

              return (
                <a
                  key={item.sk || index}
                  href={itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ai-list-item"
                >
                  <div className="flex-grow-1">
                    <span className="ai-list-item-title">
                      {item.title}
                    </span>

                    <div className="mt-2" onClick={(e) => e.preventDefault()}>
                      <TrackButton
                        notification={item}
                        category={category}
                      />
                    </div>
                  </div>

                  <div className="ai-list-chevron">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {showSeeMore && !showAllItems && items.length > 5 && !loading && (
        <div className="ai-list-footer">
          {showAll ? (
            <button
              className="ai-btn-seemore"
              onClick={() => setShowAll(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
              </svg>
              See Less
            </button>
          ) : (
            <button
              className="ai-btn-seemore"
              onClick={() => window.open(getCategoryRoute(category), "_blank")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
              </svg>
              See More
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ListView;
