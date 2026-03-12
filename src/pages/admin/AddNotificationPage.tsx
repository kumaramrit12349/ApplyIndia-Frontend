import React from "react";
import { useNavigate, Link } from "react-router-dom";
import NotificationForm from "./NotificationForm";
import type { INotification } from "../../interface/NotificationInterface";
import { emptyNotificationForm } from "../../utils/utils";
import { addNotification } from "../../services/private/notificationApi";

const AddNotificationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (values: Partial<INotification>) => {
    // 🔑 CREATE requires full payload
    await addNotification(values as INotification);
  };

  const handleSuccessRedirect = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <h2 className="brand-name text-white mb-0 d-flex align-items-center gap-2" style={{fontSize: '1.75rem'}}>
          ✨ Add New Notification
        </h2>
        <Link to="/admin/dashboard" className="btn btn-light fw-semibold text-decoration-none shadow-sm" style={{ borderRadius: 12 }}>
          ← Back to Dashboard
        </Link>
      </div>

      <NotificationForm
        mode="create"
        initialValues={emptyNotificationForm}
        onSubmit={handleCreate}
        onSuccess={handleSuccessRedirect}
      />
    </div>
  );
};

export default AddNotificationPage;
