import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import { FiClock, FiVideo, FiXCircle, FiMessageSquare } from "react-icons/fi";
import { fetchMyGuidanceBookings, cancelGuidanceBooking } from "../../../services/private/guidanceApi";
import type { IGuidanceBooking } from "../../../interface/GuidanceInterface";
import { GUIDANCE_CANCEL_CUTOFF_MINUTES, MAX_GUIDANCE_BOOKINGS_PER_NOTIFICATION } from "../../../constant/GuidanceConstant";
import { makeSlug } from "../../../utils/utils";
import ConfirmationModal from "../../../components/Generic/ConfirmationModal";
import GuidanceFeedbackModal from "../../../components/Guidance/GuidanceFeedbackModal";
import "./MyGuidanceBookings.css";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "mgb-badge--upcoming" },
  completed: { label: "Completed", className: "mgb-badge--completed" },
  no_show: { label: "No Show", className: "mgb-badge--no-show" },
  cancelled_by_user: { label: "Cancelled", className: "mgb-badge--cancelled" },
  cancelled_by_admin: { label: "Cancelled by Apply India", className: "mgb-badge--cancelled" },
};

const formatDateTime = (start: number, end: number) =>
  `${new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${new Date(start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}–${new Date(end).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;

const isCancellable = (booking: IGuidanceBooking) =>
  booking.status === "upcoming" && booking.slot_start_time - Date.now() > GUIDANCE_CANCEL_CUTOFF_MINUTES * 60 * 1000;

// The meeting link only becomes clickable a little before the session starts,
// and stays open a little after it's scheduled to end (in case it runs over).
const JOIN_WINDOW_BEFORE_MS = 10 * 60 * 1000;
const JOIN_WINDOW_AFTER_MS = 15 * 60 * 1000;

const isJoinable = (booking: IGuidanceBooking, now: number) =>
  now >= booking.slot_start_time - JOIN_WINDOW_BEFORE_MS && now <= booking.slot_end_time + JOIN_WINDOW_AFTER_MS;

const isToday = (epoch: number, now: number) => new Date(epoch).toDateString() === new Date(now).toDateString();

const MyGuidanceBookings: React.FC = () => {
  const [bookings, setBookings] = useState<IGuidanceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<{ pk: string; sk: string } | undefined>();
  const [cancellingSk, setCancellingSk] = useState<string | null>(null);
  const [feedbackBooking, setFeedbackBooking] = useState<IGuidanceBooking | null>(null);
  const [submittedFeedbackFor, setSubmittedFeedbackFor] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Re-check join eligibility periodically so "Join Meeting" enables itself
  // once the session window opens, without requiring a page refresh.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMore = async (isFirst = false) => {
    try {
      const res = await fetchMyGuidanceBookings(PAGE_SIZE, isFirst ? undefined : lastEvaluatedKey);
      setBookings((prev) => (isFirst ? res.results : [...prev, ...res.results]));
      setLastEvaluatedKey(res.lastEvaluatedKey);
      setHasMore(!!res.lastEvaluatedKey);
    } catch {
      toast.error("Failed to load your guidance bookings");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmCancel = async () => {
    if (!cancellingSk) return;
    const sk = cancellingSk;
    setCancellingSk(null);
    try {
      await cancelGuidanceBooking(sk);
      setBookings((prev) => prev.map((b) => (b.sk === sk ? { ...b, status: "cancelled_by_user" } : b)));
      toast.success("Booking cancelled");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("CANCEL_WINDOW_PASSED")) {
        toast.error(`Bookings can only be cancelled up to ${GUIDANCE_CANCEL_CUTOFF_MINUTES} minutes before the session.`);
      } else {
        toast.error("Failed to cancel booking");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <div style={{ fontSize: 40 }}>🆘</div>
        <b>No guidance sessions booked yet.</b>
        <p className="mt-2">
          Stuck while applying? Open a notification and look for "Stuck While Applying?" to book a free session.
        </p>
      </div>
    );
  }

  // Soonest session first — most actionable/urgent bookings surface at the top.
  const sortedBookings = [...bookings].sort((a, b) => a.slot_start_time - b.slot_start_time);

  return (
    <div>
      <InfiniteScroll
        dataLength={bookings.length}
        next={() => loadMore(false)}
        hasMore={hasMore}
        style={{ overflow: "visible" }}
        loader={
          <div className="text-center py-4">
            <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
          </div>
        }
      >
        <div className="row g-3">
          {sortedBookings.map((booking) => {
            const statusMeta = STATUS_LABEL[booking.status] || { label: booking.status, className: "" };
            const detailUrl = `/notification/${makeSlug(booking.notification_title, booking.notification_id)}`;
            const feedbackGiven = submittedFeedbackFor.includes(booking.sk);
            const todaysSlot = booking.status === "upcoming" && isToday(booking.slot_start_time, now);
            return (
              <div key={booking.sk} className="col-12 col-md-6">
                <div className={`mgb-card ${todaysSlot ? "mgb-card--today" : ""}`}>
                  <div className="mgb-card-header">
                    <Link to={detailUrl} className="mgb-title">
                      {booking.notification_title}
                    </Link>
                    <span className={`mgb-badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  </div>
                  <div className="mgb-time">
                    <FiClock aria-hidden="true" /> {formatDateTime(booking.slot_start_time, booking.slot_end_time)}
                    {todaysSlot && <span className="mgb-today-tag">Today</span>}
                  </div>
                  {booking.issue_note && <p className="mgb-issue">"{booking.issue_note}"</p>}

                  <div className="mgb-actions">
                    {booking.status === "upcoming" && (
                      isJoinable(booking, now) ? (
                        <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="mgb-btn mgb-btn--join">
                          <FiVideo aria-hidden="true" /> Join Meeting
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="mgb-btn mgb-btn--join mgb-btn--disabled"
                          disabled
                          title={`Available ${JOIN_WINDOW_BEFORE_MS / 60000} minutes before your session starts`}
                        >
                          <FiVideo aria-hidden="true" /> Join Meeting
                        </button>
                      )
                    )}
                    {isCancellable(booking) && (
                      <button type="button" className="mgb-btn mgb-btn--cancel" onClick={() => setCancellingSk(booking.sk)}>
                        <FiXCircle aria-hidden="true" /> Cancel
                      </button>
                    )}
                    {booking.status === "completed" && !feedbackGiven && (
                      <button type="button" className="mgb-btn mgb-btn--feedback" onClick={() => setFeedbackBooking(booking)}>
                        <FiMessageSquare aria-hidden="true" /> Give Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>

      <p className="text-muted small mt-3 mb-0">
        Up to {MAX_GUIDANCE_BOOKINGS_PER_NOTIFICATION} free guidance sessions per application.
      </p>

      <ConfirmationModal
        show={!!cancellingSk}
        onHide={() => setCancellingSk(null)}
        onConfirm={confirmCancel}
        title="Cancel Guidance Session"
        variant="danger"
        confirmText="Yes, Cancel"
        message={
          <>
            <p>Are you sure you want to cancel this guidance session? This slot will become available for other users.</p>
            <div className="alert alert-warning mb-0 py-2 px-3" style={{ fontSize: "0.85rem" }}>
              <strong>Note:</strong> Cancelling will count as 1 of your {MAX_GUIDANCE_BOOKINGS_PER_NOTIFICATION} free
              sessions for this application.
            </div>
          </>
        }
      />

      <GuidanceFeedbackModal
        show={!!feedbackBooking}
        booking={feedbackBooking}
        onClose={() => setFeedbackBooking(null)}
        onSubmitted={() => {
          if (feedbackBooking) setSubmittedFeedbackFor((prev) => [...prev, feedbackBooking.sk]);
          setFeedbackBooking(null);
        }}
      />
    </div>
  );
};

export default MyGuidanceBookings;
