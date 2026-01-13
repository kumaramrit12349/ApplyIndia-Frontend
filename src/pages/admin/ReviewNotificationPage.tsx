import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotificationDetailView from "../../components/Generic/NotificationDetailView";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { getId } from "../../utils/utils";
import { approveNotification, getNotificationById } from "../../services/private/notificationApi";

const ReviewNotificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal/Toast state - if you want to keep the UI unified with Dashboard
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    confirmVariant: "primary",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning"
  });

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" | "warning"
  ) => setToast({ show: true, message: msg, type });

  const loadNotification = async () => {
    setLoading(true);
    try {
      const data: any = await getNotificationById(id!);
      setNotification(data.notification);
    } catch (err) {
      showToast("Failed to load notification", "error");
      setNotification(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotification();
  }, [id]);

  // Modal-action handlers
  const handleApprove = (id: string) => {
    setModal({
      show: true,
      title: "Approve Notification",
      message: "Are you sure you want to approve this notification?",
      confirmText: "Approve",
      confirmVariant: "success",
      onConfirm: async () => {
        setModal((m) => ({ ...m, show: false }));
        try {
          await approveNotification(id);
          showToast("Notification approved successfully!", "success");
          navigate("/admin/dashboard");
        } catch (err: any) {
          showToast(err.message || "Failed to approve notification", "error");
        }
      }
    });
  };

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
      <NotificationDetailView
        notification={notification}
        isAdmin={true}
        // Pass all admin actions (the component will decide which to show)
        onApprove={() => handleApprove(getId(notification.sk))}
      />
      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      {/* Modal */}
      <ConfirmModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ ...modal, show: false })}
        confirmText={modal.confirmText}
        confirmVariant={modal.confirmVariant}
      />
    </div>
  );
};

export default ReviewNotificationPage;
