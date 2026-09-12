import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface GuidanceSlotFormModalProps {
  show: boolean;
  notificationTitle: string;
  /** Epoch ms — slots can't be scheduled on or after this application's deadline. */
  lastDateToApply?: number;
  onConfirm: (data: { start_times: number[]; meet_link: string; notes?: string }) => Promise<void> | void;
  onCancel: () => void;
}

/** Guidance slots may only be scheduled in these two daily windows. */
const TIME_WINDOWS = [
  { label: "Morning (6:00 AM – 10:00 AM)", startHour: 6, startMinute: 0, endHour: 10, endMinute: 0 },
  { label: "Evening (7:00 PM – 11:00 PM)", startHour: 19, startMinute: 0, endHour: 23, endMinute: 0 },
];

const SLOT_STEP_MINUTES = 15;

function generateTimeOptions(window: (typeof TIME_WINDOWS)[number]): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  let h = window.startHour;
  let m = window.startMinute;
  while (h < window.endHour || (h === window.endHour && m < window.endMinute)) {
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const label = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    options.push({ value, label });
    m += SLOT_STEP_MINUTES;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return options;
}

/** Local YYYY-MM-DD for a given Date (or now), used for the date input's
 * `min`/`max` so out-of-range dates can't be picked. */
function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const GuidanceSlotFormModal: React.FC<GuidanceSlotFormModalProps> = ({
  show,
  notificationTitle,
  lastDateToApply,
  onConfirm,
  onCancel,
}) => {
  const [date, setDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (show) {
      setDate("");
      setSelectedTimes([]);
      setMeetLink("");
      setNotes("");
      setConfirming(false);
    }
  }, [show]);

  if (!show) return null;

  const todayValue = toDateInputValue(new Date());
  const maxValue = lastDateToApply ? toDateInputValue(new Date(lastDateToApply)) : undefined;
  const isPastDate = !!date && date < todayValue;
  const isBeyondDeadline = !!date && !!maxValue && date > maxValue;
  const isToday = date === todayValue;
  const isDateInvalid = isPastDate || isBeyondDeadline;

  const toggleTime = (value: string) => {
    setSelectedTimes((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const isTimeUnavailable = (value: string) => {
    if (!date) return false;
    const timestamp = new Date(`${date}T${value}`).getTime();
    if (isToday && timestamp <= Date.now()) return true;
    if (lastDateToApply && timestamp > lastDateToApply) return true;
    return false;
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    // Drop any already-selected times that are no longer valid for the new date.
    setSelectedTimes((prev) =>
      prev.filter((t) => {
        const timestamp = new Date(`${value}T${t}`).getTime();
        if (value === todayValue && timestamp <= Date.now()) return false;
        if (lastDateToApply && timestamp > lastDateToApply) return false;
        return true;
      })
    );
  };

  const handleConfirmClick = async () => {
    if (confirming || !date || isDateInvalid || selectedTimes.length === 0 || !meetLink.trim()) return;
    const start_times = selectedTimes
      .map((time) => new Date(`${date}T${time}`).getTime())
      .filter((t) => Number.isFinite(t) && t > Date.now() && (!lastDateToApply || t <= lastDateToApply))
      .sort((a, b) => a - b);
    if (start_times.length === 0) return;
    setConfirming(true);
    try {
      await onConfirm({ start_times, meet_link: meetLink.trim(), notes: notes.trim() || undefined });
    } finally {
      setConfirming(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Guidance Slots</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">Application: <strong>{notificationTitle}</strong></p>

              <label className="form-label small fw-semibold">Date</label>
              <input
                type="date"
                className={`form-control mb-1 ${isDateInvalid ? "is-invalid" : ""}`}
                min={todayValue}
                max={maxValue}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              {isPastDate ? (
                <p className="text-danger small mb-3">Please pick today or a future date.</p>
              ) : isBeyondDeadline ? (
                <p className="text-danger small mb-3">
                  This is beyond the application's last date to apply ({new Date(lastDateToApply!).toLocaleDateString("en-IN")}).
                </p>
              ) : maxValue ? (
                <p className="text-muted small mb-3">
                  Must be on or before the last date to apply ({new Date(lastDateToApply!).toLocaleDateString("en-IN")}).
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="form-label small fw-semibold">
                Select one or more time slots {selectedTimes.length > 0 && `(${selectedTimes.length} selected)`}
              </label>
              {TIME_WINDOWS.map((window) => (
                <div key={window.label} className="mb-2">
                  <div className="text-muted small mb-1">{window.label}</div>
                  <div className="d-flex flex-wrap gap-1">
                    {generateTimeOptions(window).map((opt) => {
                      const disabled = !date || isDateInvalid || isTimeUnavailable(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`btn btn-sm ${selectedTimes.includes(opt.value) ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => toggleTime(opt.value)}
                          disabled={disabled}
                          title={disabled && date ? "This time is unavailable (already passed, or after the application deadline)" : undefined}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <label className="form-label small fw-semibold mt-3">Google Meet Link</label>
              <input
                type="url"
                className="form-control mb-1"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                disabled={selectedTimes.length === 0}
              />
              {selectedTimes.length === 0 && (
                <p className="text-muted small mb-3">Select at least one time slot above to enable this field.</p>
              )}
              {selectedTimes.length > 0 && <div className="mb-3" />}
              <label className="form-label small fw-semibold">Notes (internal, optional)</label>
              <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <p className="text-muted small mt-2 mb-0">
                Each guidance session is 15 minutes. All selected times on this date will use the
                same Meet link.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleConfirmClick}
                disabled={confirming || !date || isDateInvalid || selectedTimes.length === 0 || !meetLink.trim()}
              >
                {confirming ? "Adding..." : `Add ${selectedTimes.length || ""} Slot${selectedTimes.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default GuidanceSlotFormModal;
