import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import type { HomePageNotification } from "../../../types/notification";
import { makeSlug } from "../../../utils/utils";
import { trackActivity, checkActivityForNotification, removeActivity } from "../../../services/private/userActivityApi";
import { toast } from "react-toastify";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { useAuth } from "../../../context/AuthContext";
import SupportPopup from "../../../components/SupportPopup";

const WishlistButton = ({ notification, category, onWishlisted, onLimitReached }: { notification: HomePageNotification; category: string; onWishlisted?: () => void; onLimitReached?: () => void }) => {
  const { isAuthenticated, onShowAuthPopup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const fullSk = notification.sk?.startsWith("Notification#")
    ? notification.sk
    : `Notification#${notification.sk}#META`;

  useEffect(() => {
    if (!isAuthenticated || !fullSk) {
      setHasChecked(true);
      return;
    }
    checkActivityForNotification(fullSk)
      .then((res) => {
        if (res.tracked && res.data) {
          setIsWishlisted(res.data.status === 0);
        }
      })
      .catch(() => { })
      .finally(() => setHasChecked(true));
  }, [isAuthenticated, fullSk]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("🔒 Please login to add to wishlist");
      onShowAuthPopup();
      return;
    }

    setLoading(true);
    try {
      if (!fullSk) throw new Error("Missing notification ID");
      if (isWishlisted) {
        await removeActivity(fullSk);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await trackActivity(fullSk, notification.title, category, 0);
        setIsWishlisted(true);
        onWishlisted?.();
      }
    } catch (error: any) {
      const msg = error?.message || "Failed to update wishlist.";
      if (msg.includes("ATTEMPT_LIMIT_REACHED")) {
        onLimitReached?.();
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasChecked) {
    return null;
  }

  return (
    <button
      onClick={handleWishlistClick}
      disabled={loading}
      className={`ai-btn-wishlist ${isWishlisted ? 'active' : ''}`}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true" style={{ width: 14, height: 14 }}></span>
      ) : isWishlisted ? (
        <BsHeartFill size={20} />
      ) : (
        <BsHeart size={20} />
      )}
    </button>
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
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const displayedItems = showAllItems
    ? items
    : showAll
      ? items
      : items.slice(0, 5);

  const getCategoryRoute = (category: string) => {
    return `/notification/category/${encodeURIComponent(category)}`;
  };

  return (
    <div className="ai-list-card" style={{ position: "relative" }}>
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
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <WishlistButton
                        notification={item}
                        category={category}
                        onWishlisted={() => setShowWishlistPopup(true)}
                        onLimitReached={() => setShowSupport(true)}
                      />
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

      {/* Wishlist Success Popup - full screen via portal */}
      {showWishlistPopup && ReactDOM.createPortal(
        <div className="ai-wishlist-popup-overlay">
          <div className="ai-wishlist-popup">
            <button
              className="ai-wishlist-popup-close"
              onClick={() => setShowWishlistPopup(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="ai-wishlist-popup-emoji">❤️</div>
            <h4 className="ai-wishlist-popup-title">Added to Wishlist!</h4>
            <p className="ai-wishlist-popup-message">
              You can check your wishlisted notifications anytime from your Dashboard.
            </p>
            <button
              className="ai-wishlist-popup-btn"
              onClick={() => {
                setShowWishlistPopup(false);
                window.open("/dashboard", "_blank");
              }}
            >
              Go to My Dashboard
            </button>
          </div>
        </div>,
        document.body
      )}

      <SupportPopup show={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
};

export default ListView;
