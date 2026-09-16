import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { FiVideo, FiCheckCircle, FiCalendar, FiClock } from "react-icons/fi";
import { fetchAvailableSlots, createGuidanceBooking } from "../../services/private/guidanceApi";
import type { IGuidanceSlot, IGuidanceBooking } from "../../interface/GuidanceInterface";
import { useTranslation } from "../../i18n/useTranslation";
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
  const { guidanceModal: t } = useTranslation();

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
        toast.error(t.failedToLoadSlots);
        setSlots([]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast.error(t.bookingLimitReached);
      } else if (msg.includes("ACTIVE_BOOKING_EXISTS")) {
        toast.error(t.activeBookingExists);
      } else if (msg.includes("SLOT_ALREADY_BOOKED")) {
        toast.error(t.slotAlreadyBooked);
        setStep("list");
        setSelectedSlot(null);
      } else {
        toast.error(t.bookingFailed);
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
                <span className="guidance-modal-icon">
                  <FiVideo aria-hidden="true" />
                </span>
                {t.title}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="guidance-modal-app-tag">
                <span>{t.application}</span>
                <strong>{notificationTitle}</strong>
              </div>

              {step === "list" && (
                <>
                  {loading ? (
                    <div className="guidance-loading-state">
                      <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
                      <div>{t.loadingSlots}</div>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="guidance-empty-state">
                      <div className="guidance-empty-state-icon">
                        <FiCalendar aria-hidden="true" />
                      </div>
                      <h6>{t.noSlotsTitle}</h6>
                      <p>{t.noSlotsDesc}</p>
                    </div>
                  ) : (
                    <>
                      <label className="guidance-field-label">
                        <FiCalendar aria-hidden="true" /> {t.selectDate}
                      </label>
                      <select
                        className="form-select mb-3"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlot(null);
                        }}
                      >
                        <option value="">{t.selectDatePlaceholder}</option>
                        {Object.entries(grouped).map(([date, daySlots]) => (
                          <option key={date} value={date}>
                            {date} ({t.slotCount(daySlots.length)})
                          </option>
                        ))}
                      </select>

                      {selectedDate && (
                        <>
                          <label className="guidance-field-label">
                            <FiClock aria-hidden="true" /> {t.selectTime}
                          </label>
                          <select
                            className="form-select"
                            value={selectedSlot?.sk || ""}
                            onChange={(e) => {
                              const slot = timesForSelectedDate.find((s) => s.sk === e.target.value);
                              setSelectedSlot(slot || null);
                            }}
                          >
                            <option value="">{t.selectTimePlaceholder}</option>
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
                    <div className="guidance-confirm-row">
                      <span className="guidance-confirm-row-icon">
                        <FiCalendar aria-hidden="true" />
                      </span>
                      <div className="guidance-confirm-row-text">
                        <div className="guidance-confirm-row-label">{t.confirmDate}</div>
                        <div className="guidance-confirm-row-value">{formatDateHeading(selectedSlot.start_time)}</div>
                      </div>
                    </div>
                    <div className="guidance-confirm-row">
                      <span className="guidance-confirm-row-icon">
                        <FiClock aria-hidden="true" />
                      </span>
                      <div className="guidance-confirm-row-text">
                        <div className="guidance-confirm-row-label">{t.confirmTimeLabel}</div>
                        <div className="guidance-confirm-row-value">
                          {formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)}
                        </div>
                      </div>
                    </div>
                    <div className="guidance-confirm-row">
                      <span className="guidance-confirm-row-icon">
                        <FiVideo aria-hidden="true" />
                      </span>
                      <div className="guidance-confirm-row-text">
                        <div className="guidance-confirm-row-label">{t.confirmMode}</div>
                        <div className="guidance-confirm-row-value">{t.googleMeet}</div>
                      </div>
                    </div>
                  </div>
                  <div className="guidance-free-badge-row">
                    <span className="guidance-free-badge">
                      <FiCheckCircle aria-hidden="true" /> {t.free}
                    </span>
                  </div>
                  <label htmlFor="guidance-issue-note" className="guidance-field-label mt-3">
                    {t.issueNoteLabel}
                  </label>
                  <textarea
                    id="guidance-issue-note"
                    className="form-control"
                    rows={3}
                    placeholder={t.issueNotePlaceholder}
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                  />
                </div>
              )}

              {step === "success" && bookedResult && (
                <div className="text-center py-2">
                  <div className="guidance-success-icon">
                    <FiCheckCircle size={34} aria-hidden="true" />
                  </div>
                  <div className="guidance-success-title">{t.successTitle}</div>
                  <p className="text-muted small mb-0">{t.successDesc}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {step === "list" && (
                <>
                  <button type="button" className="guidance-btn-ghost" onClick={onClose}>
                    {t.close}
                  </button>
                  {slots.length > 0 && (
                    <button
                      type="button"
                      className="guidance-btn-primary"
                      disabled={!selectedSlot}
                      onClick={() => setStep("confirm")}
                    >
                      {t.continueBtn}
                    </button>
                  )}
                </>
              )}
              {step === "confirm" && (
                <>
                  <button type="button" className="guidance-btn-ghost" onClick={() => setStep("list")} disabled={confirming}>
                    {t.back}
                  </button>
                  <button type="button" className="guidance-btn-primary" onClick={handleConfirm} disabled={confirming}>
                    {confirming ? t.booking : t.confirmBooking}
                  </button>
                </>
              )}
              {step === "success" && (
                <button type="button" className="guidance-btn-primary" onClick={onClose}>
                  {t.done}
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
