import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import NotificationForm from "./NotificationForm";
import type { INotification } from "../../interface/NotificationInterface";
import { getNotificationById, updateNotification } from "../../services/private/notificationApi";

interface EditNotificationPageProps {
  adminRole?: string;
}

const EditNotificationPage: React.FC<EditNotificationPageProps> = ({ adminRole }) => {
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
        const fetched: INotification = res.notification;
        const canEditApproved =
          adminRole === "admin" ||
          adminRole === "senior_reviewer" ||
          !fetched.approved_at;

        if (!canEditApproved) {
          toast.error("This notification has already been approved. You don't have permission to edit approved notifications.");
          navigate("/admin/dashboard");
          return;
        }

        setInitialValues(fetched);
        setLoading(false);
      })
      .catch(() => navigate("/admin/dashboard"));
  }, [id, navigate, adminRole]);

  const handleUpdate = async (values: Partial<INotification>) => {
    if (!id) return;
    await updateNotification(id, values); // ✅ partial update
  };
  
  const handleSuccessRedirect = () => {
    navigate("/admin/dashboard");
  };

  if (loading || !initialValues) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div className="container py-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-5 p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' }}>
        <h2 className="brand-name text-white mb-0 d-flex align-items-center gap-2" style={{fontSize: '1.75rem'}}>
          ✏️ Edit Notification
        </h2>
        <Link to="/admin/dashboard" className="btn btn-light fw-semibold text-decoration-none shadow-sm" style={{ borderRadius: 12 }}>
          ← Back to Dashboard
        </Link>
      </div>

      <NotificationForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleUpdate}
        onSuccess={handleSuccessRedirect}
      />
    </div>
  );
};

export default EditNotificationPage;
