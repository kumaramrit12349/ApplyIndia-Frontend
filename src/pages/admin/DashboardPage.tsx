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

const DashboardPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "archived">(
    "pending"
  );
  const archived = notifications.filter((n) => n.is_archived);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications ?? []);
    } catch (err: any) {
      if (err.message === "NOT_AUTHENTICATED") {
        console.warn("User not authenticated, redirecting to login");
        // optional: navigate("/auth/signin");
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

  // Modal state
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
    onConfirm: () => {},
    confirmText: "Confirm",
    confirmVariant: "primary",
  });

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ show: true, message, type });
  };

  // Updated handlers
  const handleApprove = (id: string) => {
    setModal({
      show: true,
      title: "Approve Notification",
      message: "Are you sure you want to approve this notification?",
      confirmText: "Approve",
      confirmVariant: "success",
      onConfirm: async () => {
        setModal({ ...modal, show: false });
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
        setModal({ ...modal, show: false });
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
        setModal({ ...modal, show: false });
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

  const pending = notifications.filter((n) => !n.approved_at && !n.is_archived);
  const approved = notifications.filter((n) => n.approved_at && !n.is_archived);
  let displayList: any[] = [];
  if (tab === "pending") displayList = pending;
  else if (tab === "approved") displayList = approved;
  else if (tab === "archived") displayList = archived;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <Link to="/admin/addNotification" className="btn btn-success">
          + Add Notification
        </Link>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "pending" ? "active" : ""}`}
            onClick={() => setTab("pending")}
          >
            Pending ({pending.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "approved" ? "active" : ""}`}
            onClick={() => setTab("approved")}
          >
            Approved ({approved.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "archived" ? "active" : ""}`}
            onClick={() => setTab("archived")}
          >
            Archived ({archived.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    No notifications found
                  </td>
                </tr>
              ) : (
                displayList.map((n) => (
                  <tr key={n.sk}>
                    <td>{n.sk}</td>
                    <td>{n.title}</td>
                    <td>
                      <span className="badge bg-info">{n.category}</span>
                    </td>
                    <td>{new Date(n.created_at).toLocaleString()}</td>
                    <td>
                      {n.approved_at ? (
                        <span className="badge bg-success">Approved</span>
                      ) : (
                        <span className="badge bg-warning">Pending</span>
                      )}
                    </td>
                    <td>
                      {/* View button - always visible */}
                      <Link
                        to={`/admin/review/${getId(n.sk)}`}
                        className="btn btn-sm btn-info me-2"
                      >
                        View
                      </Link>
                      {/* Edit button - hidden for archived */}
                      {!n.is_archived && (
                        <Link
                          to={`/admin/edit/${getId(n.sk)}`}
                          className="btn btn-sm btn-secondary me-2"
                        >
                          Edit
                        </Link>
                      )}
                      {/* Approve button - only for pending, hidden for archived */}
                      {!n.approved_at && !n.is_archived && (
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleApprove(getId(n.sk))}
                        >
                          Approve
                        </button>
                      )}

                      {/* Archive/Restore buttons */}
                      {!n.is_archived ? (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(getId(n.sk))}
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleUnarchive(getId(n.sk))}
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
      {/* Confirmation Modal */}
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
