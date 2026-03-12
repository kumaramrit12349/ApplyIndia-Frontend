import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { getId } from "../../utils/utils";
import {
  approveNotification,
  deleteNotification,
  fetchNotifications,
  unarchiveNotification,
} from "../../services/private/notificationApi";

/* ============ Role helpers ============ */
type AdminRole = "creator" | "reviewer" | "admin";

const can = (role: AdminRole | undefined, action: string): boolean => {
  if (!role) return false;
  const perms: Record<string, AdminRole[]> = {
    create: ["creator", "admin"],
    edit: ["creator", "admin"],
    approve: ["reviewer", "admin"],
    archive: ["admin"],
    unarchive: ["admin"],
  };
  return (perms[action] || []).includes(role);
};

const ROLE_COLORS: Record<string, string> = {
  admin: "linear-gradient(135deg, #667eea, #764ba2)",
  reviewer: "linear-gradient(135deg, #f093fb, #f5576c)",
  creator: "linear-gradient(135deg, #4facfe, #00f2fe)",
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  approved: { bg: "#28a745", label: "Approved" },
  pending: { bg: "#ffc107", label: "Pending" },
  changes_requested: { bg: "#fd7e14", label: "Changes Requested" },
  archived: { bg: "#6c757d", label: "Archived" },
};

/* ============ Component ============ */

