import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import VideoUrlModal from "../../components/VideoUrlModal/VideoUrlModal";
import VideoPreviewModal from "../../components/VideoPreviewModal/VideoPreviewModal";
import Toast from "../../components/Toast/Toast";
import { getId, makeSlug } from "../../utils/utils";
import { SITE_URL } from "../../seo/site";
import {
  approveNotification,
  deleteNotification,
  permanentDeleteNotification,
  fetchNotifications,
  unarchiveNotification,
  bulkPermanentDeleteNotifications,
  bulkArchiveNotifications,
  markDailyVideo,
  markDailyVideoBulk,
  markWeeklyVideoBulk,
} from "../../services/private/notificationApi";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";
import { Dropdown, Form } from "react-bootstrap";
import { FiTrash2, FiArchive, FiCopy } from "react-icons/fi";

/* ============ Role helpers ============ */
type AdminRole = "creator" | "reviewer" | "senior_reviewer" | "admin";

const can = (role: AdminRole | undefined, action: string): boolean => {
  if (!role) return false;
  const perms: Record<string, AdminRole[]> = {
    create: ["creator", "senior_reviewer", "admin"],
    edit: ["creator", "senior_reviewer", "admin"],
    approve: ["reviewer", "senior_reviewer", "admin"],
    archive: ["senior_reviewer", "admin"],
    unarchive: ["senior_reviewer", "admin"],
    video: ["reviewer", "senior_reviewer", "admin"],
  };
  return (perms[action] || []).includes(role);
};

/** Editing an already-approved notification is limited to Senior Reviewer/Admin. */
const canEditNotification = (
  role: AdminRole | undefined,
  notification: { approved_at?: number | null }
): boolean => {
  if (!can(role, "edit")) return false;
  if (role === "admin" || role === "senior_reviewer") return true;
  return !notification.approved_at;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
  senior_reviewer: "linear-gradient(135deg, #7c3aed, #5b21b6)",
  reviewer: "linear-gradient(135deg, var(--color-accent), #d97706)",
  creator: "linear-gradient(135deg, var(--color-secondary), var(--status-result))",
};

const PAGE_SIZE = 20;

