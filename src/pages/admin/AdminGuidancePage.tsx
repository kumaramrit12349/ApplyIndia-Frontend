import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiLifeBuoy,
  FiCalendar,
  FiUsers,
  FiStar,
  FiBarChart2,
  FiPlus,
  FiTrash2,
  FiClock,
  FiVideo,
  FiExternalLink,
  FiCheckCircle,
  FiUserX,
  FiXCircle,
  FiEye,
  FiEyeOff,
  FiAward,
  FiMail,
  FiRepeat,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { fetchNotifications, getNotificationById } from "../../services/private/notificationApi";
import {
  createGuidanceSlot,
  listAdminGuidanceSlots,
  setGuidanceSlotAvailability,
  cancelGuidanceSlot,
  bulkCancelAvailableGuidanceSlots,
  bulkDeleteGuidanceSlots,
  listAdminGuidanceBookings,
  markGuidanceBookingOutcome,
  listGuidanceFeedbackForModeration,
  moderateGuidanceFeedback,
  fetchGuidanceStats,
} from "../../services/private/guidanceAdminApi";
import type { IGuidanceBooking, IGuidanceFeedback, IGuidanceSlot, IGuidanceStats } from "../../interface/GuidanceInterface";
import { getId } from "../../utils/utils";
import GuidanceSlotFormModal from "../../components/Guidance/GuidanceSlotFormModal";
import CancelSlotModal from "../../components/Guidance/CancelSlotModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import "./AdminGuidancePage.css";
import { APP_TIME_ZONE, toIstDateKey, upperAmPm } from "../../utils/dateTime";
import BackToDashboard from "../../components/BackToDashboard/BackToDashboard";

type Tab = "slots" | "bookings" | "feedback" | "overview";

const formatDateTime = (epoch?: number) => (epoch ? upperAmPm(new Date(epoch).toLocaleString("en-IN", { timeZone: APP_TIME_ZONE })) : "—");

const formatTime = (epoch: number) =>
  upperAmPm(new Date(epoch).toLocaleTimeString("en-IN", { timeZone: APP_TIME_ZONE, hour: "numeric", minute: "2-digit" }));

const formatDayHeading = (epoch: number) =>
  new Date(epoch).toLocaleDateString("en-IN", { timeZone: APP_TIME_ZONE, weekday: "long", day: "numeric", month: "long", year: "numeric" });

const statusLabel = (status: string) => status.replace(/_/g, " ");

/** IntersectionObserver fires immediately on .observe() if the target is already visible, with no scroll — gate infinite-scroll loads on a real scroll first. */
function useHasScrolledRef() {
  const ref = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      ref.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return ref;
}

const Spinner: React.FC = () => (
  <div className="text-center py-5">
    <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
  </div>
);

const EmptyState: React.FC<{ icon: IconType; title: string; text?: string }> = ({ icon: Icon, title, text }) => (
  <div className="agp-empty">
    <div className="agp-empty-icon">
      <Icon size={24} />
    </div>
    <div className="fw-semibold" style={{ color: "var(--color-heading)" }}>
      {title}
    </div>
    {text && <div className="agp-muted" style={{ maxWidth: 460 }}>{text}</div>}
  </div>
);

interface AdminGuidancePageProps {
  adminRole?: string;
}

