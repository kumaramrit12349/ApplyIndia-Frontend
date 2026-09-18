import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheckCircle } from "react-icons/fi";
import { submitContact } from "../services/public/contactApi";
import type { ContactCategory } from "../interface/ContactInterface";
import ContactSuccessModal from "./ContactSuccessModal";

const MESSAGE_MAX_LENGTH = 1000;

const CATEGORIES: { value: ContactCategory; label: string }[] = [
  { value: "report_error", label: "Report an Error" },
  { value: "suggest_update", label: "Suggest an Update" },
  { value: "report_broken_link", label: "Report a Broken Link" },
  { value: "general_query", label: "General Query" },
  { value: "business_enquiry", label: "Business Enquiry" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
];

export interface ContactUsFormProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  userEmail?: string;
}

const ContactUsForm: React.FC<ContactUsFormProps> = ({ isAuthenticated, givenName, familyName, userEmail }) => {
  const navigate = useNavigate();
  const accountName = [givenName, familyName].filter(Boolean).join(" ");

  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<ContactCategory>("general_query");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [officialSourceUrl, setOfficialSourceUrl] = useState("");
  const [suggestedCorrection, setSuggestedCorrection] = useState("");
  const [brokenLinkUrl, setBrokenLinkUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  // Honeypot — a real visitor never sees or fills this field.
  const [website, setWebsite] = useState("");

  const resetForm = () => {
    setCategory("general_query");
    setName("");
    setEmail("");
    setMessage("");
    setPageUrl("");
    setOfficialSourceUrl("");
    setSuggestedCorrection("");
    setBrokenLinkUrl("");
    setCompanyName("");
    setCompanyWebsite("");
    setWebsite("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitContact({
        category,
        name: isAuthenticated ? undefined : name,
        email: isAuthenticated ? undefined : email || undefined,
        message,
        page_url: pageUrl || undefined,
        official_source_url: officialSourceUrl || undefined,
        suggested_correction: suggestedCorrection || undefined,
        broken_link_url: brokenLinkUrl || undefined,
        company_name: companyName || undefined,
        company_website: companyWebsite || undefined,
        website,
      });
      if (res.success && res.data) {
        setReferenceId(res.data.reference_id);
        // The form clears immediately and the confirmation shows as a popup
        // on top of it — so the page is always sitting on a fresh, usable
        // form underneath, never stuck on a stale "submitted" view.
        resetForm();
        setShowSuccess(true);
      } else {
        toast.error(res.error || "Failed to submit your request");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : undefined;
      toast.error(msg || "Failed to submit your request");
    } finally {
      setLoading(false);
    }
  };

  // history.state.idx is set by react-router's underlying history package on
  // every entry it pushes — 0 means this is the first entry in the current
  // tab's session (e.g. a direct link/bookmark/typed URL to /contact-us, or
  // a fresh reload), so there's nowhere in-app to go back to. Anything
  // higher means the visitor actually navigated here from elsewhere in the
  // app, and browser back will land them back on that page correctly.
  const handleDone = () => {
    setShowSuccess(false);
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <ContactSuccessModal show={showSuccess} referenceId={referenceId} onClose={handleDone} />
      <div className="ai-feedback-icon" aria-hidden="true">
        <FiMessageSquare size={26} />
      </div>
      <h2 className="ai-feedback-title">Contact Us</h2>
      <p className="ai-feedback-subtitle">Have a question, found an error, or want to suggest an update? Let us know below.</p>

      <form onSubmit={handleSubmit}>
        {/* Category */}
        <div className="mb-4">
          <label className="ai-form-label">
            What can we help with?<span className="ai-required-star">*</span>
          </label>
          <select className="ai-input" value={category} onChange={(e) => setCategory(e.target.value as ContactCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Name / Email — auto-filled and locked when logged in */}
        <div className="mb-4">
          <label className="ai-form-label">Name{!isAuthenticated && <span className="ai-required-star">*</span>}</label>
          <div className="ai-input-icon-group">
            <FiUser className="ai-input-icon" aria-hidden="true" />
            <input
              type="text"
              className="ai-input"
              placeholder="Your name"
              value={isAuthenticated ? accountName : name}
              required={!isAuthenticated}
              readOnly={isAuthenticated}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="ai-form-label">
            Email Address
            {isAuthenticated && <span className="small" style={{ color: "var(--color-muted)" }}> (you'll get a confirmation email)</span>}
          </label>
          <div className="ai-input-icon-group">
            <FiMail className="ai-input-icon" aria-hidden="true" />
            <input
              type="email"
              className="ai-input"
              placeholder={isAuthenticated ? undefined : "you@example.com (optional)"}
              value={isAuthenticated ? userEmail || "" : email}
              readOnly={isAuthenticated}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {!isAuthenticated && (
            <p className="small mt-1 mb-0" style={{ color: "var(--color-muted)" }}>
              Optional — we'll only email you a confirmation if you provide one.
            </p>
          )}
        </div>

        {/* Category-specific fields */}
        {(category === "report_error" || category === "suggest_update" || category === "report_broken_link") && (
          <div className="mb-4">
            <label className="ai-form-label">Page URL</label>
            <input
              type="url"
              className="ai-input"
              placeholder="https://applyindia.online/..."
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
            />
          </div>
        )}

        {category === "report_broken_link" && (
          <div className="mb-4">
            <label className="ai-form-label">
              Broken Link<span className="ai-required-star">*</span>
            </label>
            <input
              type="url"
              className="ai-input"
              placeholder="The link that isn't working"
              required
              value={brokenLinkUrl}
              onChange={(e) => setBrokenLinkUrl(e.target.value)}
            />
          </div>
        )}

        {category === "business_enquiry" && (
          <>
            <div className="mb-4">
              <label className="ai-form-label">
                Company / Organization<span className="ai-required-star">*</span>
              </label>
              <input
                type="text"
                className="ai-input"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="ai-form-label">Website</label>
              <input
                type="url"
                className="ai-input"
                placeholder="https:// (optional)"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Message */}
        <div className="mb-4">
          <div className="ai-feedback-label-row">
            <label className="ai-form-label mb-0">
              {category === "report_error" ? "What's incorrect?" : "Message"}
              <span className="ai-required-star">*</span>
            </label>
            <span className="ai-feedback-char-count">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </span>
          </div>
          <textarea
            className="ai-input"
            rows={5}
            placeholder={category === "report_error" ? "e.g. The last date mentioned on this page is incorrect." : "Write your message here..."}
            style={{ resize: "vertical", minHeight: "120px" }}
            value={message}
            required
            maxLength={MESSAGE_MAX_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {(category === "report_error" || category === "suggest_update") && (
          <div className="mb-4">
            <label className="ai-form-label">{category === "report_error" ? "Suggested correction" : "Suggested update"}</label>
            <textarea
              className="ai-input"
              rows={3}
              style={{ resize: "vertical" }}
              value={suggestedCorrection}
              onChange={(e) => setSuggestedCorrection(e.target.value)}
            />
          </div>
        )}

        {(category === "report_error" || category === "suggest_update") && (
          <div className="mb-4">
            <label className="ai-form-label">Official source URL</label>
            <input
              type="url"
              className="ai-input"
              placeholder="Link to the official notice (optional)"
              value={officialSourceUrl}
              onChange={(e) => setOfficialSourceUrl(e.target.value)}
            />
          </div>
        )}

        {/* Honeypot — visually hidden, never shown to a real visitor */}
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            type="text"
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <p className="small" style={{ color: "var(--color-muted)" }}>
          Please don't share passwords, OTPs, Aadhaar numbers, bank details, or other sensitive personal information through this
          form.
        </p>

        <div className="ai-feedback-trust">
          <span>
            <FiCheckCircle aria-hidden="true" /> We read every message
          </span>
        </div>

        <div className="mt-4">
          <button type="submit" className="ai-btn-gradient ai-feedback-submit" disabled={loading}>
            {loading ? (
              "Sending..."
            ) : (
              <>
                <FiSend aria-hidden="true" /> Submit
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ContactUsForm;
