import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { FiVideo, FiCheckCircle } from "react-icons/fi";
import { fetchAvailableSlots, createGuidanceBooking } from "../../services/private/guidanceApi";
import type { IGuidanceSlot, IGuidanceBooking } from "../../interface/GuidanceInterface";
import "./Guidance.css";

interface GuidanceBookingModalProps {
  show: boolean;
  notificationId: string;
  notificationTitle: string;
  onClose: () => void;
  onBooked: () => void;
}

type Step = "list" | "confirm" | "success";

const formatDateHeading = (epoch: number) =>
  new Date(epoch).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });

const formatTimeRange = (start: number, end: number) =>
  `${new Date(start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} – ${new Date(end).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`;

const GuidanceBookingModal: React.FC<GuidanceBookingModalProps> = ({
  show,
  notificationId,
  notificationTitle,
  onClose,
  onBooked,
}) => {
  const [step, setStep] = useState<Step>("list");
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<IGuidanceSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<IGuidanceSlot | null>(null);
  const [issueNote, setIssueNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [bookedResult, setBookedResult] = useState<IGuidanceBooking | null>(null);

  useEffect(() => {
    if (!show) return;
    setStep("list");
    setSelectedDate("");
    setSelectedSlot(null);
    setIssueNote("");
    setConfirming(false);
    setBookedResult(null);
    setLoading(true);
    fetchAvailableSlots(notificationId)
      .then((res) => setSlots(res.data || []))
      .catch(() => {
        toast.error("Failed to load available slots");
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [show, notificationId]);

  const grouped = useMemo(
    () =>
      slots.reduce<Record<string, IGuidanceSlot[]>>((acc, slot) => {
        const key = formatDateHeading(slot.start_time);
        (acc[key] = acc[key] || []).push(slot);
        return acc;
      }, {}),
    [slots]
  );

  if (!show) return null;

  const timesForSelectedDate = selectedDate ? grouped[selectedDate] || [] : [];

  const handleConfirm = async () => {
    if (!selectedSlot || confirming) return;
    setConfirming(true);
    try {
      const res = await createGuidanceBooking({
        notification_id: notificationId,
        slot_sk: selectedSlot.sk,
        issue_note: issueNote.trim() || undefined,
      });
      setBookedResult(res.data);
      setStep("success");
      onBooked();
    } catch (error) {
      const msg: string = error instanceof Error ? error.message : "";
      if (msg.includes("BOOKING_LIMIT_REACHED")) {
        toast.error("You've used all 3 free guidance slots for this application.");
      } else if (msg.includes("ACTIVE_BOOKING_EXISTS")) {
        toast.error("You already have an upcoming guidance session for this application.");
      } else if (msg.includes("SLOT_ALREADY_BOOKED")) {
        toast.error("Someone just booked this slot. Please pick another.");
        setStep("list");
        setSelectedSlot(null);
      } else {
        toast.error("Failed to book this slot. Please try again.");
      }
    } finally {
      setConfirming(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content guidance-modal">
            <div className="modal-header">
              <h5 className="modal-title">
                <FiVideo className="me-2" aria-hidden="true" /> Free Application Guidance
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">Application: <strong>{notificationTitle}</strong></p>

              {step === "list" && (
                <>
                  {loading ? (
                    <div className="text-center py-4">
                      <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      No guidance slots are available right now. Please check back later.
                    </div>
                  ) : (
                    <>
                      <label className="form-label small fw-semibold">Select a Date</label>
                      <select
                        className="form-select mb-3"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlot(null);
                        }}
                      >
                        <option value="">-- Select a date --</option>
                        {Object.entries(grouped).map(([date, daySlots]) => (
                          <option key={date} value={date}>
                            {date} ({daySlots.length} slot{daySlots.length === 1 ? "" : "s"})
                          </option>
                        ))}
                      </select>

                      {selectedDate && (
                        <>
                          <label className="form-label small fw-semibold">Select a Time Slot</label>
                          <select
                            className="form-select"
                            value={selectedSlot?.sk || ""}
                            onChange={(e) => {
                              const slot = timesForSelectedDate.find((s) => s.sk === e.target.value);
                              setSelectedSlot(slot || null);
                            }}
                          >
                            <option value="">-- Select a time --</option>
                            {timesForSelectedDate.map((slot) => (
                              <option key={slot.sk} value={slot.sk}>
                                {formatTimeRange(slot.start_time, slot.end_time)}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {step === "confirm" && selectedSlot && (
                <div>
                  <div className="guidance-confirm-summary">
                    <div><strong>Date:</strong> {formatDateHeading(selectedSlot.start_time)}</div>
                    <div><strong>Time:</strong> {formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}</div>
                    <div><strong>Duration:</strong> 15 minutes</div>
                    <div><strong>Mode:</strong> Google Meet</div>
                    <div><strong>Cost:</strong> <span className="text-success fw-bold">FREE</span></div>
                  </div>
                  <label htmlFor="guidance-issue-note" className="form-label small fw-semibold mt-3">
                    What do you need help with? (optional)
                  </label>
                  <textarea
                    id="guidance-issue-note"
                    className="form-control"
                    rows={3}
                    placeholder="e.g. I am unable to upload my photograph."
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                  />
                </div>
              )}

              {step === "success" && bookedResult && (
                <div className="text-center py-3">
                  <FiCheckCircle size={48} className="text-success mb-3" aria-hidden="true" />
                  <h6>Guidance Slot Booked</h6>
                  <p className="text-muted small mb-0">
                    We've sent you a confirmation email with the meeting link. You can join the
                    session — and find this booking anytime — under "My Guidance Bookings" in your
                    dashboard once it's time.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {step === "list" && (
                <>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  {slots.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={!selectedSlot}
                      onClick={() => setStep("confirm")}
                    >
                      Continue
                    </button>
                  )}
                </>
              )}
              {step === "confirm" && (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep("list")} disabled={confirming}>
                    Back
                  </button>
                  <button type="button" className="btn btn-success" onClick={handleConfirm} disabled={confirming}>
                    {confirming ? "Booking..." : "Confirm Booking"}
                  </button>
                </>
              )}
              {step === "success" && (
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default GuidanceBookingModal;
