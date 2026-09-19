import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./Guidance.css";
import { APP_TIME_ZONE, toIstDateKey, istTimestamp, upperAmPm } from "../../utils/dateTime";

interface GuidanceSlotFormModalProps {
  show: boolean;
  notificationTitle: string;
  /** Epoch ms — slots can't be scheduled on or after this application's deadline. */
  lastDateToApply?: number;
  onConfirm: (data: { start_times: number[]; meet_link: string; notes?: string }) => Promise<void> | void;
  onCancel: () => void;
}

interface DateBlock {
  id: string;
  date: string;
  selectedTimes: string[];
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
    const label = upperAmPm(new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
    options.push({ value, label });
    m += SLOT_STEP_MINUTES;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
  }
  return options;
}

const makeBlockId = () => Math.random().toString(36).slice(2);
const emptyBlock = (): DateBlock => ({ id: makeBlockId(), date: "", selectedTimes: [] });

const GuidanceSlotFormModal: React.FC<GuidanceSlotFormModalProps> = ({
  show,
  notificationTitle,
  lastDateToApply,
  onConfirm,
  onCancel,
}) => {
  const [dateBlocks, setDateBlocks] = useState<DateBlock[]>([emptyBlock()]);
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (show) {
      setDateBlocks([emptyBlock()]);
      setMeetLink("");
      setNotes("");
      setConfirming(false);
    }
  }, [show]);

  if (!show) return null;

  const todayValue = toIstDateKey(Date.now());
  const maxValue = lastDateToApply ? toIstDateKey(lastDateToApply) : undefined;

  const isDateInvalid = (blockDate: string) => {
    const isPastDate = !!blockDate && blockDate < todayValue;
    const isBeyondDeadline = !!blockDate && !!maxValue && blockDate > maxValue;
    return isPastDate || isBeyondDeadline;
  };

  const isTimeUnavailable = (blockDate: string, value: string) => {
    if (!blockDate) return false;
    const timestamp = istTimestamp(blockDate, value);
    if (blockDate === todayValue && timestamp <= Date.now()) return true;
    if (lastDateToApply && timestamp > lastDateToApply) return true;
    return false;
  };

  const handleBlockDateChange = (id: string, value: string) => {
    setDateBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        // Drop any already-selected times that are no longer valid for the new date.
        const selectedTimes = b.selectedTimes.filter((t) => {
          const timestamp = istTimestamp(value, t);
          if (value === todayValue && timestamp <= Date.now()) return false;
          if (lastDateToApply && timestamp > lastDateToApply) return false;
          return true;
        });
        return { ...b, date: value, selectedTimes };
      })
    );
  };

  const toggleBlockTime = (id: string, value: string) => {
    setDateBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              selectedTimes: b.selectedTimes.includes(value)
                ? b.selectedTimes.filter((t) => t !== value)
                : [...b.selectedTimes, value],
            }
          : b
      )
    );
  };

  const addDateBlock = () => setDateBlocks((prev) => [...prev, emptyBlock()]);
  const removeDateBlock = (id: string) =>
    setDateBlocks((prev) => (prev.length === 1 ? prev : prev.filter((b) => b.id !== id)));

  const totalSelectedTimes = dateBlocks.reduce((sum, b) => sum + b.selectedTimes.length, 0);
  const hasInvalidDate = dateBlocks.some((b) => b.date && isDateInvalid(b.date));

  const handleConfirmClick = async () => {
    if (confirming || totalSelectedTimes === 0 || hasInvalidDate || !meetLink.trim()) return;
    const start_times = dateBlocks
      .flatMap((b) => b.selectedTimes.map((t) => istTimestamp(b.date, t)))
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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Guidance Slots</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">Application: <strong>{notificationTitle}</strong></p>

              {dateBlocks.map((block, index) => {
                const blockInvalid = isDateInvalid(block.date);
                const isPastDate = !!block.date && block.date < todayValue;
                const isBeyondDeadline = !!block.date && !!maxValue && block.date > maxValue;
                return (
                  <div key={block.id} className="gsf-date-block">
                    <div className="gsf-date-block-header">
                      <span className="gsf-date-badge">Date {index + 1}</span>
                      {dateBlocks.length > 1 && (
                        <button type="button" className="gsf-remove-btn" onClick={() => removeDateBlock(block.id)}>
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="date"
                      className={`form-control mb-1 ${blockInvalid ? "is-invalid" : ""}`}
                      min={todayValue}
                      max={maxValue}
                      value={block.date}
                      onChange={(e) => handleBlockDateChange(block.id, e.target.value)}
                    />
                    {isPastDate ? (
                      <p className="text-danger small mb-3">Please pick today or a future date.</p>
                    ) : isBeyondDeadline ? (
                      <p className="text-danger small mb-3">
                        This is beyond the application's last date to apply ({new Date(lastDateToApply!).toLocaleDateString("en-IN", { timeZone: APP_TIME_ZONE })}).
                      </p>
                    ) : maxValue ? (
                      <p className="text-muted small mb-3">
                        Must be on or before the last date to apply ({new Date(lastDateToApply!).toLocaleDateString("en-IN", { timeZone: APP_TIME_ZONE })}).
                      </p>
                    ) : (
                      <div className="mb-3" />
                    )}

                    <label className="form-label small fw-semibold">
                      Time slots {block.selectedTimes.length > 0 && `(${block.selectedTimes.length} selected)`}
                    </label>
                    {TIME_WINDOWS.map((window) => (
                      <div key={window.label} className="gsf-time-group">
                        <div className="gsf-time-window-label">{window.label}</div>
                        <div className="gsf-time-grid">
                          {generateTimeOptions(window).map((opt) => {
                            const disabled = !block.date || blockInvalid || isTimeUnavailable(block.date, opt.value);
                            const selected = block.selectedTimes.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                className={`gsf-time-btn ${selected ? "gsf-time-btn--selected" : ""}`}
                                onClick={() => toggleBlockTime(block.id, opt.value)}
                                disabled={disabled}
                                title={disabled && block.date ? "This time is unavailable (already passed, or after the application deadline)" : undefined}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className="gsf-add-date-row">
                <button type="button" className="gsf-add-date-btn" onClick={addDateBlock}>
                  + Add Another Date
                </button>
              </div>

              <div className="gsf-section">
                <div className="gsf-section-heading">Meeting details — applies to every date above</div>

                <label className="form-label small fw-semibold">Google Meet Link</label>
                <input
                  type="url"
                  className="form-control mb-1"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  disabled={totalSelectedTimes === 0}
                />
                {totalSelectedTimes === 0 && (
                  <p className="text-muted small mb-3">Select at least one time slot above to enable this field.</p>
                )}
                {totalSelectedTimes > 0 && <div className="mb-3" />}
                <label className="form-label small fw-semibold">Notes (internal, optional)</label>
                <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <p className="text-muted small mt-2 mb-0">Each guidance session is 15 minutes.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleConfirmClick}
                disabled={confirming || totalSelectedTimes === 0 || hasInvalidDate || !meetLink.trim()}
              >
                {confirming ? "Adding..." : `Add ${totalSelectedTimes || ""} Slot${totalSelectedTimes === 1 ? "" : "s"}`}
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
