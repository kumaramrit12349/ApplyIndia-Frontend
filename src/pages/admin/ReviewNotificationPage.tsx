import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotificationDetailView from "../../components/Generic/NotificationDetailView";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { getId } from "../../utils/utils";
import {
  approveNotification,
  getNotificationById,
  addReviewComment,
} from "../../services/private/notificationApi";
import type { IReviewComment } from "../../interface/NotificationInterface";

type AdminRole = "creator" | "reviewer" | "admin";

interface ReviewNotificationPageProps {
  adminRole?: string;
}

const ReviewNotificationPage: React.FC<ReviewNotificationPageProps> = ({
  adminRole,
}) => {
  const role = (adminRole as AdminRole) || undefined;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<any>(null);
  const [comments, setComments] = useState<IReviewComment[]>([]);
  const [loading, setLoading] = useState(true);

  /* Comment form state */
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const canComment = role === "reviewer" || role === "admin";
  const canApprove = role === "reviewer" || role === "admin";

  /* Modal/Toast */
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => { },
    confirmText: "Confirm",
    confirmVariant: "primary",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "info" | "warning",
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
      setComments(data.comments || []);
    } catch (err) {
      showToast("Failed to load notification", "error");
      setNotification(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotification();
  }, [id]);

  const handleApprove = (notifId: string) => {
    setModal({
      show: true,
      title: "Approve Notification",
      message: "Are you sure you want to approve this notification?",
      confirmText: "Approve",
      confirmVariant: "success",
      onConfirm: async () => {
        setModal((m) => ({ ...m, show: false }));
        try {
          await approveNotification(notifId);
          showToast("Notification approved successfully!", "success");
          navigate("/admin/dashboard");
        } catch (err: any) {
          showToast(err.message || "Failed to approve notification", "error");
        }
      },
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await addReviewComment(id!, commentText.trim());
      showToast("Comment added & changes requested!", "success");
      setCommentText("");
      loadNotification();
    } catch (err: any) {
      showToast(err.message || "Failed to add comment", "error");
    } finally {
      setSubmittingComment(false);
    }
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
    <div className="container mt-4 mb-5">
      <NotificationDetailView
        notification={notification}
        isAdmin={true}
        adminRole={role}
        onApprove={
          canApprove
            ? () => handleApprove(getId(notification.sk))
            : undefined
        }
      />

      {/* ============ REVIEW COMMENTS SECTION ============ */}
      {!notification.approved_at && (
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-lg-10 col-xl-9">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-light border-0 fw-semibold d-flex align-items-center gap-2">
                💬 Review Comments
                {comments.length > 0 && (
                  <span className="badge bg-secondary">{comments.length}</span>
                )}
              </div>
              <div className="card-body">
                {/* Comment input — Reviewer & Admin only */}
                {canComment && (
                  <div className="mb-4">
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      placeholder="Add a review comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submittingComment}
                      style={{ borderRadius: 12 }}
                    />
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-warning btn-sm"
                        disabled={!commentText.trim() || submittingComment}
                        onClick={() => handleAddComment()}
                        style={{ borderRadius: 8 }}
                      >
                        {submittingComment ? (
                          <span className="spinner-border spinner-border-sm me-1" />
                        ) : (
                          "💬"
                        )}{" "}
                        Add Comment & Request Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments list */}
                {comments.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <div style={{ fontSize: 32 }}>💭</div>
                    <p className="mb-0 mt-1">No comments yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {comments.map((c) => (
                      <div
                        key={c.comment_id}
                        className="p-3 rounded-3"
                        style={{
                          background: "#f8f9fa",
                          borderLeft: "4px solid #667eea",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #667eea, #764ba2)",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {c.reviewer_name?.[0]?.toUpperCase() || "R"}
                            </div>
                            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                              {c.reviewer_name || "Reviewer"}
                            </span>
                          </div>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {new Date(c.created_at).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p
                          className="mb-0 text-dark"
                          style={{ fontSize: "0.9rem", lineHeight: 1.5 }}
                        >
                          {c.comment_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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

export default ReviewNotificationPage;
