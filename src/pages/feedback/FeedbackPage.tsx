import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { submitFeedback } from "../../services/public/feedbackApi";

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await submitFeedback(form);

    if (res.success) {
      toast.success("Thank you! Your feedback has been sent.");

      setTimeout(() => {
        navigate("/");
      }, 1800);
    } else {
      toast.error(res.message || "Failed to submit feedback");
    }

    setLoading(false);
  };

  return (
    <div className="container px-3 px-md-4 py-5" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="ai-glass-panel">
            <div className="p-4 p-md-5">
              <h2
                className="text-center mb-3"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  background: "var(--accent-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Send Feedback
              </h2>
              <p className="text-center text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                We value your feedback. Share your thoughts or suggestions with us to help improve Apply India.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="mb-4">
                  <label className="ai-form-label">Name</label>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder="Your name"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="ai-form-label">Email Address</label>
                  <input
                    type="email"
                    className="ai-input"
                    placeholder="you@example.com"
                    value={form.email}
                    required
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="ai-form-label">Message</label>
                  <textarea
                    className="ai-input"
                    rows={5}
                    placeholder="Write your feedback here..."
                    style={{ resize: "vertical", minHeight: "120px" }}
                    value={form.message}
                    required
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>

                {/* Submit */}
                <div className="mt-5">
                  <button
                    type="submit"
                    className="ai-btn-gradient"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
