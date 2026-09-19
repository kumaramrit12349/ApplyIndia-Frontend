import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getUserStats } from "../../services/private/usersApi";
import type { IUserPlatformStats } from "../../services/private/usersApi";
import { INDIAN_STATES } from "../../constant/SharedConstant";
import {
    FiUsers,
    FiMail,
    FiShield,
    FiRefreshCw,
    FiLayers,
    FiTrendingUp,
    FiMapPin,
} from "react-icons/fi";
import { BsGoogle } from "react-icons/bs";
import { APP_TIME_ZONE } from "../../utils/dateTime";
import BackToDashboard from "../../components/BackToDashboard/BackToDashboard";

const AdminUsersPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<string>("all");
    const [statsLoading, setStatsLoading] = useState(false);
    const [userStats, setUserStats] = useState<IUserPlatformStats | null>(null);

    const loadUserStats = useCallback(async (range: string) => {
        try {
            setStatsLoading(true);
            const res = await getUserStats(range);
            if (res.success) {
                setUserStats(res.data);
            }
        } catch (err: any) {
            console.error("Failed to load user stats:", err);
            toast.error("Failed to load platform user stats.");
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserStats(timeRange);
    }, [timeRange, loadUserStats]);

    const getStateLabel = (code: string) => {
        const state = INDIAN_STATES.find((s) => s.value === code);
        return state ? state.label : code;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleDateString("en-IN", {
          timeZone: APP_TIME_ZONE,
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-vh-100 py-4" style={{ background: "var(--color-bg)", color: "var(--color-body)" }}>
            <div className="container">
                <div
                    className="card shadow-sm overflow-hidden"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "12px" }}
                >
                    {/* Header */}
                    <div className="p-4 border-bottom" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle shadow-xs"
                                    style={{ width: "44px", height: "44px", background: "rgba(29, 78, 216, 0.15)", color: "var(--color-primary-text)" }}
                                >
                                    <FiShield size={24} />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0" style={{ color: "var(--color-heading)" }}>Users</h4>
                                    <p className="small mb-0" style={{ color: "var(--color-muted)" }}>Platform demographics & sign-in methods</p>
                                </div>
                            </div>

                            {/* Back + Filter & Refresh */}
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <BackToDashboard />
                                <label htmlFor="adminPageTimeRange" className="small fw-semibold mb-0" style={{ color: "var(--color-muted)" }}>
                                    Filter:
                                </label>
                                <select
                                    id="adminPageTimeRange"
                                    className="form-select form-select-sm shadow-none"
                                    style={{
                                        width: "auto",
                                        minWidth: "140px",
                                        borderRadius: "6px",
                                        background: "var(--color-bg)",
                                        color: "var(--color-heading)",
                                        borderColor: "var(--color-border)",
                                    }}
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="last_week">Last 7 Days</option>
                                    <option value="last_month">Last 30 Days</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="last_6_months">Last 6 Months</option>
                                </select>
                                <button
                                    className="btn btn-sm d-flex align-items-center gap-1 shadow-none"
                                    style={{
                                        background: "var(--color-bg)",
                                        color: "var(--color-heading)",
                                        borderColor: "var(--color-border)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                    title="Refresh"
                                    onClick={() => loadUserStats(timeRange)}
                                    disabled={statsLoading}
                                >
                                    <FiRefreshCw className={statsLoading ? "spin" : ""} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="card-body p-4">
                        <div>
                            {statsLoading ? (
                                <div className="py-5 text-center">
                                    <div className="spinner-border" style={{ color: "var(--color-primary-text)" }} role="status">
                                        <span className="visually-hidden">Loading user stats...</span>
                                    </div>
                                    <p className="small mt-2" style={{ color: "var(--color-muted)" }}>Aggregating platform user insights…</p>
                                </div>
                            ) : userStats ? (
                                <div>
                                    {/* Stat Cards */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <div
                                                className="p-3 rounded h-100 d-flex flex-column justify-content-between"
                                                style={{
                                                    background: "rgba(29, 78, 216, 0.08)",
                                                    border: "1px solid rgba(29, 78, 216, 0.25)",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="small fw-semibold" style={{ color: "var(--color-muted)" }}>Total Users</span>
                                                    <span
                                                        className="p-2 rounded-circle shadow-xs"
                                                        style={{ background: "var(--color-surface)", color: "var(--color-primary-text)" }}
                                                    >
                                                        <FiUsers size={18} />
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="fw-bold mb-0" style={{ color: "var(--color-primary-text)" }}>{userStats.totalUsers}</h2>
                                                    <span className="small" style={{ color: "var(--color-muted)" }}>Registered on platform</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div
                                                className="p-3 rounded h-100 d-flex flex-column justify-content-between"
                                                style={{
                                                    background: "var(--color-bg)",
                                                    border: "1px solid var(--color-border)",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="small fw-semibold" style={{ color: "var(--color-muted)" }}>Google Sign-In</span>
                                                    <span
                                                        className="p-2 rounded-circle shadow-xs text-danger"
                                                        style={{ background: "var(--color-surface)" }}
                                                    >
                                                        <BsGoogle size={18} />
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="fw-bold mb-0" style={{ color: "var(--color-heading)" }}>{userStats.googleUsers}</h2>
                                                    <span className="small" style={{ color: "var(--color-muted)" }}>
                                                        {userStats.totalUsers > 0
                                                            ? `${Math.round((userStats.googleUsers / userStats.totalUsers) * 100)}% of total`
                                                            : "0% of total"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div
                                                className="p-3 rounded h-100 d-flex flex-column justify-content-between"
                                                style={{
                                                    background: "var(--color-bg)",
                                                    border: "1px solid var(--color-border)",
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <span className="small fw-semibold" style={{ color: "var(--color-muted)" }}>Manual Sign-Up</span>
                                                    <span
                                                        className="p-2 rounded-circle shadow-xs text-success"
                                                        style={{ background: "var(--color-surface)" }}
                                                    >
                                                        <FiMail size={18} />
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="fw-bold mb-0" style={{ color: "var(--color-heading)" }}>{userStats.manualUsers}</h2>
                                                    <span className="small" style={{ color: "var(--color-muted)" }}>
                                                        {userStats.totalUsers > 0
                                                            ? `${Math.round((userStats.manualUsers / userStats.totalUsers) * 100)}% of total`
                                                            : "0% of total"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Demographics: Category & State breakdown */}
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-6">
                                            <div
                                                className="p-3 rounded h-100"
                                                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "10px" }}
                                            >
                                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--color-heading)" }}>
                                                    <FiLayers style={{ color: "var(--color-primary-text)" }} /> Category Distribution
                                                </h6>
                                                {Object.keys(userStats.byCategory).length === 0 ? (
                                                    <p className="small mb-0" style={{ color: "var(--color-muted)" }}>No category data recorded.</p>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        {Object.entries(userStats.byCategory).map(([category, count]) => {
                                                            const pct = userStats.totalUsers > 0 ? Math.round((count / userStats.totalUsers) * 100) : 0;
                                                            return (
                                                                <div key={category}>
                                                                    <div className="d-flex justify-content-between small fw-semibold mb-1" style={{ color: "var(--color-heading)" }}>
                                                                        <span>{category}</span>
                                                                        <span style={{ color: "var(--color-muted)" }}>{count} ({pct}%)</span>
                                                                    </div>
                                                                    <div className="progress" style={{ height: "6px", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                                                                        <div
                                                                            className="progress-bar"
                                                                            role="progressbar"
                                                                            style={{ width: `${pct}%`, background: "var(--color-primary)" }}
                                                                            aria-valuenow={pct}
                                                                            aria-valuemin={0}
                                                                            aria-valuemax={100}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div
                                                className="p-3 rounded h-100"
                                                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "10px" }}
                                            >
                                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--color-heading)" }}>
                                                    <FiMapPin style={{ color: "var(--color-primary-text)" }} /> State Distribution
                                                </h6>
                                                {Object.keys(userStats.byState).length === 0 ? (
                                                    <p className="small mb-0" style={{ color: "var(--color-muted)" }}>No state data recorded.</p>
                                                ) : (
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {Object.entries(userStats.byState)
                                                            .sort((a, b) => b[1] - a[1])
                                                            .map(([stateCode, count]) => (
                                                                <span
                                                                    key={stateCode}
                                                                    className="badge px-2 py-2 d-inline-flex align-items-center gap-1 shadow-none"
                                                                    style={{
                                                                        fontSize: "0.85rem",
                                                                        background: "var(--color-surface)",
                                                                        color: "var(--color-heading)",
                                                                        border: "1px solid var(--color-border)",
                                                                    }}
                                                                >
                                                                    <span className="fw-semibold">{getStateLabel(stateCode)}:</span>
                                                                    <span className="badge text-white ms-1" style={{ background: "var(--color-primary)" }}>{count}</span>
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Users List */}
                                    <div>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--color-heading)" }}>
                                            <FiTrendingUp style={{ color: "var(--color-primary-text)" }} /> Recent Registrations
                                        </h6>
                                        {userStats.recentUsers.length === 0 ? (
                                            <div
                                                className="text-center py-4 small rounded"
                                                style={{ background: "var(--color-bg)", color: "var(--color-muted)", border: "1px solid var(--color-border)" }}
                                            >
                                                No users registered in this time range.
                                            </div>
                                        ) : (
                                            <div className="table-responsive" style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
                                                <table className="table table-hover align-middle mb-0 small table-stack" style={{ color: "var(--color-body)" }}>
                                                    <thead style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                                                        <tr>
                                                            <th className="px-3 py-2.5" style={{ color: "var(--color-muted)" }}>User</th>
                                                            <th className="py-2.5" style={{ color: "var(--color-muted)" }}>Email</th>
                                                            <th className="py-2.5" style={{ color: "var(--color-muted)" }}>Auth Method</th>
                                                            <th className="py-2.5" style={{ color: "var(--color-muted)" }}>State / Category</th>
                                                            <th className="py-2.5" style={{ color: "var(--color-muted)" }}>Joined</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userStats.recentUsers.map((u, i) => (
                                                            <tr key={u.sub || u.email || i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                                                <td className="px-3">
                                                                    <div className="fw-semibold" style={{ color: "var(--color-heading)" }}>{u.given_name} {u.family_name}</div>
                                                                    {u.gender && <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{u.gender}</span>}
                                                                </td>
                                                                <td data-label="Email" style={{ color: "var(--color-muted)" }}>{u.email}</td>
                                                                <td data-label="Sign-in">
                                                                    {u.auth_provider === "google" ? (
                                                                        <span
                                                                            className="badge d-inline-flex align-items-center gap-1"
                                                                            style={{
                                                                                background: "rgba(248, 113, 113, 0.12)",
                                                                                color: "var(--color-danger)",
                                                                                border: "1px solid rgba(248, 113, 113, 0.3)",
                                                                            }}
                                                                        >
                                                                            <BsGoogle size={11} /> Google
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            className="badge d-inline-flex align-items-center gap-1"
                                                                            style={{
                                                                                background: "rgba(34, 197, 94, 0.12)",
                                                                                color: "var(--color-success)",
                                                                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                                                            }}
                                                                        >
                                                                            <FiMail size={11} /> Email/Password
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td data-label="State / Category">
                                                                    <div style={{ color: "var(--color-heading)" }}>{getStateLabel(u.state || "") || "—"}</div>
                                                                    <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>{u.category || "—"}</span>
                                                                </td>
                                                                <td data-label="Joined" style={{ color: "var(--color-muted)" }}>{formatDate(u.created_at)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4" style={{ color: "var(--color-muted)" }}>
                                    Failed to load stats. Try refreshing.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
