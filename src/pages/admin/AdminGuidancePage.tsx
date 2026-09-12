import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchNotifications, getNotificationById } from "../../services/private/notificationApi";
import {
  createGuidanceSlot,
  listAdminGuidanceSlots,
  setGuidanceSlotAvailability,
  cancelGuidanceSlot,
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
import "./AdminGuidancePage.css";

type Tab = "slots" | "bookings" | "feedback" | "overview";

const formatDateTime = (epoch?: number) => (epoch ? new Date(epoch).toLocaleString("en-IN") : "—");

const AdminGuidancePage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("slots");

  return (
    <div className="min-vh-100" style={{ background: "var(--color-bg)" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="mb-0 fw-bold">🎓 Online Application Assistance</h2>
          <Link to="/admin/dashboard" className="btn btn-outline-secondary btn-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {(["slots", "bookings", "feedback", "overview"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "slots" && <SlotsTab />}
        {tab === "bookings" && <BookingsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "overview" && <OverviewTab />}
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

  return (
    <div>
      <div className="mb-3">
        <label className="form-label small fw-semibold">Application</label>
        <select
          className="form-select"
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
        <div className="text-center text-muted py-5">
          <div style={{ fontSize: 32 }}>🎓</div>
          <p className="mb-1">
            Select a notification above to view or add its guidance slots.
          </p>
          <p className="small mb-0">
            Only notifications marked "Guidance Available" (with a How-to-Apply video) whose
            last date to apply hasn't passed appear in this list — mark one from the Admin
            Dashboard first.
          </p>
        </div>
      )}

      {selectedNotification && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">
              Slots for: <span className="text-primary">{selectedNotification.title}</span>{" "}
              <button className="btn btn-sm btn-link" onClick={() => setSelectedNotification(null)}>
                (change)
              </button>
            </h5>
            <button className="btn btn-success btn-sm" onClick={() => setShowAddModal(true)}>
              + Add Slot
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-muted">No slots created yet for this application.</p>
          ) : (
            <div className="row g-2">
              {slots.map((slot) => (
                <div key={slot.sk} className="col-12 col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong>{formatDateTime(slot.start_time)}</strong>
                        <span className={`badge agp-status agp-status--${slot.status}`}>{slot.status}</span>
                      </div>
                      <a href={slot.meet_link} target="_blank" rel="noopener noreferrer" className="d-block small mb-2 text-truncate">
                        {slot.meet_link}
                      </a>
                      <div className="d-flex gap-2 flex-wrap">
                        {(slot.status === "available" || slot.status === "unavailable") && (
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleAvailability(slot)}>
                            {slot.status === "available" ? "Mark Unavailable" : "Mark Available"}
                          </button>
                        )}
                        {(slot.status === "available" || slot.status === "unavailable" || slot.status === "booked") && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setCancellingSlot(slot)}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        if (entries[0].isIntersecting && hasMore) load(false);
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore, load]
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

  return (
    <div>
      <select className="form-select w-auto mb-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
        <option value="no_show">No Show</option>
        <option value="cancelled_by_user">Cancelled by User</option>
        <option value="cancelled_by_admin">Cancelled by Admin</option>
      </select>

      {loading ? (
        <div className="text-center py-4">
          <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-muted">No bookings found.</p>
      ) : (
        <div className="row g-2">
          {bookings.map((booking, index) => (
            <div
              key={booking.sk}
              className="col-12"
              ref={index === bookings.length - 1 ? lastElementRef : null}
            >
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <strong>{booking.user_name || booking.user_email}</strong>
                      <div className="small text-muted">{booking.notification_title}</div>
                      <div className="small">{formatDateTime(booking.slot_start_time)}</div>
                      {booking.issue_note && <div className="small fst-italic mt-1">"{booking.issue_note}"</div>}
                    </div>
                    <div className="text-end">
                      <span className={`badge agp-status agp-status--${booking.status} mb-2 d-inline-block`}>{booking.status}</span>
                      {booking.status === "upcoming" && (
                        <div className="d-flex gap-2 flex-wrap justify-content-end">
                          <a
                            href={booking.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            Join Meeting
                          </a>
                          <button className="btn btn-sm btn-success" onClick={() => handleOutcome(booking.sk, "completed")}>
                            Mark Completed
                          </button>
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleOutcome(booking.sk, "no_show")}>
                            No Show
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setCancellingBooking(booking)}>
                            Cancel
                          </button>
                        </div>
                      )}
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
        if (entries[0].isIntersecting && hasMore) load(false);
      });
      if (node) observer.current.observe(node);
    },
    [loading, fetchingMore, hasMore, load]
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

  return (
    <div>
      <select className="form-select w-auto mb-3" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="published">Published</option>
        <option value="hidden">Hidden</option>
        <option value="">All</option>
      </select>

      {loading ? (
        <div className="text-center py-4">
          <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : feedback.length === 0 ? (
        <p className="text-muted">No feedback found for this filter.</p>
      ) : (
        <div className="row g-2">
          {feedback.map((item, index) => (
            <div key={item.sk} className="col-12" ref={index === feedback.length - 1 ? lastElementRef : null}>
              <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <div>{"⭐".repeat(item.rating)}</div>
                      <div className="small text-muted mb-1">
                        Problem solved: <strong>{item.problem_solved}</strong> · Consent to publish:{" "}
                        <strong>{item.consent_public ? "Yes" : "No"}</strong>
                      </div>
                      {item.message && <p className="mb-1">{item.message}</p>}
                      <div className="d-flex flex-wrap gap-1">
                        {item.topic_tags?.map((tag) => (
                          <span key={tag} className="badge bg-light text-dark border">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <span className={`badge agp-status agp-status--${item.moderation_status}`}>{item.moderation_status}</span>
                      {item.featured && <span className="badge bg-warning text-dark">Featured</span>}
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-success"
                          disabled={!item.consent_public || item.moderation_status === "published"}
                          title={!item.consent_public ? "User did not consent to public display" : undefined}
                          onClick={() => handleModerate(item.sk, "publish")}
                        >
                          Publish
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleModerate(item.sk, "hide")}>
                          Hide
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleModerate(item.sk, item.featured ? "unfeature" : "feature")}
                        >
                          {item.featured ? "Unfeature" : "Feature"}
                        </button>
                      </div>
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

  if (!stats) {
    return (
      <div className="text-center py-4">
        <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  const tiles = [
    { label: "Total Slots", value: stats.totalSlots },
    { label: "Upcoming Bookings", value: stats.upcomingBookings },
    { label: "Completed Sessions", value: stats.completedSessions },
    { label: "No-Show Rate", value: `${stats.noShowRate}%` },
    { label: "Published Feedback", value: stats.publishedFeedback },
  ];

  return (
    <div className="row g-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-3 fw-bold text-primary">{tile.value}</div>
            <div className="small text-muted">{tile.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminGuidancePage;
