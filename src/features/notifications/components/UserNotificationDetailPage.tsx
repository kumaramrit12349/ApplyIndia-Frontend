import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    <div className="container mt-5 mb-5">
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