const AdminGuidancePage: React.FC<AdminGuidancePageProps> = ({ adminRole }) => {
  const [tab, setTab] = useState<Tab>("slots");

  // Client-side hardening only — the real enforcement is server-side. A
  // Guidance Partner only manages their own slots/bookings and has no use
  // for the notification-management dashboard or feedback/stats tabs.
  const isGuidancePartner = adminRole === "guidance_partner";
  const isAdmin = adminRole === "admin";

  if (!isAdmin && !isGuidancePartner) {
    return <Navigate to="/dashboard" replace />;
  }

  const visibleTabs: { id: Tab; label: string; icon: IconType }[] = (
    [
      { id: "slots", label: "Slots", icon: FiCalendar },
      { id: "bookings", label: "Bookings", icon: FiUsers },
      { id: "feedback", label: "Feedback", icon: FiStar },
      { id: "overview", label: "Overview", icon: FiBarChart2 },
    ] as { id: Tab; label: string; icon: IconType }[]
  ).filter((t) => (isGuidancePartner ? t.id === "slots" || t.id === "bookings" : true));

  return (
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      <div className="container py-4">
        <div className="agp-panel mb-4" style={{ padding: "20px 24px" }}>
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div className="agp-icon-badge">
                <FiLifeBuoy size={22} />
              </div>
              <div>
                <h2 className="agp-title">Online Application Assistance</h2>
                <p className="agp-subtitle mt-1">Manage free guidance slots, learner bookings and feedback</p>
              </div>
            </div>
            <BackToDashboard to={isAdmin ? "/admin/dashboard" : "/dashboard"} />
          </div>
        </div>

        <div className="mb-4">
          <div className="agp-segment" role="tablist">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={`agp-segment-btn ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "slots" && <SlotsTab />}
        {tab === "bookings" && <BookingsTab />}
        {tab === "feedback" && isAdmin && <FeedbackTab />}
        {tab === "overview" && isAdmin && <OverviewTab />}
      </div>
    </div>
  );
};

/* ============================= SLOTS TAB ============================= */

const SlotsTab: React.FC = () => {
  const [eligibleNotifications, setEligibleNotifications] = useState<{ sk: string; title: string }[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<{ id: string; title: string } | null>(null);
  const [selectedLastDateToApply, setSelectedLastDateToApply] = useState<number | undefined>(undefined);
  const [slots, setSlots] = useState<IGuidanceSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cancellingSlot, setCancellingSlot] = useState<IGuidanceSlot | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedSlotSks, setSelectedSlotSks] = useState<Set<string>>(new Set());
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  // Automatically load every notification that's guidance-available (has a
  // "How to Apply" video linked) and still open (last date to apply not
  // passed) — no typing required, they populate the dropdown on their own.
  useEffect(() => {
    setLoadingNotifications(true);
    fetchNotifications(undefined, undefined, undefined, undefined, undefined, undefined, true, undefined, true)
      .then((res: { notifications?: { sk: string; title: string }[] }) => setEligibleNotifications(res.notifications || []))
      .catch(() => setEligibleNotifications([]))
      .finally(() => setLoadingNotifications(false));
  }, []);

  const loadSlots = useCallback((notificationId: string) => {
    setLoading(true);
    setSelectedSlotSks(new Set());
    listAdminGuidanceSlots({ notificationId, limit: 50 })
      .then((res) => setSlots(res.results || []))
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedNotification) {
      setSelectedLastDateToApply(undefined);
      return;
    }
    loadSlots(selectedNotification.id);
    getNotificationById(selectedNotification.id)
      .then((res: { notification?: { last_date_to_apply?: number | string } }) => {
        const raw = res?.notification?.last_date_to_apply;
        setSelectedLastDateToApply(raw ? Number(raw) : undefined);
      })
      .catch(() => setSelectedLastDateToApply(undefined));
  }, [selectedNotification, loadSlots]);

  const handleAddSlot = async (data: { start_times: number[]; meet_link: string; notes?: string }) => {
    if (!selectedNotification) return;
    try {
      const results = await Promise.allSettled(
        data.start_times.map((start_time) =>
          createGuidanceSlot({ notification_id: selectedNotification.id, start_time, meet_link: data.meet_link, notes: data.notes })
        )
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - succeeded;
      if (succeeded > 0) {
        toast.success(`Added ${succeeded} slot${succeeded === 1 ? "" : "s"}${failed > 0 ? ` (${failed} failed)` : ""}`);
      } else {
        toast.error("Failed to add slots");
      }
      setShowAddModal(false);
      loadSlots(selectedNotification.id);
    } catch {
      toast.error("Failed to add slots");
    }
  };

  const toggleAvailability = async (slot: IGuidanceSlot) => {
    try {
      await setGuidanceSlotAvailability(slot.sk, slot.status !== "available");
      if (selectedNotification) loadSlots(selectedNotification.id);
    } catch {
      toast.error("Failed to update slot");
    }
  };

  const handleCancelSlot = async (reason: string) => {
    if (!cancellingSlot) return;
    try {
      await cancelGuidanceSlot(cancellingSlot.sk, reason);
      toast.success("Slot cancelled");
      setCancellingSlot(null);
      if (selectedNotification) loadSlots(selectedNotification.id);
    } catch {
      toast.error("Failed to cancel slot");
    }
  };

  const availableSlots = slots.filter((s) => s.status === "available");

  const handleBulkDeleteAvailable = async () => {
    if (!selectedNotification || bulkDeleting) return;
    setBulkDeleting(true);
    try {
      const res = await bulkCancelAvailableGuidanceSlots(selectedNotification.id);
      const { cancelledCount, failedCount } = res.data;
      if (cancelledCount > 0) {
        toast.success(`Deleted ${cancelledCount} available slot${cancelledCount === 1 ? "" : "s"}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`);
      } else {
        toast.error("Failed to delete available slots");
      }
      loadSlots(selectedNotification.id);
    } catch {
      toast.error("Failed to delete available slots");
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const toggleSlotSelected = (slotSk: string) => {
    setSelectedSlotSks((prev) => {
      const next = new Set(prev);
      if (next.has(slotSk)) next.delete(slotSk);
      else next.add(slotSk);
      return next;
    });
  };

  const toggleSelectAllAvailable = () => {
    setSelectedSlotSks((prev) =>
      prev.size === availableSlots.length ? new Set() : new Set(availableSlots.map((s) => s.sk))
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedNotification || deletingSelected || selectedSlotSks.size === 0) return;
    setDeletingSelected(true);
    try {
      const res = await bulkDeleteGuidanceSlots(Array.from(selectedSlotSks));
      const { deletedCount, skippedCount } = res.data;
      if (deletedCount > 0) {
        toast.success(`Deleted ${deletedCount} slot${deletedCount === 1 ? "" : "s"}${skippedCount > 0 ? ` (${skippedCount} skipped)` : ""}`);
      } else {
        toast.error("Failed to delete selected slots");
      }
      loadSlots(selectedNotification.id);
    } catch {
      toast.error("Failed to delete selected slots");
    } finally {
      setDeletingSelected(false);
      setShowDeleteSelectedConfirm(false);
    }
  };

  // Slots grouped by (Indian) calendar day, earliest first.
  const slotsByDay = slots
    .slice()
    .sort((a, b) => a.start_time - b.start_time)
    .reduce<{ key: string; epoch: number; items: IGuidanceSlot[] }[]>((groups, slot) => {
      const key = toIstDateKey(slot.start_time);
      const group = groups.find((g) => g.key === key);
      if (group) group.items.push(slot);
      else groups.push({ key, epoch: slot.start_time, items: [slot] });
      return groups;
    }, []);

  const statusCounts = slots.reduce<Record<string, number>>((acc, slot) => {
    acc[slot.status] = (acc[slot.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="agp-panel mb-3">
        <label className="agp-label" htmlFor="agp-application-select">
          Application
        </label>
        <select
          id="agp-application-select"
          className="agp-input"
          disabled={loadingNotifications}
          value={selectedNotification?.id || ""}
          onChange={(e) => {
            const n = eligibleNotifications.find((item) => getId(item.sk) === e.target.value);
            setSelectedNotification(n ? { id: getId(n.sk), title: n.title } : null);
          }}
        >
          <option value="">
            {loadingNotifications
              ? "Loading eligible notifications..."
              : eligibleNotifications.length === 0
                ? "No eligible notifications found"
                : "-- Select a notification --"}
          </option>
          {eligibleNotifications.map((n) => (
            <option key={n.sk} value={getId(n.sk)}>
              {n.title}
            </option>
          ))}
        </select>
      </div>

      {!loadingNotifications && !selectedNotification && (
        <EmptyState
          icon={FiCalendar}
          title="Select an application to manage its slots"
          text={`Only notifications marked "Guidance Available" (with a How-to-Apply video) whose last date to apply hasn't passed appear in the list — mark one from the Admin Dashboard first.`}
        />
      )}

      {selectedNotification && (
        <>
          <div className="agp-panel mb-3">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div style={{ minWidth: 0 }}>
                <div className="agp-label mb-1">Slots for</div>
                <div className="agp-section-title">{selectedNotification.title}</div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <span key={status} className={`badge agp-status agp-status--${status}`}>
                      {count} {statusLabel(status)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <button className="agp-btn" onClick={() => setSelectedNotification(null)}>
                  <FiRepeat size={13} /> Change
                </button>
                {selectedSlotSks.size > 0 && (
                  <button className="agp-btn agp-btn--danger" onClick={() => setShowDeleteSelectedConfirm(true)}>
                    <FiTrash2 size={13} /> Delete Selected ({selectedSlotSks.size})
                  </button>
                )}
                {availableSlots.length > 0 && (
                  <button className="agp-btn agp-btn--danger" onClick={() => setShowBulkDeleteConfirm(true)}>
                    <FiTrash2 size={13} /> Delete All Available ({availableSlots.length})
                  </button>
                )}
                <button className="agp-btn-primary" onClick={() => setShowAddModal(true)}>
                  <FiPlus size={14} /> Add Slot
                </button>
              </div>
            </div>
            {availableSlots.length > 0 && (
              <div className="form-check mt-3 mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agp-select-all-available"
                  checked={selectedSlotSks.size === availableSlots.length}
                  onChange={toggleSelectAllAvailable}
                />
                <label className="form-check-label agp-muted" htmlFor="agp-select-all-available">
                  Select all available slots
                </label>
              </div>
            )}
          </div>

          {loading ? (
            <Spinner />
          ) : slots.length === 0 ? (
            <EmptyState icon={FiClock} title="No slots yet" text="Use “Add Slot” to publish times learners can book for this application." />
          ) : (
            slotsByDay.map((group) => (
              <div key={group.key}>
                <div className="agp-day-heading">
                  <FiCalendar size={15} />
                  {formatDayHeading(group.epoch)}
                  <span className="agp-count-badge">{group.items.length}</span>
                </div>
                <div className="row g-3">
                  {group.items.map((slot) => (
                    <div key={slot.sk} className="col-12 col-md-6 col-lg-4">
                      <div className={`agp-slot-card agp-slot-card--${slot.status}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                          <div className="d-flex align-items-center gap-2">
                            {slot.status === "available" && (
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={selectedSlotSks.has(slot.sk)}
                                onChange={() => toggleSlotSelected(slot.sk)}
                                aria-label="Select this slot"
                              />
                            )}
                            <span className="agp-slot-time">{formatTime(slot.start_time)}</span>
                          </div>
                          <span className={`badge agp-status agp-status--${slot.status}`}>{statusLabel(slot.status)}</span>
                        </div>
                        <a href={slot.meet_link} target="_blank" rel="noopener noreferrer" className="agp-link mb-3" title={slot.meet_link}>
                          <FiVideo size={14} className="flex-shrink-0" />
                          <span>{slot.meet_link}</span>
                          <FiExternalLink size={12} className="flex-shrink-0" />
                        </a>
                        <div className="d-flex gap-2 flex-wrap">
                          {(slot.status === "available" || slot.status === "unavailable") && (
                            <button className="agp-btn agp-btn--warn" onClick={() => toggleAvailability(slot)}>
                              {slot.status === "available" ? "Mark Unavailable" : "Mark Available"}
                            </button>
                          )}
                          {(slot.status === "available" || slot.status === "unavailable" || slot.status === "booked") && (
                            <button className="agp-btn agp-btn--danger" onClick={() => setCancellingSlot(slot)}>
                              <FiXCircle size={13} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <GuidanceSlotFormModal
            show={showAddModal}
            notificationTitle={selectedNotification.title}
            lastDateToApply={selectedLastDateToApply}
            onConfirm={handleAddSlot}
            onCancel={() => setShowAddModal(false)}
          />
          <CancelSlotModal
            show={!!cancellingSlot}
            title="Cancel Guidance Slot"
            message={
              cancellingSlot?.status === "booked"
                ? "This slot is already booked. The user will be notified and this cancellation will not count against their session allowance."
                : "Are you sure you want to cancel this slot?"
            }
            onConfirm={handleCancelSlot}
            onCancel={() => setCancellingSlot(null)}
          />
          <ConfirmModal
            show={showBulkDeleteConfirm}
            title="Delete All Available Slots"
            message={`Permanently delete all ${availableSlots.length} available (unbooked) slot${availableSlots.length === 1 ? "" : "s"} for this application? Booked, completed, and already-cancelled slots won't be affected. This can't be undone.`}
            confirmText="Delete Slots"
            confirmButtonClassName="btn btn-danger"
            onConfirm={handleBulkDeleteAvailable}
            onCancel={() => setShowBulkDeleteConfirm(false)}
          />
          <ConfirmModal
            show={showDeleteSelectedConfirm}
            title="Delete Selected Slots"
            message={`Permanently delete the ${selectedSlotSks.size} selected slot${selectedSlotSks.size === 1 ? "" : "s"}? This can't be undone.`}
            confirmText="Delete Slots"
            confirmButtonClassName="btn btn-danger"
            onConfirm={handleDeleteSelected}
            onCancel={() => setShowDeleteSelectedConfirm(false)}
          />
        </>
      )}
    </div>
  );
};

/* ============================ BOOKINGS TAB ============================ */

const BookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<IGuidanceBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<{ pk: string; sk: string } | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const hasScrolledRef = useHasScrolledRef();

  const load = useCallback((isFirst = true) => {
    if (isFirst) setLoading(true);
    else setFetchingMore(true);
    listAdminGuidanceBookings({ status: statusFilter || undefined, limit: 30, startKey: isFirst ? undefined : lastEvaluatedKey })
      .then((res) => {
        setBookings((prev) => (isFirst ? res.results : [...prev, ...res.results]));
        setLastEvaluatedKey(res.lastEvaluatedKey);
        setHasMore(!!res.lastEvaluatedKey);
      })
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => {
        setLoading(false);
        setFetchingMore(false);
      });
  }, [statusFilter, lastEvaluatedKey]);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && hasScrolledRef.current) load(false);
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore, load, hasScrolledRef]
  );

  const handleOutcome = async (bookingSk: string, outcome: "completed" | "no_show") => {
    try {
      await markGuidanceBookingOutcome(bookingSk, outcome);
      setBookings((prev) => prev.map((b) => (b.sk === bookingSk ? { ...b, status: outcome } : b)));
      toast.success("Booking updated");
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const [cancellingBooking, setCancellingBooking] = useState<IGuidanceBooking | null>(null);

  const handleCancelBooking = async (reason: string) => {
    if (!cancellingBooking) return;
    try {
      await cancelGuidanceSlot(cancellingBooking.slot_sk, reason);
      setBookings((prev) =>
        prev.map((b) => (b.sk === cancellingBooking.sk ? { ...b, status: "cancelled_by_admin", cancel_reason: reason } : b))
      );
      toast.success("Booking cancelled — the user has been emailed to reschedule");
      setCancellingBooking(null);
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const bookingFilters = [
    { value: "", label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "no_show", label: "No Show" },
    { value: "cancelled_by_user", label: "Cancelled by User" },
    { value: "cancelled_by_admin", label: "Cancelled by Admin" },
  ];

  return (
    <div>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {bookingFilters.map((f) => (
          <button key={f.value} className={`agp-chip ${statusFilter === f.value ? "active" : ""}`} onClick={() => setStatusFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState icon={FiUsers} title="No bookings found" text="Bookings appear here once learners reserve a slot." />
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking, index) => (
            <div key={booking.sk} ref={index === bookings.length - 1 ? lastElementRef : null}>
              <div className={`agp-card agp-card--${booking.status}`}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div style={{ minWidth: 0 }}>
                    <div className="agp-name">{booking.user_name || booking.user_email}</div>
                    {booking.user_name && (
                      <div className="agp-meta mt-1">
                        <FiMail size={13} /> {booking.user_email}
                      </div>
                    )}
                    <div className="agp-meta mt-1">
                      <FiLifeBuoy size={13} /> {booking.notification_title}
                    </div>
                    <div className="agp-meta mt-1" style={{ fontWeight: 600 }}>
                      <FiClock size={13} /> {formatDateTime(booking.slot_start_time)}
                    </div>
                    {booking.issue_note && <div className="agp-quote">“{booking.issue_note}”</div>}
                    {booking.cancel_reason && booking.status.startsWith("cancelled") && (
                      <div className="agp-meta mt-2" style={{ color: "var(--color-danger, #dc2626)" }}>
                        Reason: {booking.cancel_reason}
                      </div>
                    )}
                  </div>
                  <div className="d-flex flex-column align-items-md-end gap-2">
                    <span className={`badge agp-status agp-status--${booking.status}`}>{statusLabel(booking.status)}</span>
                    {booking.status === "upcoming" && (
                      <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                        <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="agp-btn agp-btn--info">
                          <FiVideo size={13} /> Join Meeting
                        </a>
                        <button className="agp-btn agp-btn--success" onClick={() => handleOutcome(booking.sk, "completed")}>
                          <FiCheckCircle size={13} /> Mark Completed
                        </button>
                        <button className="agp-btn agp-btn--warn" onClick={() => handleOutcome(booking.sk, "no_show")}>
                          <FiUserX size={13} /> No Show
                        </button>
                        <button className="agp-btn agp-btn--danger" onClick={() => setCancellingBooking(booking)}>
                          <FiXCircle size={13} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {fetchingMore && (
        <div className="text-center mt-3">
          <span className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} />
        </div>
      )}

      <CancelSlotModal
        show={!!cancellingBooking}
        title="Cancel Guidance Booking"
        message={
          cancellingBooking
            ? `Cancel ${cancellingBooking.user_name || cancellingBooking.user_email}'s session for "${cancellingBooking.notification_title}"? The user will be emailed to reschedule, and this will NOT count against their 3-session allowance.`
            : undefined
        }
        onConfirm={handleCancelBooking}
        onCancel={() => setCancellingBooking(null)}
      />
    </div>
  );
};

/* ============================ FEEDBACK TAB ============================ */

const FeedbackTab: React.FC = () => {
  const [feedback, setFeedback] = useState<IGuidanceFeedback[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<{ pk: string; sk: string } | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const hasScrolledRef = useHasScrolledRef();

  const load = useCallback((isFirst = true) => {
    if (isFirst) setLoading(true);
    else setFetchingMore(true);
    listGuidanceFeedbackForModeration({ status: statusFilter || undefined, limit: 30, startKey: isFirst ? undefined : lastEvaluatedKey })
      .then((res) => {
        setFeedback((prev) => (isFirst ? res.results : [...prev, ...res.results]));
        setLastEvaluatedKey(res.lastEvaluatedKey);
        setHasMore(!!res.lastEvaluatedKey);
      })
      .catch(() => toast.error("Failed to load feedback"))
      .finally(() => {
        setLoading(false);
        setFetchingMore(false);
      });
  }, [statusFilter, lastEvaluatedKey]);

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && hasScrolledRef.current) load(false);
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore, load, hasScrolledRef]
  );

  const handleModerate = async (feedbackSk: string, action: "publish" | "hide" | "feature" | "unfeature") => {
    try {
      const res = await moderateGuidanceFeedback(feedbackSk, action);
      setFeedback((prev) => {
        // Publish/Hide move an item out of whatever status the current
        // filter is showing — once it no longer matches, drop it from this
        // list instead of leaving a stale "Pending" card showing "Published".
        if (statusFilter && res.data.moderation_status !== statusFilter) {
          return prev.filter((f) => f.sk !== feedbackSk);
        }
        return prev.map((f) => (f.sk === feedbackSk ? res.data : f));
      });
      toast.success("Feedback updated");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("CONSENT_NOT_GIVEN")) {
        toast.error("This user did not consent to public display — cannot publish.");
      } else {
        toast.error("Failed to update feedback");
      }
    }
  };

  const feedbackFilters = [
    { value: "pending", label: "Pending" },
    { value: "published", label: "Published" },
    { value: "hidden", label: "Hidden" },
    { value: "", label: "All" },
  ];

  return (
    <div>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {feedbackFilters.map((f) => (
          <button key={f.value} className={`agp-chip ${statusFilter === f.value ? "active" : ""}`} onClick={() => setStatusFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : feedback.length === 0 ? (
        <EmptyState icon={FiStar} title="No feedback found" text="Nothing matches this filter yet." />
      ) : (
        <div className="d-flex flex-column gap-3">
          {feedback.map((item, index) => (
            <div key={item.sk} ref={index === feedback.length - 1 ? lastElementRef : null}>
              <div className={`agp-card agp-card--${item.moderation_status}`}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div style={{ minWidth: 0, flex: "1 1 320px" }}>
                    <div className="agp-stars mb-2" aria-label={`${item.rating} out of 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <FiStar key={i} size={16} fill={i < item.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {item.message && <div className="agp-quote mt-0 mb-2">“{item.message}”</div>}
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span className="agp-pill agp-pill--muted">Problem solved: {item.problem_solved}</span>
                      <span className="agp-pill agp-pill--muted">Consent to publish: {item.consent_public ? "Yes" : "No"}</span>
                      {item.topic_tags?.map((tag) => (
                        <span key={tag} className="agp-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-md-end gap-2">
                    <div className="d-flex gap-2 flex-wrap">
                      <span className={`badge agp-status agp-status--${item.moderation_status}`}>{item.moderation_status}</span>
                      {item.featured && (
                        <span className="agp-pill agp-pill--star">
                          <FiAward size={12} className="me-1" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                      <button
                        className="agp-btn agp-btn--success"
                        disabled={!item.consent_public || item.moderation_status === "published"}
                        title={!item.consent_public ? "User did not consent to public display" : undefined}
                        onClick={() => handleModerate(item.sk, "publish")}
                      >
                        <FiEye size={13} /> Publish
                      </button>
                      <button className="agp-btn" onClick={() => handleModerate(item.sk, "hide")}>
                        <FiEyeOff size={13} /> Hide
                      </button>
                      <button
                        className="agp-btn agp-btn--warn"
                        onClick={() => handleModerate(item.sk, item.featured ? "unfeature" : "feature")}
                      >
                        <FiAward size={13} /> {item.featured ? "Unfeature" : "Feature"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
  );
};

/* ============================ OVERVIEW TAB ============================ */

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<IGuidanceStats | null>(null);

  useEffect(() => {
    fetchGuidanceStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load stats"));
  }, []);

  if (!stats) return <Spinner />;

  const tiles: { label: string; value: string | number; icon: IconType; tint: string }[] = [
    { label: "Total Slots", value: stats.totalSlots, icon: FiCalendar, tint: "15, 61, 145" },
    { label: "Upcoming Bookings", value: stats.upcomingBookings, icon: FiClock, tint: "37, 99, 235" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: FiCheckCircle, tint: "22, 163, 74" },
    { label: "No-Show Rate", value: `${stats.noShowRate}%`, icon: FiUserX, tint: "217, 119, 6" },
    { label: "Published Feedback", value: stats.publishedFeedback, icon: FiStar, tint: "124, 58, 237" },
  ];

  return (
    <div className="row g-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="col-6 col-md-4 col-lg">
          <div className="agp-stat-tile" style={{ background: `rgba(${tile.tint}, 0.07)`, borderColor: `rgba(${tile.tint}, 0.22)` }}>
            <div className="agp-stat-icon" style={{ background: `rgba(${tile.tint}, 0.14)`, color: `rgb(${tile.tint})` }}>
              <tile.icon size={18} />
            </div>
            <div className="agp-stat-value" style={{ color: `rgb(${tile.tint})` }}>
              {tile.value}
            </div>
            <div className="agp-stat-label">{tile.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminGuidancePage;
