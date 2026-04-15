import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotificationDetailView from "../../../components/Generic/NotificationDetailView";
import { getNotificationById } from "../../../services/public/notiifcationApi";
import SEO from "../../../components/SEO/SEO";

interface UserNotificationDetailPageProps {
  isAuthenticated?: boolean;
  onShowAuthPopup?: () => void;
}

const UserNotificationDetailPage: React.FC<UserNotificationDetailPageProps> = ({
  isAuthenticated = false,
  onShowAuthPopup,
}) => {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getNotificationById(id)
      .then((data: any) => {
        setNotification(data.notification);
        setLoading(false);
      })
      .catch(() => {
        setNotification(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!notification) {
    return (
      <div className="container mt-5">
        <SEO title="Notification Not Found" />
        <div className="alert alert-danger">Notification not found</div>
      </div>
    );
  }
  return (
    <div className="container mt-4 mb-5">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm mb-3"
        style={{
          background: "transparent",
          border: "1px solid #dee2e6",
          borderRadius: "20px",
          color: "#6b7280",
          padding: "4px 14px",
          fontWeight: 500,
          fontSize: "0.88rem",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#374151";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#6b7280";
        }}
      >
        ← Back
      </button>
      <SEO 
        title={notification.title} 
        description={notification.description?.substring(0, 150) + "..."}
      />
      <NotificationDetailView
        notification={notification}
        isAuthenticated={isAuthenticated}
        onShowAuthPopup={onShowAuthPopup}
      />
    </div>
  );
};

export default UserNotificationDetailPage;

