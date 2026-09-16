import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheckCircle } from "react-icons/fi";
import { submitFeedback } from "../../services/public/feedbackApi";
import { useTranslation } from "../../i18n/useTranslation";

const MESSAGE_MAX_LENGTH = 1000;

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { contactFeedback: t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await submitFeedback(form);

      if (res.success) {
        toast.success(t.thankYou);

        setTimeout(() => {
          navigate("/");
        }, 1800);
      } else {
        toast.error(res.message || t.submitFailed);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      toast.error(message || t.submitFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-feedback-page">
      <div className="ai-feedback-blob ai-feedback-blob--blue" aria-hidden="true" />
      <div className="ai-feedback-blob ai-feedback-blob--orange" aria-hidden="true" />
      <div className="container px-3 px-md-4 py-5">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="ai-glass-panel ai-feedback-card">
              <div className="p-4 p-md-5">
                <div className="ai-feedback-icon" aria-hidden="true">
                  <FiMessageSquare size={26} />
                </div>
                <h2 className="ai-feedback-title">{t.title}</h2>
                <p className="ai-feedback-subtitle">{t.subtitle}</p>

                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-4">
                    <label className="ai-form-label">{t.name}</label>
                    <div className="ai-input-icon-group">
                      <FiUser className="ai-input-icon" aria-hidden="true" />
                      <input
                        type="text"
                        className="ai-input"
                        placeholder={t.namePlaceholder}
                        value={form.name}
                        required
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="ai-form-label">{t.email}</label>
                    <div className="ai-input-icon-group">
                      <FiMail className="ai-input-icon" aria-hidden="true" />
                      <input
                        type="email"
                        className="ai-input"
                        placeholder={t.emailPlaceholder}
                        value={form.email}
                        required
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <div className="ai-feedback-label-row">
                      <label className="ai-form-label mb-0">{t.message}</label>
                      <span className="ai-feedback-char-count">
                        {form.message.length}/{MESSAGE_MAX_LENGTH}
                      </span>
                    </div>
                    <textarea
                      className="ai-input"
                      rows={5}
                      placeholder={t.messagePlaceholder}
                      style={{ resize: "vertical", minHeight: "120px" }}
                      value={form.message}
                      required
                      maxLength={MESSAGE_MAX_LENGTH}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                    />
                  </div>

                  <div className="ai-feedback-trust">
                    <span><FiCheckCircle aria-hidden="true" /> {t.trustLine}</span>
                  </div>

                  {/* Submit */}
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="ai-btn-gradient ai-feedback-submit"
                      disabled={loading}
                    >
                      {loading ? t.sending : (
                        <>
                          <FiSend aria-hidden="true" /> {t.submit}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
