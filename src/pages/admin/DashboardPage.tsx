import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { getId } from "../../utils/utils";
import {
  approveNotification,
  deleteNotification,
  permanentDeleteNotification,
  fetchNotifications,
  unarchiveNotification,
  bulkPermanentDeleteNotifications,
} from "../../services/private/notificationApi";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";
import { Dropdown, Form } from "react-bootstrap";
import { FiTrash2 } from "react-icons/fi";

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

  /* Search & Filter state */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [stateSearch, setStateSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Infinite scroll state */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadNotifications = async (s?: string, t?: string, c?: string, st?: string) => {
    setLoading(true);
    try {
      const res = await fetchNotifications(s, t, c, st);
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
    loadNotifications(search, timeRange, categoryFilter, stateFilter);
  }, [search, timeRange, categoryFilter, stateFilter]);

  /* Reset visible count on tab/search/time/category change */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedIds([]); // Reset selection on any filter/tab change
  }, [tab, search, timeRange, categoryFilter, stateFilter]);

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
          loadNotifications(search, timeRange, categoryFilter);
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
          loadNotifications(search, timeRange, categoryFilter);
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
          loadNotifications(search, timeRange, categoryFilter, stateFilter);
        } catch (err: any) {
          showToast(err.message || "Failed to restore notification", "error");
        }
      },
    });
  };

  const getStateLabel = (stateCode: string) => {
    if (!stateCode) return "Unknown";
    const normalizedCode = stateCode.toUpperCase().replace(/-/g, "");
    const state = INDIAN_STATES.find(s => s.value === normalizedCode);
    return state ? state.label : stateCode.replace(/-/g, " ");
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
          loadNotifications(search, timeRange, categoryFilter);
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
      {/* CSS to hide default Bootstrap dropdown carets */}
      <style>
        {`
          .dropdown-toggle::after {
            display: none !important;
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
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div 
        className="p-3 mb-4 rounded-4" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.7)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
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
                className="form-control border-0 bg-white shadow-sm"
                placeholder="Search by title or notification ID..."
                value={searchInput}
                onChange={handleSearchChange}
                style={{
                  borderRadius: 14,
                  paddingLeft: 46,
                  height: 48,
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="col-12 col-lg-7">
            <div className="d-flex flex-wrap flex-sm-nowrap gap-2 justify-content-lg-end">
              {/* Category Dropdown */}
              <Dropdown className="flex-grow-1" style={{ minWidth: 160, maxWidth: 300 }}>
                 <Dropdown.Toggle 
                  as="div" 
                  role="button"
                  className="input-group input-group-sm shadow-sm justify-content-center bg-white" 
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48 }}
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
                  className="input-group input-group-sm shadow-sm justify-content-center bg-white" 
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48 }}
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
                  className="input-group input-group-sm shadow-sm justify-content-center bg-white" 
                  style={{ borderRadius: 14, overflow: 'hidden', height: 48 }}
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
                  <div className="px-3 py-2 sticky-top bg-white border-bottom mb-1">
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

      {/* Select All Toggle (Archived Tab only for now as per plan) */}
      {tab === "archived" && displayList.length > 0 && (
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
                border: "2px solid #cbd5e1",
                background: displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) ? "#000" : "transparent",
                borderColor: displayList.slice(0, visibleCount).every(n => selectedIds.includes(n.sk)) ? "#000" : "#cbd5e1",
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
          <div className="spinner-border text-primary" role="status">
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
        <div className="row g-3">
          {displayList.map((n: any, index: number) => {
            const isLastElement = index === displayList.length - 1;
            return (
              <div
                key={n.sk}
                className="col-12 col-xl-6"
                ref={isLastElement ? lastElementRef : null}
              >
                <div
                  className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
                  style={{ 
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: "1px solid rgba(0,0,0,0.05) !important",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
                  }}
                >
                  <div className="card-body p-3 d-flex gap-3 align-items-start">
                    {/* Checkbox for Selection */}
                    {tab === "archived" && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(n.sk);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          border: `2px solid ${selectedIds.includes(n.sk) ? "#000" : "#cbd5e1"}`,
                          background: selectedIds.includes(n.sk) ? "#000" : "transparent",
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
                      <h6 className="mb-2 fw-bold" style={{ fontSize: "1rem", lineHeight: 1.4, color: "#1e293b" }}>
                        {n.title}
                      </h6>
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span
                          className="badge border"
                          style={{
                            backgroundColor: "#f8fafc",
                            color: "#64748b",
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
                            background: "rgba(99, 102, 241, 0.1)",
                            color: "#6366f1",
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
                            background: "rgba(102, 126, 234, 0.1)",
                            color: "#475569",
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
                              background: "rgba(16, 185, 129, 0.1)",
                              color: "#059669",
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
                    </div>
 
                    {/* Bottom: Action Group */}
                    <div className="d-flex flex-wrap gap-2 pt-2 border-top" style={{ borderColor: "rgba(0,0,0,0.04) !important" }}>
                      <Link
                        to={`/admin/review/${getId(n.sk)}`}
                        className="btn btn-sm flex-grow-1"
                        style={{ 
                          borderRadius: '10px', 
                          fontSize: "0.8rem", 
                          fontWeight: 600,
                          backgroundColor: "#f1f5f9",
                          color: '#475569',
                          border: 'none',
                          padding: '0.5rem'
                        }}
                      >
                        👁️ View
                      </Link>

                      {can(role, "edit") && !n.is_archived && (
                        <Link
                          to={`/admin/edit/${getId(n.sk)}`}
                          className="btn btn-sm flex-grow-1"
                          style={{ 
                            borderRadius: '10px', 
                            fontSize: "0.8rem", 
                            fontWeight: 600,
                            backgroundColor: "rgba(99, 102, 241, 0.08)",
                            color: '#6366f1',
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
                            backgroundColor: 'rgba(23, 162, 184, 0.08)',
                            color: '#0891b2',
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
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
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
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
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
                            color: '#d97706',
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
                            backgroundColor: 'rgba(220, 53, 69, 0.12)',
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
          <div className="spinner-border text-primary spinner-border-sm" role="status">
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
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div 
          className="fixed-bottom d-flex justify-content-center px-3" 
          style={{ zIndex: 1050, bottom: "2rem" }}
        >
          <div 
            className="shadow-lg d-flex align-items-center gap-3 py-3 px-4"
            style={{
              background: "rgba(30, 41, 59, 0.95)",
              backdropFilter: "blur(12px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "500px",
              width: "100%",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              animation: "slideUp 0.4s ease-out"
            }}
          >
            <div className="flex-grow-1">
              <div 
                style={{ 
                  color: "#fff", 
                  fontWeight: 800, 
                  fontSize: "1rem" 
                }}
              >
                {selectedIds.length} Selected
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>
                Actions will be applied to all selected notifications
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-light rounded-pill px-3"
                onClick={() => setSelectedIds([])}
                style={{ border: "1px solid rgba(255,255,255,0.2)", fontSize: "0.8rem" }}
              >
                Cancel
              </button>
              
              <button 
                className="btn btn-sm btn-danger rounded-pill px-4 d-flex align-items-center gap-2 fw-bold"
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
                style={{ boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)", fontSize: "0.8rem" }}
              >
                <FiTrash2 size={16} /> Delete
              </button>
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
