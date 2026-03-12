import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import NotificationForm from "./NotificationForm";
import type { INotification } from "../../interface/NotificationInterface";
import { emptyNotificationForm } from "../../utils/utils";
import { addNotification, getNotificationById } from "../../services/private/notificationApi";

const AddNotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get("clone");

  const [initialValues, setInitialValues] = useState<INotification>(emptyNotificationForm);
  const [loading, setLoading] = useState(!!cloneId);

  useEffect(() => {
    if (!cloneId) return;
    setLoading(true);
    getNotificationById(cloneId)
      .then((res: any) => {
        if (res.notification) {
          const source = res.notification as INotification;
          // Strip server-generated fields; prepend "Copy of" to title
          setInitialValues({
            ...source,
            sk: "",
            title: `Copy of ${source.title}`,
            approved_by: undefined,
            approved_at: undefined,
            review_status: undefined,
            created_at: undefined,
            modified_at: undefined,
          });
        }
      })
      .catch(() => {
        // Failed to clone — fall back to empty form
      })
      .finally(() => setLoading(false));
  }, [cloneId]);

  const handleCreate = async (values: Partial<INotification>) => {
    await addNotification(values as INotification);
  };

  const handleSuccessRedirect = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-5 p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <h2 className="brand-name text-white mb-0 d-flex align-items-center gap-2" style={{fontSize: '1.75rem'}}>
          {cloneId ? "📋 Clone Notification" : "✨ Add New Notification"}
        </h2>
        <Link to="/admin/dashboard" className="btn btn-light fw-semibold text-decoration-none shadow-sm" style={{ borderRadius: 12 }}>
          ← Back to Dashboard
        </Link>
      </div>

      <NotificationForm
        mode="create"
        initialValues={initialValues}
        onSubmit={handleCreate}
        onSuccess={handleSuccessRedirect}
      />
    </div>
  );
};

export default AddNotificationPage;