interface DashboardPageProps {
  adminRole?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ adminRole }) => {
  const role = (adminRole as AdminRole) || undefined;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tab, setTab] = useState<
    "pending" | "approved" | "changes_requested" | "archived"
  >("pending");
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications ?? []);
    } catch (err: any) {
      if (err.message === "NOT_AUTHENTICATED") {
        console.warn("User not authenticated, redirecting to login");
      } else {
        console.error("Failed to load notifications:", err);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /* Modal/Toast state */
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmVariant: string;
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => { },
    confirmText: "Confirm",
    confirmVariant: "primary",
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, message: "", type: "success" });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => setToast({ show: true, message, type });

  /* Handlers */
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
          loadNotifications();
        } catch (err: any) {
          showToast(err.message || "Failed to approve notification", "error");
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    setModal({
      show: true,
      title: "Archive Notification",
      message: "Are you sure you want to archive this notification?",
      confirmText: "Archive",
      confirmVariant: "danger",
      onConfirm: async () => {
        setModal((m) => ({ ...m, show: false }));
        try {
          await deleteNotification(id);
          showToast("Notification archived successfully!", "success");
          loadNotifications();
        } catch (err: any) {
          showToast(err.message || "Failed to archive notification", "error");
        }
      },
    });
  };

  const handleUnarchive = (id: string) => {
    setModal({
      show: true,
      title: "Restore Notification",
      message: "Are you sure you want to restore this notification?",
      confirmText: "Restore",
      confirmVariant: "warning",
      onConfirm: async () => {
        setModal((m) => ({ ...m, show: false }));
        try {
          await unarchiveNotification(id);
          showToast("Notification restored successfully!", "success");
          loadNotifications();
        } catch (err: any) {
          showToast(err.message || "Failed to restore notification", "error");
        }
      },
    });
  };

  /* Filter tabs */
  const pending = notifications.filter(
    (n) =>
      !n.approved_at &&
      !n.is_archived &&
      n.review_status !== "changes_requested"
  );
  const changesRequested = notifications.filter(
    (n) => n.review_status === "changes_requested" && !n.is_archived
  );
  const approved = notifications.filter(
    (n) => n.approved_at && !n.is_archived
  );
  const archived = notifications.filter((n) => n.is_archived);

  const tabConfig = [
    { key: "pending" as const, label: "Pending", list: pending, icon: "⏳" },
    {
      key: "changes_requested" as const,
      label: "Changes Requested",
      list: changesRequested,
      icon: "💬",
    },
    {
      key: "approved" as const,
      label: "Approved",
      list: approved,
      icon: "✅",
    },
    {
      key: "archived" as const,
      label: "Archived",
      list: archived,
      icon: "📦",
    },
  ];

  const displayList =
    tabConfig.find((t) => t.key === tab)?.list || [];

  const getStatusInfo = (n: any) => {
    if (n.is_archived) return STATUS_BADGE.archived;
    if (n.approved_at) return STATUS_BADGE.approved;
    if (n.review_status === "changes_requested")
      return STATUS_BADGE.changes_requested;
    return STATUS_BADGE.pending;
  };

  return (
    <div className="container-fluid px-2 px-md-5 py-3 py-md-4">
      {/* Header */}
      <div
        className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4 p-3 p-md-4 rounded-4"
        style={{
          background: ROLE_COLORS[role || "admin"] || ROLE_COLORS.admin,
          color: "#fff",
        }}
      >
        <div>
          <h2 className="mb-1 fw-bold" style={{ fontSize: "clamp(1.2rem, 4vw, 1.8rem)" }}>
            🛡️ Admin Dashboard
          </h2>
          {role && (
            <span
              className="badge bg-white bg-opacity-25"
              style={{ fontSize: "clamp(0.7rem, 2vw, 0.85rem)" }}
            >
              Role:{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          )}
        </div>
        {can(role, "create") && (
          <Link
            to="/admin/addNotification"
            className="btn btn-light fw-semibold shadow-sm w-100 mt-3 mt-sm-0"
            style={{ borderRadius: 12, maxWidth: '200px' }}
          >
            + Add Notification
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4 justify-content-start">
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn rounded-pill d-flex align-items-center gap-1 flex-grow-0 py-1 py-md-2 px-2 px-md-3 ${
              tab === t.key
                ? "btn-dark border-dark fw-semibold"
                : "btn-outline-secondary"
            }`}
            style={{ 
              transition: "all 0.2s ease",
              fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)"
            }}
          >
            {t.icon} {t.label}{" "}
            <span
              className="badge bg-white bg-opacity-25 text-dark ms-1"
              style={{ fontSize: "0.7rem" }}
            >
              {t.list.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📭</div>
          <p className="mt-2">No notifications in this tab</p>
        </div>
      ) : (
        <div className="row g-3">
          {displayList.map((n: any) => {
            const status = getStatusInfo(n);
            return (
              <div key={n.sk} className="col-12">
                <div
                  className="card border-0 shadow-sm rounded-3 overflow-hidden"
                  style={{ transition: "box-shadow 0.2s" }}
                >
                  <div className="card-body p-3 d-flex flex-column flex-md-row align-items-md-center gap-3">
                    {/* Left: Status indicator */}
                    <div
                      style={{
                        width: 6,
                        minHeight: 50,
                        borderRadius: 3,
                        background: status.bg,
                        flexShrink: 0,
                      }}
                    />

                    {/* Center: Info */}
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold" style={{ fontSize: "0.95rem" }}>
                        {n.title}
                      </h6>
                      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                        <span
                          className="badge"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea33, #764ba233)",
                            color: "#764ba2",
                            fontSize: "0.7rem",
                          }}
                        >
                          {n.category}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: status.bg,
                            color: "#fff",
                            fontSize: "0.7rem",
                          }}
                        >
                          {status.label}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {new Date(n.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="d-flex flex-row flex-md-column flex-lg-row flex-wrap gap-2 flex-shrink-0 mt-3 mt-md-0 w-100 w-md-auto align-items-start">
                      <Link
                        to={`/admin/review/${getId(n.sk)}`}
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ 
                          borderRadius: '8px', 
                          fontSize: "0.8rem", 
                          fontWeight: 500,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          border: 'none',
                          padding: '0.4rem 0.8rem'
                        }}
                      >
                        👁️ View
                      </Link>

                      {can(role, "edit") && !n.is_archived && (
                        <Link
                          to={`/admin/edit/${getId(n.sk)}`}
                          className="btn btn-sm d-flex align-items-center gap-1"
                          style={{ 
                            borderRadius: '8px', 
                            fontSize: "0.8rem", 
                            fontWeight: 500,
                            backgroundColor: 'rgba(108, 117, 125, 0.1)',
                            color: '#6c757d',
                            border: 'none',
                            padding: '0.4rem 0.8rem'
                          }}
                        >
                          ✏️ Edit
                        </Link>
                      )}

                      {can(role, "approve") &&
                        !n.approved_at &&
                        !n.is_archived && (
                          <button
                            className="btn btn-sm d-flex align-items-center gap-1"
                            style={{ 
                              borderRadius: '8px', 
                              fontSize: "0.8rem", 
                              fontWeight: 600,
                              background: 'linear-gradient(135deg, #28a745, #20c997)',
                              color: '#fff',
                              border: 'none',
                              padding: '0.4rem 0.8rem',
                              boxShadow: '0 2px 6px rgba(40,167,69,0.2)'
                            }}
                            onClick={() => handleApprove(getId(n.sk))}
                          >
                            ✓ Approve
                          </button>
                        )}

                      {can(role, "archive") && !n.is_archived && (
                        <button
                          className="btn btn-sm d-flex align-items-center gap-1"
                          style={{ 
                            borderRadius: '8px', 
                            fontSize: "0.8rem", 
                            fontWeight: 500,
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            color: '#dc3545',
                            border: 'none',
                            padding: '0.4rem 0.8rem'
                          }}
                          onClick={() => handleDelete(getId(n.sk))}
                        >
                          🗄️ Archive
                        </button>
                      )}

                      {can(role, "unarchive") && n.is_archived && (
                        <button
                          className="btn btn-sm d-flex align-items-center gap-1"
                          style={{ 
                            borderRadius: '8px', 
                            fontSize: "0.8rem", 
                            fontWeight: 500,
                            backgroundColor: 'rgba(255, 193, 7, 0.15)',
                            color: '#d39e00',
                            border: 'none',
                            padding: '0.4rem 0.8rem'
                          }}
                          onClick={() => handleUnarchive(getId(n.sk))}
                        >
                          ♻️ Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default DashboardPage;
