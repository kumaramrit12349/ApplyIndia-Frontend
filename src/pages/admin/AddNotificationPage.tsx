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
    navigate("/admin/dashboard");
  };

  return (
    <div className="container bg-white rounded mt-5 p-4 shadow">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add New Notification</h2>
        <Link to="/admin/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <NotificationForm
        mode="create"
        initialValues={emptyNotificationForm}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default AddNotificationPage;
