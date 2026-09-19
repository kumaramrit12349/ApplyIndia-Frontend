import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiMail,
  FiInbox,
  FiBell,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertOctagon,
  FiArrowLeft,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  listAdminContacts,
  listTrashedContacts,
  fetchContactStats,
  updateContactStatus,
  updateContactPriority,
  getContactNotes,
  addContactNote,
  getContactReplies,
  sendContactReply,
  setContactSpam,
  softDeleteContact,
  restoreContact,
  permanentlyDeleteContact,
  bulkSoftDeleteContacts,
  bulkPermanentlyDeleteContacts,
} from "../../services/private/contactAdminApi";
import type {
  ContactCategory,
  ContactPriority,
  ContactStatus,
  IContact,
  IContactNote,
  IContactReply,
  IContactStats,
} from "../../interface/ContactInterface";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import "./AdminContactPage.css";

interface AdminContactPageProps {
  adminRole?: string;
}

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  report_error: "Report an Error",
  suggest_update: "Suggest an Update",
  report_broken_link: "Report a Broken Link",
  general_query: "General Query",
  business_enquiry: "Business Enquiry",
  feedback: "Feedback",
  other: "Other",
};

const STATUS_TABS: { value: ContactStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "waiting_for_user", label: "Waiting for User" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const DATE_RANGES: { value: string; label: string }[] = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_week", label: "Last 7 Days" },
  { value: "last_month", label: "Last 30 Days" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
];

/**
 * Same value/label convention already used for this kind of filter elsewhere
 * (e.g. AdminUsersPage's time-range picker). Every option is a simple lower
 * bound except "Yesterday", which needs both ends — the backend only applies
 * dateTo when dateFrom is also present, so it's harmless to leave dateTo
 * unset for every other option.
 */
function getDateRangeBounds(range: string): { dateFrom?: number; dateTo?: number } {
  const DAY = 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  switch (range) {
    case "today":
      return { dateFrom: startOfToday.getTime() };
    case "yesterday":
      return { dateFrom: startOfToday.getTime() - DAY, dateTo: startOfToday.getTime() };
    case "last_week":
      return { dateFrom: Date.now() - 7 * DAY };
    case "last_month":
      return { dateFrom: Date.now() - 30 * DAY };
    case "last_3_months":
      return { dateFrom: Date.now() - 90 * DAY };
    case "last_6_months":
      return { dateFrom: Date.now() - 180 * DAY };
    default:
      return {};
  }
}

/** How many submissions each infinite-scroll fetch pulls — tune here, not inline at the call site. */
const CONTACT_PAGE_SIZE = 20;

const formatDateTime = (epoch?: number) => {
  if (!epoch) return "—";
  // en-IN's Intl output lowercases am/pm regardless of options — uppercase
  // it after the fact rather than fighting the locale for it.
  const formatted = new Date(epoch).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return formatted.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
};

const AdminContactPage: React.FC<AdminContactPageProps> = ({ adminRole }) => {
  const [view, setView] = useState<"list" | "trash">("list");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ContactCategory | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ContactPriority | "">("");
  const [spamOnly, setSpamOnly] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [searchField, setSearchField] = useState<"reference_id" | "name" | "email" | "message" | "page_url">("name");
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState<IContactStats | null>(null);
  const loadStats = useCallback(() => {
    fetchContactStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);
  useEffect(() => {
    loadStats();
  }, [view, loadStats]);

  const [contacts, setContacts] = useState<IContact[]>([]);
  // Which submission's card is expanded to full-width in the grid — only one
  // at a time, tracked here (not inside ContactCard) so the grid wrapper
  // around each card knows whether to span both columns.
  const [expandedSk, setExpandedSk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<{ pk: string; sk: string } | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadList = useCallback(
    (isFirst = true) => {
      if (isFirst) setLoading(true);
      else setFetchingMore(true);
      listAdminContacts({
        search: search || undefined,
        searchField: search ? searchField : undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        is_spam: spamOnly ? true : undefined,
        ...getDateRangeBounds(dateRange),
        limit: CONTACT_PAGE_SIZE,
        startKey: isFirst ? undefined : lastEvaluatedKey,
      })
        .then((res) => {
          setContacts((prev) => (isFirst ? res.results : [...prev, ...res.results]));
          setLastEvaluatedKey(res.lastEvaluatedKey);
          setHasMore(!!res.lastEvaluatedKey);
        })
        .catch(() => toast.error("Failed to load contacts"))
        .finally(() => {
          setLoading(false);
          setFetchingMore(false);
        });
    },
    [search, searchField, categoryFilter, statusFilter, priorityFilter, spamOnly, dateRange, lastEvaluatedKey]
  );

  const loadTrash = useCallback(() => {
    setLoading(true);
    listTrashedContacts()
      .then((res) => setContacts(res.results || []))
      .catch(() => toast.error("Failed to load trash"))
      .finally(() => setLoading(false));
  }, []);

  // Bulk-select, available in both the main list (move-to-trash / delete
  // permanently) and Trash (delete permanently) — cleared whenever the list
  // is reloaded or the view is switched, so a stale selection never survives
  // past the rows it was made against.
  const [selectedSks, setSelectedSks] = useState<Set<string>>(new Set());
  const [bulkTrashing, setBulkTrashing] = useState(false);
  const [showBulkTrashConfirm, setShowBulkTrashConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    setExpandedSk(null);
    setSelectedSks(new Set());
    if (view === "trash") {
      loadTrash();
    } else {
      loadList(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statusFilter, categoryFilter, priorityFilter, spamOnly, dateRange, search, searchField]);

  const toggleSelectOne = (sk: string) => {
    setSelectedSks((prev) => {
      const next = new Set(prev);
      if (next.has(sk)) next.delete(sk);
      else next.add(sk);
      return next;
    });
  };

  const allSelected = contacts.length > 0 && selectedSks.size === contacts.length;
  const toggleSelectAll = () => {
    setSelectedSks(allSelected ? new Set() : new Set(contacts.map((c) => c.sk)));
  };

  const handleBulkMoveToTrash = async () => {
    setBulkTrashing(true);
    try {
      await bulkSoftDeleteContacts(Array.from(selectedSks));
      toast.success(`${selectedSks.size} submission${selectedSks.size === 1 ? "" : "s"} moved to trash`);
      setContacts((prev) => prev.filter((c) => !selectedSks.has(c.sk)));
      setSelectedSks(new Set());
      loadStats();
    } catch {
      toast.error("Failed to move selected submissions to trash");
    } finally {
      setBulkTrashing(false);
      setShowBulkTrashConfirm(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    setBulkDeleting(true);
    try {
      await bulkPermanentlyDeleteContacts(Array.from(selectedSks));
      toast.success(`${selectedSks.size} submission${selectedSks.size === 1 ? "" : "s"} permanently deleted`);
      setContacts((prev) => prev.filter((c) => !selectedSks.has(c.sk)));
      setSelectedSks(new Set());
      loadStats();
    } catch {
      toast.error("Failed to permanently delete selected submissions");
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  // IntersectionObserver fires its callback immediately on `.observe()` if
  // the target is already visible — with no scroll involved at all. On a
  // short page (a small page size, or just few results) the last card is
  // trivially on-screen the moment it renders, which would otherwise cascade
  // through every remaining page instantly. Gating on an actual `scroll`
  // event having fired first makes this genuinely scroll-triggered.
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      hasScrolledRef.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (view === "trash" || loading || fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && hasScrolledRef.current) loadList(false);
      });
      if (node) observer.current.observe(node);
    },
    [view, loading, fetchingMore, hasMore, loadList]
  );

  const refreshOne = (updated: Partial<IContact> & { sk: string }) => {
    setContacts((prev) => prev.map((c) => (c.sk === updated.sk ? { ...c, ...updated } : c)));
    // Status/priority/spam all feed into the stat tiles above — refetch so
    // they don't go stale the moment a card is edited.
    loadStats();
  };

  const removeFromView = (sk: string) => {
    setContacts((prev) => prev.filter((c) => c.sk !== sk));
    loadStats();
  };

  // Client-side hardening only — the real enforcement is server-side. Kept
  // below every hook call so hook order never changes across renders.
  if (adminRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const STAT_TILES = stats
    ? [
        { label: "Total", value: stats.total, icon: FiInbox, tint: "15, 61, 145" },
        { label: "New", value: stats.byStatus.new || 0, icon: FiBell, tint: "107, 114, 128" },
        { label: "In Progress", value: stats.byStatus.in_progress || 0, icon: FiClock, tint: "217, 119, 6" },
        { label: "Resolved", value: stats.byStatus.resolved || 0, icon: FiCheckCircle, tint: "22, 163, 74" },
        { label: "High Priority", value: stats.byPriority.high || 0, icon: FiAlertTriangle, tint: "220, 38, 38" },
        { label: "Spam", value: stats.spam, icon: FiAlertOctagon, tint: "234, 88, 12" },
      ]
    : [];

  return (
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      <div className="container py-4">
        <div
          className="card shadow-sm border-0 mb-4"
          style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl, 16px)" }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-3">
                <div className="acp-header-icon">
                  <FiMail size={22} />
                </div>
                <div>
                  <h2 className="acp-title">Contact Us</h2>
                  <p className="acp-subtitle mt-1">Review, triage, and respond to visitor enquiries</p>
                </div>
              </div>
              <Link to="/admin/dashboard" className="acp-btn-ghost d-flex align-items-center gap-2 text-decoration-none">
                <FiArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {stats && (
          <div className="row g-3 mb-4">
            {STAT_TILES.map((tile) => (
              <div key={tile.label} className="col-6 col-md-4 col-lg-2">
                <div
                  className="acp-stat-tile"
                  style={{ background: `rgba(${tile.tint}, 0.07)`, borderColor: `rgba(${tile.tint}, 0.22)` }}
                >
                  <div className="acp-stat-icon" style={{ background: `rgba(${tile.tint}, 0.14)`, color: `rgb(${tile.tint})` }}>
                    <tile.icon size={17} />
                  </div>
                  <div className="acp-stat-value" style={{ color: `rgb(${tile.tint})` }}>
                    {tile.value}
                  </div>
                  <div className="acp-stat-label">{tile.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="acp-segment">
            <button className={`acp-segment-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
              All Submissions
            </button>
            <button className={`acp-segment-btn ${view === "trash" ? "active" : ""}`} onClick={() => setView("trash")}>
              🗑️ Trash
            </button>
          </div>

          {contacts.length > 0 && (
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="form-check mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="acp-select-all"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                <label className="form-check-label small" htmlFor="acp-select-all" style={{ color: "var(--color-body)" }}>
                  Select All
                </label>
              </div>
              {view === "list" && (
                <button
                  className="acp-btn-ghost"
                  style={{ color: "var(--color-danger)", borderColor: "rgba(220, 38, 38, 0.35)" }}
                  disabled={selectedSks.size === 0 || bulkTrashing}
                  onClick={() => setShowBulkTrashConfirm(true)}
                >
                  🗑️ Move to Trash{selectedSks.size > 0 ? ` (${selectedSks.size})` : ""}
                </button>
              )}
              <button
                className="acp-btn-ghost"
                style={{ color: "var(--color-danger)", borderColor: "rgba(220, 38, 38, 0.35)" }}
                disabled={selectedSks.size === 0 || bulkDeleting}
                onClick={() => setShowBulkDeleteConfirm(true)}
              >
                ⚠️ Delete Permanently{selectedSks.size > 0 ? ` (${selectedSks.size})` : ""}
              </button>
            </div>
          )}
        </div>

        {view === "list" && (
          <>
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  className={`acp-chip ${statusFilter === t.value ? "active" : ""}`}
                  onClick={() => setStatusFilter(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="acp-filter-panel mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-6 col-md-2">
                  <select
                    className="acp-input"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as ContactCategory | "")}
                  >
                    <option value="">All Categories</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <select
                    className="acp-input"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as ContactPriority | "")}
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <select className="acp-input" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                    {DATE_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="acp-spam-only"
                      checked={spamOnly}
                      onChange={(e) => setSpamOnly(e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor="acp-spam-only" style={{ color: "var(--color-body)" }}>
                      Spam only
                    </label>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <select className="acp-input" value={searchField} onChange={(e) => setSearchField(e.target.value as typeof searchField)}>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="message">Message</option>
                    <option value="reference_id">Reference ID</option>
                    <option value="page_url">Page URL</option>
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <div style={{ position: "relative" }}>
                    <FiSearch
                      size={14}
                      style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }}
                    />
                    <input
                      type="text"
                      className="acp-input"
                      style={{ paddingLeft: 32 }}
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="text-center py-4">
            <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
          </div>
        ) : contacts.length === 0 ? (
          <p className="acp-muted-text">{view === "trash" ? "Trash is empty." : "No submissions found for this filter."}</p>
        ) : (
          <div className="acp-grid">
            {contacts.map((c, index) => (
              <div
                key={c.sk}
                style={{ gridColumn: expandedSk === c.sk ? "1 / -1" : undefined }}
                ref={view === "list" && index === contacts.length - 1 ? lastElementRef : null}
              >
                <ContactCard
                  contact={c}
                  isTrash={view === "trash"}
                  isExpanded={expandedSk === c.sk}
                  onToggleExpand={() => setExpandedSk((prev) => (prev === c.sk ? null : c.sk))}
                  onStatusChange={(status) => refreshOne({ sk: c.sk, status })}
                  onPriorityChange={(priority) => refreshOne({ sk: c.sk, priority })}
                  onSpamChange={(is_spam) => refreshOne({ sk: c.sk, is_spam })}
                  onDeleted={() => removeFromView(c.sk)}
                  onRestored={() => removeFromView(c.sk)}
                  isSelected={selectedSks.has(c.sk)}
                  onToggleSelect={() => toggleSelectOne(c.sk)}
                />
              </div>
            ))}
          </div>
        )}
        {fetchingMore && (
          <div className="text-center mt-3">
            <span className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} />
          </div>
        )}
      </div>

      <ConfirmModal
        show={showBulkTrashConfirm}
        title="Move to Trash"
        message={`Move ${selectedSks.size} selected submission${selectedSks.size === 1 ? "" : "s"} to trash? You can restore them later from the Trash tab.`}
        confirmText={bulkTrashing ? "Moving..." : "Move to Trash"}
        confirmButtonClassName="btn btn-danger"
        onConfirm={handleBulkMoveToTrash}
        onCancel={() => setShowBulkTrashConfirm(false)}
      />

      <ConfirmModal
        show={showBulkDeleteConfirm}
        title="Delete Permanently"
        message={`Permanently delete ${selectedSks.size} selected submission${selectedSks.size === 1 ? "" : "s"}? This cannot be undone${view === "list" ? " — they will skip Trash entirely" : " — they will no longer be recoverable from Trash"}.`}
        confirmText={bulkDeleting ? "Deleting..." : "Delete Permanently"}
        confirmButtonClassName="btn btn-danger"
        onConfirm={handleBulkPermanentDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
};

/* ============================ CONTACT CARD ============================ */

interface ContactCardProps {
  contact: IContact;
  isTrash: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: ContactStatus) => void;
  onPriorityChange: (priority: ContactPriority) => void;
  onSpamChange: (isSpam: boolean) => void;
  onDeleted: () => void;
  onRestored: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isTrash,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onPriorityChange,
  onSpamChange,
  onDeleted,
  onRestored,
  isSelected,
  onToggleSelect,
}) => {
  const [notes, setNotes] = useState<IContactNote[]>([]);
  const [replies, setReplies] = useState<IContactReply[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);
  const [deletingPermanently, setDeletingPermanently] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const handleToggleExpand = () => {
    const willExpand = !isExpanded;
    onToggleExpand();
    if (willExpand && notes.length === 0 && replies.length === 0) {
      setLoadingThread(true);
      Promise.all([getContactNotes(contact.sk), getContactReplies(contact.sk)])
        .then(([notesRes, repliesRes]) => {
          setNotes(notesRes.data || []);
          setReplies(repliesRes.data || []);
        })
        .catch(() => toast.error("Failed to load notes/replies"))
        .finally(() => setLoadingThread(false));
    }
  };

  const handleStatusChange = async (status: ContactStatus) => {
    setUpdatingStatus(true);
    try {
      await updateContactStatus(contact.sk, status);
      onStatusChange(status);
      const label = STATUS_TABS.find((t) => t.value === status)?.label || status;
      toast.success(`Status updated to "${label}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: ContactPriority) => {
    setUpdatingPriority(true);
    try {
      await updateContactPriority(contact.sk, priority);
      onPriorityChange(priority);
      toast.success(`Priority updated to "${priority}"`);
    } catch {
      toast.error("Failed to update priority");
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || savingNote) return;
    setSavingNote(true);
    try {
      const res = await addContactNote(contact.sk, noteText.trim());
      setNotes((prev) => [...prev, res.data]);
      setNoteText("");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      const res = await sendContactReply(contact.sk, replyText.trim());
      setReplies((prev) => [...prev, res.data]);
      setReplyText("");
      toast.success(contact.email ? "Reply sent" : "Reply saved (no email on file to send to)");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const toggleSpam = async () => {
    try {
      await setContactSpam(contact.sk, !contact.is_spam);
      onSpamChange(!contact.is_spam);
      toast.success(!contact.is_spam ? "Marked as spam" : "Unmarked as spam");
    } catch {
      toast.error("Failed to update spam flag");
    }
  };

  const handleDelete = async () => {
    try {
      await softDeleteContact(contact.sk);
      toast.success("Moved to trash");
      onDeleted();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreContact(contact.sk);
      toast.success("Restored");
      onRestored();
    } catch {
      toast.error("Failed to restore");
    }
  };

  const handlePermanentDelete = async () => {
    setDeletingPermanently(true);
    try {
      await permanentlyDeleteContact(contact.sk);
      toast.success("Permanently deleted");
      onDeleted();
    } catch {
      toast.error("Failed to permanently delete");
    } finally {
      setDeletingPermanently(false);
      setShowPermanentDeleteConfirm(false);
    }
  };

  return (
    <div className="acp-card">
      <div>
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
          <input
            type="checkbox"
            className="form-check-input flex-shrink-0"
            checked={isSelected}
            onChange={onToggleSelect}
            aria-label={`Select ${contact.name}'s submission`}
          />
          <div className="acp-header-scroll d-flex align-items-center gap-2 flex-nowrap">
            <strong className="acp-name text-nowrap">{contact.name}</strong>
            {contact.email && <span className="acp-muted-text text-nowrap">({contact.email})</span>}
            <span className="acp-badge acp-badge--category">{CATEGORY_LABELS[contact.category] || contact.category}</span>
            {contact.is_spam && <span className="acp-badge acp-badge--spam">Spam</span>}
            <span className={`acp-badge agp-status agp-status--${contact.status}`}>{contact.status.replace(/_/g, " ")}</span>
            <span className={`acp-badge acp-badge--priority-${contact.priority}`}>{contact.priority}</span>
            <span className="acp-muted-text ms-auto text-nowrap">
              {contact.reference_id} · <strong style={{ color: "var(--color-body)" }}>{formatDateTime(contact.created_at)}</strong>
            </span>
          </div>
          <button
            className={`acp-expand-btn ${isExpanded ? "active" : ""}`}
            onClick={handleToggleExpand}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>
        {!isExpanded && (
          <p className="mb-0 small text-truncate mt-2" style={{ color: "var(--color-body)" }}>
            {contact.message}
          </p>
        )}

        {isExpanded && (
          <div className="mt-2 pt-2 border-top" style={{ borderColor: "var(--color-border)" }}>
            <p className="mb-2" style={{ whiteSpace: "pre-wrap", color: "var(--color-body)" }}>
              {contact.message}
            </p>

            <div className="row g-2 small mb-2" style={{ color: "var(--color-body)" }}>
              {contact.page_url && (
                <div className="col-12">
                  <strong>Page URL:</strong>{" "}
                  <a href={contact.page_url} target="_blank" rel="noopener noreferrer">{contact.page_url}</a>
                </div>
              )}
              {contact.broken_link_url && (
                <div className="col-12">
                  <strong>Broken Link:</strong>{" "}
                  <a href={contact.broken_link_url} target="_blank" rel="noopener noreferrer">{contact.broken_link_url}</a>
                </div>
              )}
              {contact.official_source_url && (
                <div className="col-12">
                  <strong>Official Source:</strong>{" "}
                  <a href={contact.official_source_url} target="_blank" rel="noopener noreferrer">{contact.official_source_url}</a>
                </div>
              )}
              {contact.suggested_correction && (
                <div className="col-12">
                  <strong>Suggested Correction/Update:</strong> {contact.suggested_correction}
                </div>
              )}
              {contact.company_name && (
                <div className="col-12">
                  <strong>Company:</strong> {contact.company_name}
                  {contact.company_website && (
                    <>
                      {" · "}
                      <a href={contact.company_website} target="_blank" rel="noopener noreferrer">{contact.company_website}</a>
                    </>
                  )}
                </div>
              )}
            </div>

            {!isTrash && (
              <div className="acp-meta-row mb-2">
                <div className="acp-field">
                  <label className="acp-label">Status</label>
                  <select
                    className="acp-input"
                    value={contact.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as ContactStatus)}
                  >
                    {STATUS_TABS.filter((t) => t.value).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="acp-field">
                  <label className="acp-label">Priority</label>
                  <select
                    className="acp-input"
                    value={contact.priority}
                    disabled={updatingPriority}
                    onChange={(e) => handlePriorityChange(e.target.value as ContactPriority)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <button className="acp-btn-ghost" onClick={toggleSpam}>
                  {contact.is_spam ? "Unmark Spam" : "Mark Spam"}
                </button>
                <button
                  className="acp-btn-ghost"
                  style={{ color: "var(--color-danger)", borderColor: "rgba(220, 38, 38, 0.35)" }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  🗑️ Move to Trash
                </button>
                <button
                  className="acp-btn-ghost"
                  style={{ color: "var(--color-danger)", borderColor: "rgba(220, 38, 38, 0.35)" }}
                  onClick={() => setShowPermanentDeleteConfirm(true)}
                >
                  ⚠️ Delete Permanently
                </button>
              </div>
            )}

            {isTrash && (
              <div className="mb-3">
                <button
                  className="acp-btn-ghost"
                  style={{ color: "var(--color-success, #16a34a)", borderColor: "rgba(22, 163, 74, 0.35)" }}
                  onClick={handleRestore}
                >
                  ↩️ Restore
                </button>
              </div>
            )}

            {loadingThread ? (
              <div className="text-center py-2">
                <span className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} />
              </div>
            ) : (
              <div className="acp-thread-cols">
                <div>
                  <h6 className="acp-label mb-2">Internal Notes</h6>
                  {notes.length === 0 && <p className="acp-muted-text">No internal notes yet.</p>}
                  <div className="d-flex flex-column gap-2">
                    {notes.map((n) => (
                      <div key={n.sk} className="acp-thread-msg" style={{ color: "var(--color-body)" }}>
                        <strong style={{ color: "var(--color-heading)" }}>{n.author_name || "Admin"}:</strong> {n.body}
                      </div>
                    ))}
                  </div>
                  {!isTrash && (
                    <div className="d-flex gap-2 mt-2">
                      <input
                        type="text"
                        className="acp-input"
                        placeholder="Add an internal note (never shown to the submitter)"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                      <button className="acp-btn-ghost" onClick={handleAddNote} disabled={savingNote || !noteText.trim()}>
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h6 className="acp-label mb-2">Replies to Submitter</h6>
                  {replies.length === 0 && <p className="acp-muted-text">No replies sent yet.</p>}
                  <div className="d-flex flex-column gap-2">
                    {replies.map((r) => (
                      <div key={r.sk} className="acp-thread-msg acp-thread-msg--reply" style={{ color: "var(--color-body)" }}>
                        <strong style={{ color: "var(--color-heading)" }}>{r.author_name || "Admin"}:</strong> {r.body}
                      </div>
                    ))}
                  </div>
                  {!isTrash && (
                    <div className="d-flex gap-2 mt-2">
                      <input
                        type="text"
                        className="acp-input"
                        placeholder={contact.email ? "Reply to the submitter's email" : "No email on file — reply is logged only"}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button className="btn btn-sm btn-primary" onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}>
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        show={showDeleteConfirm}
        title="Move to Trash"
        message="Move this submission to trash? You can restore it later from the Trash tab."
        confirmText="Move to Trash"
        confirmButtonClassName="btn btn-danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        show={showPermanentDeleteConfirm}
        title="Delete Permanently"
        message="Permanently delete this submission? This cannot be undone and it will not go to Trash — it (and any internal notes/replies on it) will be gone immediately."
        confirmText={deletingPermanently ? "Deleting..." : "Delete Permanently"}
        confirmButtonClassName="btn btn-danger"
        onConfirm={handlePermanentDelete}
        onCancel={() => setShowPermanentDeleteConfirm(false)}
      />
    </div>
  );
};

export default AdminContactPage;
