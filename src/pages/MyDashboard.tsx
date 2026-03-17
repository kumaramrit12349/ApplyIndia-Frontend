import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getUserActivities,
    removeActivity,
    type IUserActivityItem,
    type UserActivityStatus,
} from "../services/private/userActivityApi";
import { formatCategoryTitle } from "../utils/utils";
import { toast } from "react-toastify";
import ConfirmationModal from "../components/Generic/ConfirmationModal";
import SupportPopup from "../components/SupportPopup";
import "./MyDashboard.css";

const STATUS_CONFIG: Record<
    UserActivityStatus,
    { label: string; emoji: string; color: string; bg: string }
> = {
    0: {
        label: "Wishlisted",
        emoji: "❤️",
        color: "#dc3545",
        bg: "linear-gradient(135deg, #ff758c, #ff7eb3)",
    },
    1: {
        label: "Applied",
        emoji: "📝",
        color: "#0d6efd",
        bg: "linear-gradient(135deg, #667eea, #764ba2)",
    },
    2: {
        label: "Admit Card",
        emoji: "🎫",
        color: "#198754",
        bg: "linear-gradient(135deg, #11998e, #38ef7d)",
    },
    3: {
        label: "Result",
        emoji: "📊",
        color: "#fd7e14",
        bg: "linear-gradient(135deg, #f093fb, #f5576c)",
    },
    4: {
        label: "Selected",
        emoji: "🏆",
        color: "#ffc107",
        bg: "linear-gradient(135deg, #f5af19, #f12711)",
    },
};

const STATUS_ORDER: UserActivityStatus[] = [0, 1, 2, 3, 4];

function getNotificationId(sk: string): string {
    // SK pattern: "Notification#<ID>#META"
    const parts = sk.split("#");
    return parts.length >= 2 ? parts[1] : sk;
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const MyDashboard: React.FC = () => {
    const [activities, setActivities] = useState<IUserActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<UserActivityStatus | "ALL">("ALL");
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [skToRemove, setSkToRemove] = useState<string | null>(null);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const res = await getUserActivities();
            setActivities(res.data || []);
        } catch {
            toast.error("Failed to load your activities");
        } finally {
            setLoading(false);
        }
    };

    const initiateRemove = (sk: string) => {
        setSkToRemove(sk);
        setShowConfirm(true);
    };

    const confirmRemove = async () => {
        if (!skToRemove) return;
        setRemovingId(skToRemove);
        setShowConfirm(false);
        try {
            await removeActivity(skToRemove);
            setActivities((prev) => prev.filter((a) => a.sk !== skToRemove));
            toast.success("Entry removed");
        } catch (error: any) {
            const msg = error?.message || "Failed to remove entry";
            if (msg.includes("ATTEMPT_LIMIT_REACHED")) {
                setShowSupport(true);
            } else {
                toast.error(msg);
            }
        } finally {
            setRemovingId(null);
            setSkToRemove(null);
        }
    };

    const filteredActivities =
        filterStatus === "ALL"
            ? activities
            : activities.filter((a) => a.status === filterStatus);

    const counts = STATUS_ORDER.reduce(
        (acc, s) => {
            acc[s] = activities.filter((a) => a.status === s).length;
            return acc;
        },
        {} as Record<UserActivityStatus, number>
    );

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4 mb-5">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="fw-bold dashboard-title">📋 My Dashboard</h2>
                <p className="text-muted">Track all your applications in one place</p>
            </div>

            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                {STATUS_ORDER.map((status) => (
                    <div key={status} className="col-6 col-md-3">
                        <div
                            className="dashboard-stat-card"
                            style={{ background: STATUS_CONFIG[status].bg }}
                            onClick={() =>
                                setFilterStatus(filterStatus === status ? "ALL" : status)
                            }
                        >
                            <div className="dashboard-stat-emoji">
                                {STATUS_CONFIG[status].emoji}
                            </div>
                            <div className="dashboard-stat-count">{counts[status]}</div>
                            <div className="dashboard-stat-label">
                                {STATUS_CONFIG[status].label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                <button
                    className={`btn btn-sm ${filterStatus === "ALL"
                        ? "btn-dark"
                        : "btn-outline-secondary"
                        }`}
                    onClick={() => setFilterStatus("ALL")}
                >
                    All ({activities.length})
                </button>
                {STATUS_ORDER.map((s) => (
                    <button
                        key={s}
                        className={`btn btn-sm ${filterStatus === s ? "btn-dark" : "btn-outline-secondary"
                            }`}
                        onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}
                    >
                        {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label} ({counts[s]})
                    </button>
                ))}
            </div>

            {/* Activity List */}
            {filteredActivities.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{ fontSize: 48 }}>📭</div>
                    <h5 className="text-muted mt-3">No tracked notifications yet</h5>
                    <p className="text-muted">
                        Start by applying to a notification and tracking your progress!
                    </p>
                    <Link to="/" className="btn btn-primary mt-2">
                        Browse Notifications
                    </Link>
                </div>
            ) : (
                <div className="row g-3">
                    {filteredActivities.map((activity) => {
                        const statusConf = STATUS_CONFIG[activity.status];
                        const notifId = getNotificationId(activity.sk);
                        const slug = slugify(activity.notification_title);
                        const stepIndex = STATUS_ORDER.indexOf(activity.status);

                        return (
                            <div key={activity.sk} className="col-12 col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-activity-card">
                                    <div className="card-body p-3">
                                        {/* Status badge */}
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span
                                                className="badge rounded-pill px-3 py-2"
                                                style={{
                                                    background: statusConf.bg,
                                                    color: "#fff",
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                {statusConf.emoji} {statusConf.label}
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-danger rounded-circle"
                                                style={{ width: 28, height: 28, padding: 0, fontSize: 12 }}
                                                onClick={() => initiateRemove(activity.sk)}
                                                disabled={removingId === activity.sk}
                                                title="Remove tracking"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <Link
                                            to={`/notification/${slug}/${notifId}`}
                                            className="text-decoration-none"
                                        >
                                            <h6
                                                className="fw-bold mb-2 text-dark"
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {activity.notification_title}
                                            </h6>
                                        </Link>

                                        {/* Category */}
                                        <span className="badge bg-light text-dark border mb-2">
                                            {formatCategoryTitle(activity.notification_category)}
                                        </span>

                                        {/* Mini progress */}
                                        <div className="d-flex gap-1 mt-2">
                                            {STATUS_ORDER.map((s, i) => (
                                                <div
                                                    key={s}
                                                    style={{
                                                        flex: 1,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        background:
                                                            i <= stepIndex
                                                                ? STATUS_CONFIG[s].color
                                                                : "#e9ecef",
                                                        transition: "background 0.3s ease",
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Date */}
                                        <small className="text-muted d-block mt-2">
                                            Updated: {new Date(activity.modified_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmationModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={confirmRemove}
                title="Remove Tracking Entry"
                variant="danger"
                confirmText="Yes, Remove"
                message={
                    <>
                        <p>Are you sure you want to remove this tracked application from your dashboard?</p>
                        <div className="alert alert-warning mt-3 py-2 px-3 mb-0" style={{ fontSize: "0.85rem" }}>
                            <strong>Note:</strong> You can only remove and re-mark a notification a maximum of <strong>3 times</strong>. Reaching this limit will disable tracking for this notification.
                        </div>
                    </>
                }
            />

            <SupportPopup show={showSupport} onClose={() => setShowSupport(false)} />
        </div>
    );
};

export default MyDashboard;
