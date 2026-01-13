import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotificationDetailView from "../../../components/Generic/NotificationDetailView";
import { getNotificationById } from "../../../services/public/notiifcationApi";

const UserNotificationDetailPage: React.FC = () => {
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
        <div className="alert alert-danger">Notification not found</div>
      </div>
    );
  }
  return (
    <div className="container mt-5 mb-5">
      <NotificationDetailView notification={notification} />
    </div>
  );
};

export default UserNotificationDetailPage;
