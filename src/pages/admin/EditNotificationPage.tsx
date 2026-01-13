import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NotificationForm from "./NotificationForm";
import type { INotification } from "../../interface/NotificationInterface";
import { getNotificationById, updateNotification } from "../../services/private/notificationApi";

const EditNotificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<INotification | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getNotificationById(id)
      .then((res: any) => {
        setInitialValues(res.notification);
        setLoading(false);
      })
      .catch(() => navigate("/admin/dashboard"));
  }, [id, navigate]);

  const handleUpdate = async (values: Partial<INotification>) => {
    if (!id) return;
    await updateNotification(id, values); // ✅ partial update
    navigate("/admin/dashboard");
  };

  if (loading || !initialValues) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container bg-white rounded mt-5 p-4 shadow mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Notification</h2>
        <Link to="/admin/dashboard" className="btn btn-outline-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <NotificationForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditNotificationPage;
