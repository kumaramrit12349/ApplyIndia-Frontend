import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { FiStar } from "react-icons/fi";
import { submitGuidanceFeedback } from "../../services/private/guidanceApi";
import type { IGuidanceBooking } from "../../interface/GuidanceInterface";
import { GUIDANCE_PROBLEM_SOLVED_OPTIONS, GUIDANCE_TOPIC_TAGS } from "../../constant/GuidanceConstant";
import "./Guidance.css";

interface GuidanceFeedbackModalProps {
  show: boolean;
  booking: IGuidanceBooking | null;
  onClose: () => void;
  onSubmitted: () => void;
}

const GuidanceFeedbackModal: React.FC<GuidanceFeedbackModalProps> = ({ show, booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [problemSolved, setProblemSolved] = useState("yes");
  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [consentPublic, setConsentPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setRating(5);
      setProblemSolved("yes");
      setTopics([]);
      setMessage("");
      setConsentPublic(false);
      setSubmitting(false);
    }
  }, [show]);

  if (!show || !booking) return null;

  const toggleTopic = (value: string) => {
    setTopics((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitGuidanceFeedback(booking.sk, {
        rating,
        problem_solved: problemSolved,
        topic_tags: topics,
        message: message.trim() || undefined,
        consent_public: consentPublic,
      });
      toast.success("Thank you for your feedback!");
      onSubmitted();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("FEEDBACK_ALREADY_SUBMITTED")) {
        toast.info("You've already submitted feedback for this session.");
        onSubmitted();
      } else {
        toast.error("Failed to submit feedback");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content guidance-modal">
            <div className="modal-header">
              <h5 className="modal-title">How Was Your Experience?</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">Application: <strong>{booking.notification_title}</strong></p>

              <label className="form-label small fw-semibold">Rating</label>
              <div className="d-flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-sm p-0 border-0 bg-transparent"
                    onClick={() => setRating(star)}
                    aria-label={`${star} star`}
                  >
                    <FiStar
                      size={26}
                      color={star <= rating ? "#f59e0b" : "#d1d5db"}
                      fill={star <= rating ? "#f59e0b" : "none"}
                    />
                  </button>
                ))}
              </div>

              <label className="form-label small fw-semibold">Was your problem solved?</label>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {GUIDANCE_PROBLEM_SOLVED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`btn btn-sm ${problemSolved === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setProblemSolved(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="form-label small fw-semibold">What did you need help with?</label>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {GUIDANCE_TOPIC_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    className={`btn btn-sm ${topics.includes(tag.value) ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => toggleTopic(tag.value)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              <label htmlFor="guidance-feedback-message" className="form-label small fw-semibold">
                Tell us more (optional)
              </label>
              <textarea
                id="guidance-feedback-message"
                className="form-control mb-3"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="guidance-consent-public"
                  checked={consentPublic}
                  onChange={(e) => setConsentPublic(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="guidance-consent-public">
                  Would you like to allow Apply India to display your feedback publicly?
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default GuidanceFeedbackModal;