const getCategoryLabel = (val: string) => {
  const cat = NOTIFICATION_CATEGORIES.find(c => c.value === val);
  return cat ? cat.label : val;
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);

  /* Search & Filter state */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [stateSearch, setStateSearch] = useState("");
  /* "all" | "done" | "not_done" — tri-state video-status filters */
  const [dailyVideoFilter, setDailyVideoFilter] = useState<"all" | "done" | "not_done">("all");
  const [weeklyVideoFilter, setWeeklyVideoFilter] = useState<"all" | "done" | "not_done">("all");
  /* Only show notifications whose last date to apply hasn't passed yet */
  const [openOnlyFilter, setOpenOnlyFilter] = useState(false);
  /* Only show notifications whose last date to apply is within the next 2 days */
  const [closingSoonFilter, setClosingSoonFilter] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoFilterToBool = (f: "all" | "done" | "not_done"): boolean | undefined =>
    f === "all" ? undefined : f === "done";

  /* Infinite scroll state */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadNotifications = async (
    s?: string,
    t?: string,
    c?: string,
    st?: string,
    dv: "all" | "done" | "not_done" = dailyVideoFilter,
    wv: "all" | "done" | "not_done" = weeklyVideoFilter,
    openOnly: boolean = openOnlyFilter,
    closingSoon: boolean = closingSoonFilter,
  ) => {
    setLoading(true);
    try {
      const res = await fetchNotifications(s, t, c, st, videoFilterToBool(dv), videoFilterToBool(wv), openOnly || undefined, closingSoon || undefined);
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
    loadNotifications(search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter, closingSoonFilter);
  }, [search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter, closingSoonFilter]);

  /* Reset visible count on tab/search/time/category change */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedIds([]); // Reset selection on any filter/tab change
  }, [tab, search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter, closingSoonFilter]);

  /* The video-status and open-only/closing-soon filters are only shown on the
     Approved tab — clear them when leaving it so they don't silently keep
     filtering other tabs. */
  useEffect(() => {
    if (tab !== "approved") {
      setDailyVideoFilter("all");
      setWeeklyVideoFilter("all");
      setOpenOnlyFilter(false);
      setClosingSoonFilter(false);
    }
  }, [tab]);

  /* Debounced search */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
    }, 300);
  };

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

  const toggleSelect = useCallback((sk: string) => {
    if (!sk) return;
    setSelectedIds(prev =>
      prev.includes(sk) ? prev.filter(i => i !== sk) : [...prev, sk]
    );
  }, []);

  const handleSelectAll = useCallback((items: any[]) => {
    const visibleSks = items.slice(0, visibleCount).map(n => n.sk).filter(Boolean);
    const allVisibleSelected = visibleSks.every(sk => selectedIds.includes(sk));

    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(sk => !visibleSks.includes(sk)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleSks])));
    }
  }, [selectedIds, visibleCount]);

  const performBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    setModal(m => ({ ...m, show: false }));
    try {
      const idsToDelete = selectedIds.map(sk => getId(sk)).filter(Boolean);
      await bulkPermanentDeleteNotifications(idsToDelete);
      showToast(`${idsToDelete.length} notifications deleted permanently`, "success");
      setSelectedIds([]);
      loadNotifications(search, timeRange, categoryFilter, stateFilter);
    } catch (err: any) {
      showToast(err?.message || "Bulk delete failed", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const performBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkArchiving(true);
    setModal(m => ({ ...m, show: false }));
    try {
      const idsToArchive = selectedIds.map(sk => getId(sk)).filter(Boolean);
      await bulkArchiveNotifications(idsToArchive);
      showToast(`${idsToArchive.length} notifications archived`, "success");
      setSelectedIds([]);
      loadNotifications(search, timeRange, categoryFilter, stateFilter);
    } catch (err: any) {
      showToast(err?.message || "Bulk archive failed", "error");
    } finally {
      setIsBulkArchiving(false);
    }
  };

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
          setSelectedIds((prev) => prev.filter((sk) => getId(sk) !== id));
          loadNotifications(search, timeRange, categoryFilter, stateFilter);
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
          setSelectedIds((prev) => prev.filter((sk) => getId(sk) !== id));
          loadNotifications(search, timeRange, categoryFilter, stateFilter);
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
          setSelectedIds((prev) => prev.filter((sk) => getId(sk) !== id));
          loadNotifications(search, timeRange, categoryFilter, stateFilter);
        } catch (err: any) {
          showToast(err.message || "Failed to restore notification", "error");
        }
      },
    });
  };

  /* Detail-page URL for a notification — same slug logic the public site uses,
     so a copied link is guaranteed to match what actually resolves. */
  const buildDetailUrl = (n: any) => `${SITE_URL}/notification/${makeSlug(n.title, getId(n.sk))}`;

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage, "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleCopyOne = (n: any) => {
    copyToClipboard(`${n.title} — ${buildDetailUrl(n)}`, "Copied to clipboard");
  };

  const handleCopySelected = (items: any[]) => {
    const selected = items.filter((n) => selectedIds.includes(n.sk));
    const text = selected.map((n) => `${n.title} — ${buildDetailUrl(n)}`).join("\n");
    copyToClipboard(text, `Copied ${selected.length} link${selected.length === 1 ? "" : "s"} to clipboard`);
  };

  /* Marking a video "done" needs an optional YouTube URL, collected via
     VideoUrlModal — daily and weekly are independent, and weekly reuses the
     bulk endpoint even for a single notification (ids.length === 1). */
  const [videoModal, setVideoModal] = useState<{ type: "daily" | "weekly"; ids: string[] } | null>(null);

  const handleToggleDailyVideo = async (id: string, currentlyDone: boolean) => {
    if (currentlyDone) {
      try {
        await markDailyVideo(id, false, undefined);
        showToast("Daily video unmarked", "success");
        loadNotifications(search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter);
      } catch (err: any) {
        showToast(err?.message || "Failed to update daily video status", "error");
      }
      return;
    }
    setVideoModal({ type: "daily", ids: [id] });
  };

  const handleToggleWeeklyVideo = async (id: string, currentlyDone: boolean) => {
    if (currentlyDone) {
      try {
        await markWeeklyVideoBulk([id], false, undefined);
        showToast("Weekly video unmarked", "success");
        loadNotifications(search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter);
      } catch (err: any) {
        showToast(err?.message || "Failed to update weekly video status", "error");
      }
      return;
    }
    setVideoModal({ type: "weekly", ids: [id] });
  };

  const handleMarkDailyVideoSelected = () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.map((sk) => getId(sk)).filter(Boolean);
    setVideoModal({ type: "daily", ids });
  };

  const handleMarkWeeklyVideoSelected = () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.map((sk) => getId(sk)).filter(Boolean);
    setVideoModal({ type: "weekly", ids });
  };

  const handleVideoModalConfirm = async (videoUrl: string | undefined) => {
    if (!videoModal) return;
    const { type, ids } = videoModal;
    setVideoModal(null);
    try {
      if (type === "daily") {
        await markDailyVideoBulk(ids, true, videoUrl);
        showToast(`Marked daily video done for ${ids.length} notification${ids.length === 1 ? "" : "s"}`, "success");
        setSelectedIds([]);
      } else {
        await markWeeklyVideoBulk(ids, true, videoUrl);
        showToast(`Marked weekly video done for ${ids.length} notification${ids.length === 1 ? "" : "s"}`, "success");
        setSelectedIds([]);
      }
      loadNotifications(search, timeRange, categoryFilter, stateFilter, dailyVideoFilter, weeklyVideoFilter, openOnlyFilter);
    } catch (err: any) {
      showToast(err?.message || "Failed to update video status", "error");
    }
  };

  const getStateLabel = (stateCode: string) => {
    if (!stateCode) return "Unknown";
    const normalizedCode = stateCode.toUpperCase().replace(/-/g, "");
    const state = INDIAN_STATES.find(s => s.value === normalizedCode);
    return state ? state.label : stateCode.replace(/-/g, " ");
  };

  /* Video preview shown in-page when a badge with a saved URL is clicked */
  const [videoPreview, setVideoPreview] = useState<{ title: string; url: string } | null>(null);

  /** Daily/weekly video status badge — opens an in-page preview of the saved
      YouTube URL when one was provided, a plain badge otherwise. */
  const renderVideoBadge = (
    label: string,
    icon: string,
    done: boolean,
    url?: string | null,
    markedBy?: string | null,
  ) => {
    const style: React.CSSProperties = {
      background: done ? "rgba(22, 163, 74, 0.1)" : "rgba(0,0,0,0.05)",
      color: done ? "var(--color-success)" : "var(--color-muted)",
      fontSize: "0.7rem",
      padding: "4px 10px",
      borderRadius: 6,
      fontWeight: 600,
    };
    const tooltip = [markedBy ? `Marked by ${markedBy}` : null, url ? "Click to preview video" : null]
      .filter(Boolean)
      .join(" — ") || undefined;
    const content = (
      <>
        {icon} {label} {done ? "✅" : "❌"}
        {url && " 🔗"}
      </>
    );
    if (url) {
      return (
        <button
          type="button"
          className="badge border-0"
          style={{ ...style, cursor: "pointer" }}
          title={tooltip}
          onClick={(e) => {
            e.stopPropagation();
            setVideoPreview({ title: `${label} Video`, url });
          }}
        >
          {content}
        </button>
      );
    }
    return (
      <span className="badge" style={style} title={tooltip}>
        {content}
      </span>
    );
  };

  const handlePermanentDelete = (id: string) => {
    setModal({
      show: true,
      title: "⚠️ PERMANENT DELETE",
      message: "Are you sure you want to permanently delete this notification? THIS ACTION IS IRREVERSIBLE and will remove ALL related data (Fee, Eligibility, Links, Comments) from the database.",
      confirmText: "Permanently Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        setModal((m) => ({ ...m, show: false }));
        try {
          await permanentDeleteNotification(id);
          showToast("Notification permanently deleted from database!", "success");
          setSelectedIds((prev) => prev.filter((sk) => getId(sk) !== id));
          loadNotifications(search, timeRange, categoryFilter, stateFilter);
        } catch (err: any) {
          showToast(err.message || "Failed to permanently delete", "error");
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

  const fullList = tabConfig.find((t) => t.key === tab)?.list || [];
  const displayList = fullList.slice(0, visibleCount);
  const hasMore = visibleCount < fullList.length;

  // Bulk-select is available on the Archived tab (permanent delete) and,
  // for roles with archive or video-marking permission, on the other tabs
  // too (bulk archive, copy links, bulk weekly-video marking).
  const canBulkSelect = tab === "archived" || can(role, "archive") || can(role, "video");

  /* Intersection observer for infinite scroll */
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="container-fluid px-3 px-lg-4 px-xxl-5 py-3 py-md-4">
      {/* CSS to hide default Bootstrap dropdown carets + brand-color overrides */}
      <style>
        {`
          .dropdown-toggle::after {
            display: none !important;
          }
          .dropdown-menu {
            --bs-dropdown-link-active-bg: var(--color-primary);
            --bs-dropdown-link-active-color: #fff;
          }
          .admin-tab-btn {
            border: 1px solid var(--color-border);
            background: var(--color-surface);
            color: var(--color-body);
          }
          .admin-tab-btn:hover {
            border-color: rgba(15, 61, 145, 0.3);
            background: rgba(15, 61, 145, 0.05);
          }
          .admin-tab-btn--active,
          .admin-tab-btn--active:hover {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #fff;
          }
          .admin-notif-card {
            position: relative;
          }
          .admin-notif-card::before {
            content: "";
            display: block;
            height: 4px;
            width: 100%;
            background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          }
        `}
      </style>

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
        <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-0 w-100 justify-content-sm-end">
          {can(role, "create") && (
            <Link
              to="/admin/addNotification"
              className="btn btn-light fw-semibold shadow-sm w-100"
              style={{ borderRadius: 12, maxWidth: '200px' }}
            >
              + Add Notification
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/scraper"
              className="btn fw-semibold shadow-sm w-100"
              style={{ 
                borderRadius: 12, 
                maxWidth: '200px', 
                background: 'rgba(255,255,255,0.15)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.3)' 
              }}
            >
              🕷️ Auto Scraper
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/roles"
              className="btn fw-semibold shadow-sm w-100"
              style={{
                borderRadius: 12,
                maxWidth: '200px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              🔑 Manage Roles
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/users"
              className="btn fw-semibold shadow-sm w-100"
              style={{
                borderRadius: 12,
                maxWidth: '200px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              👥 Users & Feedback
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/email-templates"
              className="btn fw-semibold shadow-sm w-100"
              style={{
                borderRadius: 12,
                maxWidth: '200px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              ✉️ Email Templates
            </Link>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div 
        className="p-3 mb-4 rounded-4" 
        style={{
          background: 'var(--color-surface)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          zIndex: 1020
        }}
      >
        <div className="row g-3 align-items-center">
          {/* Search Section */}
          <div className="col-12 col-lg-5">
            <div className="position-relative">
              <span
                className="position-absolute top-50 translate-middle-y"
                style={{ left: 16, fontSize: '1rem', opacity: 0.4, pointerEvents: 'none' }}
              >
                🔍
              </span>
              <input
                id="notification-search"
                type="text"
                className="form-control border-0 shadow-sm"
                placeholder="Search by title or notification ID..."
                value={searchInput}
                onChange={handleSearchChange}
                style={{
                  borderRadius: 14,
                  paddingLeft: 46,
                  height: 48,
                  fontSize: '0.95rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-heading)',
                }}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="col-12 col-lg-7">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
              {/* Category Dropdown */}
              <Dropdown className="flex-grow-1" style={{ minWidth: 160, maxWidth: 300 }}>
                 <Dropdown.Toggle 
                  as="div" 
                  role="button"
                  className="input-group input-group-sm shadow-sm justify-content-center"
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48, background: 'var(--color-bg)' }}
                >
                  <div className="d-flex align-items-center gap-2 px-3 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>📁</span>
                    <span className="fw-medium">
                      {getCategoryLabel(categoryFilter) || "Categories"}
                    </span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu 
                  className="border-0 shadow-lg p-2" 
                  style={{ 
                    borderRadius: 16, 
                    minWidth: '100%',
                    marginTop: '8px',
                    zIndex: 1050
                  }}
                >
                  {NOTIFICATION_CATEGORIES.map((cat) => (
                    <Dropdown.Item 
                      key={cat.value} 
                      active={categoryFilter === cat.value}
                      onClick={() => setCategoryFilter(cat.value)}
                      className="rounded-3 mb-1 px-3 py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      {cat.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {/* Time Dropdown */}
              <Dropdown className="flex-grow-1" style={{ minWidth: 140, maxWidth: 200 }}>
                <Dropdown.Toggle 
                  as="div" 
                  role="button"
                  className="input-group input-group-sm shadow-sm justify-content-center"
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48, background: 'var(--color-bg)' }}
                >
                  <div className="d-flex align-items-center gap-2 px-3 text-muted" style={{ fontSize: '0.9rem' }}>
                    <span>🕒</span>
                    <span className="fw-medium">
                      {timeRange === "all" ? "Anytime" : timeRange.replace(/_/g, " ")}
                    </span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu 
                  className="border-0 shadow-lg p-2" 
                  style={{ 
                    borderRadius: 16, 
                    minWidth: '100%',
                    marginTop: '8px',
                    zIndex: 1050
                  }}
                >
                  <Dropdown.Item onClick={() => setTimeRange("all")} active={timeRange === "all"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Anytime</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange("today")} active={timeRange === "today"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Today</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange("last_week")} active={timeRange === "last_week"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Last Week</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange("last_month")} active={timeRange === "last_month"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Last Month</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange("last_3_months")} active={timeRange === "last_3_months"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>3 Months</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange("last_6_months")} active={timeRange === "last_6_months"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>6 Months</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* State Dropdown */}
              <Dropdown className="flex-grow-1" style={{ minWidth: 160, maxWidth: 250 }}>
                <Dropdown.Toggle 
                  as="div" 
                  role="button"
                  className="input-group input-group-sm shadow-sm justify-content-center"
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48, background: 'var(--color-bg)' }}
                >
                  <div className="d-flex align-items-center gap-2 px-3 text-muted text-truncate" style={{ fontSize: '0.9rem' }}>
                    <span>📍</span>
                    <span className="fw-medium">
                      {stateFilter === "all" ? "Everywhere" : getStateLabel(stateFilter)}
                    </span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu 
                  className="border-0 shadow-lg p-1" 
                  style={{ 
                    borderRadius: 16, 
                    minWidth: '240px', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    marginTop: '8px',
                    zIndex: 1050
                  }}
                >
                  <div className="px-3 py-2 sticky-top border-bottom mb-1" style={{ background: "var(--color-surface)" }}>
                    <Form.Control
                      size="sm"
                      type="text"
                      placeholder="Search state..."
                      autoFocus
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      style={{ borderRadius: 10, fontSize: '0.85rem', padding: '0.6rem 0.8rem', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>
                  <Dropdown.Item onClick={() => setStateFilter("all")} active={stateFilter === "all"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Everywhere</Dropdown.Item>
                  {INDIAN_STATES
                    .filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
                    .map((s) => (
                      <Dropdown.Item 
                        key={s.value} 
                        active={stateFilter === s.value}
                        onClick={() => setStateFilter(s.value)}
                        className="rounded-3 mb-1 px-3 py-2"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {s.label}
                      </Dropdown.Item>
                    ))
                  }
                  {INDIAN_STATES.filter(s => s.label.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 && (
                    <div className="text-muted text-center py-2" style={{ fontSize: '0.8rem' }}>No region found</div>
                  )
                  }
                </Dropdown.Menu>
              </Dropdown>

              {/* Daily/Weekly video status filters only make sense for approved
                  notifications — those are the only ones that can ever have
                  video status marked. */}
              {tab === "approved" && (
                <>
                  {/* Daily Video Status Dropdown */}
                  <Dropdown className="flex-grow-1" style={{ minWidth: 150, maxWidth: 220 }}>
                    <Dropdown.Toggle
                      as="div"
                      role="button"
                      className="input-group input-group-sm shadow-sm justify-content-center"
                      style={{ borderRadius: 14, overflow: 'hidden', height: 48, background: 'var(--color-bg)' }}
                    >
                      <div className="d-flex align-items-center gap-2 px-3 text-muted" style={{ fontSize: '0.9rem' }}>
                        <span>🎥</span>
                        <span className="fw-medium">
                          {dailyVideoFilter === "all" ? "Daily Video" : dailyVideoFilter === "done" ? "Daily: Done" : "Daily: Not Done"}
                        </span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="border-0 shadow-lg p-2" style={{ borderRadius: 16, minWidth: '100%', marginTop: '8px', zIndex: 1050 }}>
                      <Dropdown.Item onClick={() => setDailyVideoFilter("all")} active={dailyVideoFilter === "all"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Any</Dropdown.Item>
                      <Dropdown.Item onClick={() => setDailyVideoFilter("done")} active={dailyVideoFilter === "done"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Done</Dropdown.Item>
                      <Dropdown.Item onClick={() => setDailyVideoFilter("not_done")} active={dailyVideoFilter === "not_done"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Not Done</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Weekly Video Status Dropdown */}
                  <Dropdown className="flex-grow-1" style={{ minWidth: 150, maxWidth: 220 }}>
                    <Dropdown.Toggle
                      as="div"
                      role="button"
                      className="input-group input-group-sm shadow-sm justify-content-center"
                      style={{ borderRadius: 14, overflow: 'hidden', height: 48, background: 'var(--color-bg)' }}
                    >
                      <div className="d-flex align-items-center gap-2 px-3 text-muted" style={{ fontSize: '0.9rem' }}>
                        <span>🎬</span>
                        <span className="fw-medium">
                          {weeklyVideoFilter === "all" ? "Weekly Video" : weeklyVideoFilter === "done" ? "Weekly: Done" : "Weekly: Not Done"}
                        </span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="border-0 shadow-lg p-2" style={{ borderRadius: 16, minWidth: '100%', marginTop: '8px', zIndex: 1050 }}>
                      <Dropdown.Item onClick={() => setWeeklyVideoFilter("all")} active={weeklyVideoFilter === "all"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Any</Dropdown.Item>
                      <Dropdown.Item onClick={() => setWeeklyVideoFilter("done")} active={weeklyVideoFilter === "done"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Done</Dropdown.Item>
                      <Dropdown.Item onClick={() => setWeeklyVideoFilter("not_done")} active={weeklyVideoFilter === "not_done"} className="rounded-3 mb-1 px-3 py-2" style={{ fontSize: '0.9rem' }}>Not Done</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}

              {/* Open Only Toggle — last date to apply hasn't passed. Only
                  meaningful for approved (i.e. actually published) notifications. */}
              {tab === "approved" && (
                <button
                  type="button"
                  className="btn btn-sm flex-grow-1"
                  onClick={() => setOpenOnlyFilter((prev) => !prev)}
                  style={{
                    borderRadius: 14,
                    height: 48,
                    minWidth: 130,
                    maxWidth: 170,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    border: openOnlyFilter ? 'none' : '1px solid var(--color-border)',
                    background: openOnlyFilter ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: openOnlyFilter ? '#fff' : 'var(--color-muted)',
                  }}
                >
                  🟢 Open Only
                </button>
              )}

              {/* Closing Soon Toggle — last date to apply within the next 2 days */}
              {tab === "approved" && (
                <button
                  type="button"
                  className="btn btn-sm flex-grow-1"
                  onClick={() => setClosingSoonFilter((prev) => !prev)}
                  style={{
                    borderRadius: 14,
                    height: 48,
                    minWidth: 150,
                    maxWidth: 190,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    border: closingSoonFilter ? 'none' : '1px solid var(--color-border)',
                    background: closingSoonFilter ? 'var(--color-danger)' : 'var(--color-bg)',
                    color: closingSoonFilter ? '#fff' : 'var(--color-muted)',
                  }}
                >
                  ⏰ Closing in 2 Days
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4 justify-content-start">
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`admin-tab-btn btn rounded-pill d-flex align-items-center gap-1 flex-grow-0 py-1 py-md-2 px-2 px-md-3 ${
              tab === t.key
                ? "admin-tab-btn--active fw-semibold"
                : ""
            }`}
            style={{ 
              transition: "all 0.2s ease",
              fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)"
            }}
          >
            {t.icon} {t.label}{" "}
            <span
              className="badge ms-1"
              style={{
                fontSize: "0.7rem",
                background: tab === t.key ? "rgba(255,255,255,0.25)" : "var(--color-bg)",
                color: tab === t.key ? "#fff" : "var(--color-muted)",
              }}
            >
              {t.list.length}
            </span>
          </button>
        ))}
      </div>

      {/* Select All Toggle */}
      {canBulkSelect && displayList.length > 0 && (
        <div className="mb-3 px-1">
          <label 
            className="d-flex align-items-center gap-2" 
            style={{ cursor: "pointer", width: "fit-content" }}
            onClick={() => handleSelectAll(displayList)}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: "2px solid var(--color-border)",
                background: displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) ? "var(--color-primary)" : "transparent",
                borderColor: displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) ? "var(--color-primary)" : "var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                transition: "all 0.2s"
              }}
            >
              {displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) && <span style={{ fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <span className="fw-bold text-secondary" style={{ fontSize: "0.85rem" }}>
              {displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) ? "Deselect All" : "Select All Visible"}
            </span>
          </label>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📭</div>
          <p className="mt-2">
            {search
              ? `No notifications matching "${search}"`
              : "No notifications in this tab"}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {displayList.map((n: any, index: number) => {
            const isLastElement = index === displayList.length - 1;
            return (
              <div
                key={n.sk}
                className="col-12 col-xl-6"
                ref={isLastElement ? lastElementRef : null}
              >
                <div
                  className="card admin-notif-card border-0 rounded-4 overflow-hidden h-100"
                  style={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
                  }}
                >
                  <div className="card-body p-3 d-flex gap-3 align-items-start">
                    {/* Checkbox for Selection */}
                    {canBulkSelect && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(n.sk);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          border: `2px solid ${selectedIds.includes(n.sk) ? "var(--color-primary)" : "var(--color-border)"}`,
                          background: selectedIds.includes(n.sk) ? "var(--color-primary)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          marginTop: 4,
                          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                          color: "#fff"
                        }}
                      >
                        {selectedIds.includes(n.sk) && <span style={{ fontSize: 13, fontWeight: 900 }}>✓</span>}
                      </div>
                    )}

                    <div className="flex-grow-1 d-flex flex-column gap-3">
                    {/* Top: Info Row */}
                    <div>
                      <h6 className="mb-2 fw-bold" style={{ fontSize: "1rem", lineHeight: 1.4, color: "var(--color-heading)" }}>
                        {n.title}
                      </h6>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span
                          className="badge border"
                          style={{
                            backgroundColor: "var(--color-bg)",
                            color: "var(--color-muted)",
                            fontSize: "0.65rem",
                            fontFamily: "monospace",
                            padding: "4px 8px",
                            borderRadius: 6
                          }}
                          title="Notification ID"
                        >
                          ID: {getId(n.sk)}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: "rgba(37, 99, 235, 0.1)",
                            color: "var(--color-secondary)",
                            fontSize: "0.7rem",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontWeight: 600
                          }}
                        >
                          {getCategoryLabel(n.category)}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: "rgba(2, 132, 199, 0.1)",
                            color: "var(--color-info)",
                            fontSize: "0.7rem",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontWeight: 600,
                            textTransform: "capitalize"
                          }}
                        >
                          📍 {getStateLabel(n.state)}
                        </span>
                        {n.scraped_from && (
                          <span
                            className="badge"
                            style={{
                              background: "rgba(22, 163, 74, 0.1)",
                              color: "var(--color-success)",
                              fontSize: "0.7rem",
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontWeight: 600
                            }}
                            title={`Scraped from ${n.scraped_from}`}
                          >
                            🌐 {n.scraped_from}
                          </span>
                        )}
                        <span
                          className="text-muted ms-auto"
                          style={{ fontSize: "0.75rem", fontWeight: 500 }}
                        >
                          📅 {new Date(n.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {!!n.approved_at && (
                        <div
                          className="d-flex flex-wrap align-items-center gap-2 mt-2 p-2 rounded-3"
                          style={{ background: "rgba(22, 163, 74, 0.05)", border: "1px solid rgba(22, 163, 74, 0.12)" }}
                        >
                          {renderVideoBadge("Daily", "🎥", !!n.daily_video_done, n.daily_video_url, n.daily_video_marked_by)}
                          {renderVideoBadge("Weekly", "🎬", !!n.weekly_video_done, n.weekly_video_url, n.weekly_video_marked_by)}

                          <div className="d-flex flex-wrap gap-2 ms-auto">
                            <button
                              className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                              style={{
                                borderRadius: '8px',
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                backgroundColor: "#fff",
                                color: 'var(--color-body)',
                                border: '1px solid var(--color-border)',
                                padding: '0.35rem 0.6rem',
                              }}
                              onClick={() => handleCopyOne(n)}
                              title="Copy title and link"
                            >
                              <FiCopy size={12} /> Copy
                            </button>

                            {can(role, "video") && !n.is_archived && (
                              <button
                                className="btn btn-sm"
                                style={{
                                  borderRadius: '8px',
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: n.daily_video_done ? "rgba(220, 38, 38, 0.08)" : "rgba(22, 163, 74, 0.12)",
                                  color: n.daily_video_done ? "var(--color-danger)" : "var(--color-success)",
                                  border: 'none',
                                  padding: '0.35rem 0.6rem',
                                }}
                                onClick={() => handleToggleDailyVideo(getId(n.sk), !!n.daily_video_done)}
                              >
                                🎥 {n.daily_video_done ? "Undo Daily" : "Mark Daily"}
                              </button>
                            )}

                            {can(role, "video") && !n.is_archived && (
                              <button
                                className="btn btn-sm"
                                style={{
                                  borderRadius: '8px',
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: n.weekly_video_done ? "rgba(220, 38, 38, 0.08)" : "rgba(22, 163, 74, 0.12)",
                                  color: n.weekly_video_done ? "var(--color-danger)" : "var(--color-success)",
                                  border: 'none',
                                  padding: '0.35rem 0.6rem',
                                }}
                                onClick={() => handleToggleWeeklyVideo(getId(n.sk), !!n.weekly_video_done)}
                              >
                                🎬 {n.weekly_video_done ? "Undo Weekly" : "Mark Weekly"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Workflow actions: view / edit / clone / approve */}
                    <div className="d-flex flex-wrap gap-2 pt-2 border-top" style={{ borderColor: "rgba(0,0,0,0.04) !important" }}>
                      <Link
                        to={`/admin/review/${getId(n.sk)}`}
                        className="btn btn-sm flex-grow-1"
                        style={{
                          borderRadius: '10px',
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          backgroundColor: "var(--color-bg)",
                          color: 'var(--color-body)',
                          border: 'none',
                          padding: '0.5rem'
                        }}
                      >
                        👁️ View
                      </Link>

                      {canEditNotification(role, n) && !n.is_archived && (
                        <Link
                          to={`/admin/edit/${getId(n.sk)}`}
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            backgroundColor: "rgba(37, 99, 235, 0.08)",
                            color: 'var(--color-secondary)',
                            border: 'none',
                            padding: '0.5rem'
                          }}
                        >
                          ✏️ Edit
                        </Link>
                      )}

                      {can(role, "create") && !n.is_archived && (
                        <Link
                          to={`/admin/addNotification?clone=${getId(n.sk)}`}
                          className="btn btn-sm flex-grow-1"
                          style={{
                            borderRadius: '10px',
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            backgroundColor: 'rgba(2, 132, 199, 0.08)',
                            color: 'var(--color-info)',
                            border: 'none',
                            padding: '0.5rem'
                          }}
                        >
                          📋 Clone
                        </Link>
                      )}

                      {can(role, "approve") && !n.approved_at && !n.is_archived && (
                        <button
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.80rem", 
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, var(--color-success), #15803d)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                          }}
                          onClick={() => handleApprove(getId(n.sk))}
                        >
                          ✓ Approve
                        </button>
                      )}

                      {can(role, "archive") && !n.is_archived && (
                        <button
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                            color: 'var(--color-danger)',
                            border: 'none',
                            padding: '0.5rem'
                          }}
                          onClick={() => handleDelete(getId(n.sk))}
                        >
                          🗄️ Archive
                        </button>
                      )}

                      {can(role, "unarchive") && n.is_archived && (
                        <button
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--color-accent)',
                            border: 'none',
                            padding: '0.5rem'
                          }}
                          onClick={() => handleUnarchive(getId(n.sk))}
                        >
                          ♻️ Restore
                        </button>
                      )}

                      {role === "admin" && n.is_archived && (
                        <button
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.8rem", 
                            fontWeight: 700,
                            backgroundColor: 'rgba(220, 38, 38, 0.12)',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '0.5rem'
                          }}
                          onClick={() => handlePermanentDelete(getId(n.sk))}
                        >
                          🗑️ Permanent Delete
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Infinite scroll loading indicator */}
      {hasMore && !loading && (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} role="status">
            <span className="visually-hidden">Loading more...</span>
          </div>
        </div>
      )}

      {/* End of list */}
      {!hasMore && fullList.length > PAGE_SIZE && !loading && (
        <div className="text-center mt-4 text-muted small">
          All {fullList.length} notifications loaded.
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
      {/* Video URL Modal */}
      <VideoUrlModal
        show={!!videoModal}
        title={
          videoModal
            ? `Mark ${videoModal.type === "daily" ? "Daily" : "Weekly"} Video Done${videoModal.ids.length > 1 ? ` (${videoModal.ids.length} notifications)` : ""}`
            : ""
        }
        onConfirm={handleVideoModalConfirm}
        onCancel={() => setVideoModal(null)}
      />
      {/* Video Preview Modal */}
      <VideoPreviewModal
        show={!!videoPreview}
        title={videoPreview?.title || "Video"}
        url={videoPreview?.url || null}
        onClose={() => setVideoPreview(null)}
      />
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          className="fixed-bottom d-flex justify-content-center px-2 px-sm-3"
          style={{ zIndex: 1050, bottom: "1rem" }}
        >
          <div
            className="shadow-lg"
            style={{
              background: "rgba(30, 41, 59, 0.97)",
              backdropFilter: "blur(12px)",
              borderRadius: "18px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "820px",
              width: "100%",
              padding: "0.85rem 1rem",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              animation: "slideUp 0.4s ease-out",
            }}
          >
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>
                  {selectedIds.length} Selected
                </div>
                <div className="d-none d-sm-block" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
                  Actions will be applied to all selected notifications
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3 flex-shrink-0"
                onClick={() => setSelectedIds([])}
                style={{ border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.8rem", whiteSpace: "nowrap" }}
              >
                Cancel
              </button>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                className="btn btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold flex-grow-1"
                onClick={() => handleCopySelected(notifications)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                  minWidth: 110,
                }}
              >
                <FiCopy size={14} /> Copy
              </button>

              {tab === "approved" && can(role, "video") && (
                <button
                  className="btn btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold flex-grow-1"
                  onClick={handleMarkDailyVideoSelected}
                  style={{
                    background: "rgba(22, 163, 74, 0.85)",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    minWidth: 150,
                  }}
                >
                  🎥 Mark Daily Video
                </button>
              )}

              {tab === "approved" && can(role, "video") && (
                <button
                  className="btn btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold flex-grow-1"
                  onClick={handleMarkWeeklyVideoSelected}
                  style={{
                    background: "rgba(22, 163, 74, 0.85)",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    minWidth: 160,
                  }}
                >
                  🎬 Mark Weekly Video
                </button>
              )}

              {tab === "archived" ? (
                <button
                  className="btn btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold flex-grow-1"
                  disabled={isBulkDeleting}
                  onClick={() => {
                    setModal({
                      show: true,
                      title: "Confirm Bulk Permanent Delete",
                      message: `Are you sure you want to permanently delete these ${selectedIds.length} notifications? This action is absolutely irreversible.`,
                      confirmText: isBulkDeleting ? "Deleting..." : "Delete Permanently",
                      confirmVariant: "danger",
                      onConfirm: performBulkDelete
                    });
                  }}
                  style={{
                    background: "var(--color-danger)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    minWidth: 120,
                  }}
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              ) : (
                can(role, "archive") && (
                  <button
                    className="btn btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center gap-2 fw-bold flex-grow-1"
                    disabled={isBulkArchiving}
                    onClick={() => {
                      setModal({
                        show: true,
                        title: "Confirm Bulk Archive",
                        message: `Are you sure you want to archive these ${selectedIds.length} notifications?`,
                        confirmText: isBulkArchiving ? "Archiving..." : "Archive",
                        confirmVariant: "danger",
                        onConfirm: performBulkArchive
                      });
                    }}
                    style={{
                      background: "var(--color-danger)",
                      color: "#fff",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      minWidth: 120,
                    }}
                  >
                    <FiArchive size={16} /> Archive
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default DashboardPage;
