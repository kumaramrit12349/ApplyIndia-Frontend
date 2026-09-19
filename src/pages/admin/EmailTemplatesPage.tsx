import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit, FiPlus, FiMail, FiX, FiInfo, FiEye, FiSend } from "react-icons/fi";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplatePreviewUrl,
} from "../../services/private/emailTemplateApi";
import type { EmailTemplate } from "../../services/private/emailTemplateApi";
import { getPlatformSettings, updatePlatformSettings } from "../../services/private/platformSettingsApi";
import type { PlatformSettings } from "../../services/private/platformSettingsApi";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import "./EmailTemplatesPage.css";
import cognitoEmailHtml from "../../../email-templates/cognito-verification-email.html?raw";
import BackToDashboard from "../../components/BackToDashboard/BackToDashboard";

/**
 * The one Cognito-sent email design (Sign Up, Account Verification and
 * Forgot Password all use it). Cognito fills {####} with the real code at
 * send time, so a sample code stands in for it in the preview.
 */
const openCognitoEmailPreview = () => {
  const html = cognitoEmailHtml.replace("{####}", "123456");
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/** Templates fetched per infinite-scroll page — tune here. */
const TEMPLATE_PAGE_SIZE = 10;

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  email_communication_enabled: true,
  contact_us_enabled: true,
  guidance_enabled: true,
  notification_enabled: true,
};

/** One row per feature area gated in emailService.ts's sendEmail() — see EMAIL_CHANNEL on the backend. */
const CHANNEL_TOGGLES: { field: keyof PlatformSettings; label: string; description: string }[] = [
  { field: "contact_us_enabled", label: "Contact Us", description: "Submitter confirmations and the internal new-submission alert." },
  { field: "guidance_enabled", label: "Guidance Bookings", description: "Booking confirmations and slot-cancellation emails." },
  { field: "notification_enabled", label: "Notification Alerts", description: "New job/exam notification email alerts." },
];

const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<{ pk: string; sk: string } | undefined>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchingMore, setFetchingMore] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Form state
  const [key, setKey] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [originalValues, setOriginalValues] = useState<{ subject: string; body: string; description: string } | null>(null);

  // Delete confirm modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  // Add/Edit now happens in a popup rather than an always-visible side panel.
  const [showFormModal, setShowFormModal] = useState<boolean>(false);

  // Platform email settings — a master switch plus one toggle per feature
  // area (see EMAIL_CHANNEL on the backend). Off master means nothing sends
  // regardless of the section toggles; lives here since this is the only
  // existing admin surface about email.
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loadingEmailSetting, setLoadingEmailSetting] = useState<boolean>(true);
  const [savingField, setSavingField] = useState<keyof PlatformSettings | null>(null);

  useEffect(() => {
    getPlatformSettings()
      .then((res) => setPlatformSettings(res.data))
      .catch(() => toast.error("Failed to load platform email settings"))
      .finally(() => setLoadingEmailSetting(false));
  }, []);

  const handleToggleField = async (field: keyof PlatformSettings, label: string) => {
    const next = !platformSettings[field];
    setSavingField(field);
    try {
      const res = await updatePlatformSettings({ [field]: next });
      setPlatformSettings(res.data);
      toast.success(`${label} email communication ${next ? "enabled" : "disabled"}`);
    } catch {
      toast.error(`Failed to update ${label} email setting`);
    } finally {
      setSavingField(null);
    }
  };

  const fetchTemplates = async (isFirst = true) => {
    try {
      if (isFirst) {
        setLoading(true);
        setError(null);
      } else {
        setFetchingMore(true);
      }
      const res = await getEmailTemplates(TEMPLATE_PAGE_SIZE, isFirst ? undefined : lastEvaluatedKey);
      if (res.success) {
        setTemplates((prev) => (isFirst ? res.templates : [...prev, ...res.templates]));
        setLastEvaluatedKey(res.lastEvaluatedKey);
        setHasMore(!!res.lastEvaluatedKey);
      } else {
        setError("Failed to fetch email templates");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred while fetching email templates.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver fires immediately on .observe() if the target is
  // already visible, with no scroll at all — gate on a real scroll event
  // first so short lists don't cascade through every page instantly (same
  // approach as the Contact Us admin list).
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      hasScrolledRef.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading || fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && hasScrolledRef.current) fetchTemplates(false);
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, fetchingMore, hasMore, lastEvaluatedKey]
  );

  const handleOpenCreate = () => {
    handleClearForm();
    setShowFormModal(true);
  };

  const handleEditClick = (template: EmailTemplate) => {
    setIsEditing(true);
    setKey(template.key);
    setSubject(template.subject);
    setBody(template.body);
    setDescription(template.description || "");
    setOriginalValues({ subject: template.subject, body: template.body, description: template.description || "" });
    setShowFormModal(true);
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setKey("");
    setSubject("");
    setBody("");
    setDescription("");
    setOriginalValues(null);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    handleClearForm();
  };

  const isUnchanged =
    isEditing &&
    originalValues !== null &&
    subject === originalValues.subject &&
    body === originalValues.body &&
    description === originalValues.description;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key || !subject || !body) {
      toast.error("Key, subject, and body are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = isEditing
        ? await updateEmailTemplate(key, { subject, body, description })
        : await createEmailTemplate({ key, subject, body, description });

      if (res.success) {
        toast.success(res.message || "Email template saved successfully!");
        setShowFormModal(false);
        handleClearForm();
        fetchTemplates();
      } else {
        toast.error("Failed to save email template.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save email template.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      const res = await deleteEmailTemplate(templateToDelete.key);
      if (res.success) {
        toast.success(res.message || "Email template deleted successfully.");
        if (isEditing && key === templateToDelete.key) handleCloseFormModal();
        fetchTemplates();
      } else {
        toast.error("Failed to delete email template.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete email template.");
    } finally {
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div className="min-vh-100 py-5" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        {/* Header Section */}
        <div className="card shadow-sm border-0 mb-4 rounded-3" style={{ background: "var(--color-surface)" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-3">
                <div className="etp-icon-badge" style={{ background: "rgba(15, 61, 145, 0.12)", color: "var(--color-primary)" }}>
                  <FiMail size={22} />
                </div>
                <div>
                  <h2 className="etp-title">Email Templates</h2>
                  <p className="etp-subtitle mt-1">
                    Manage subject/body content for system emails. A shared header and footer are applied
                    automatically to every email — no need to include branding here.
                  </p>
                  <p className="etp-subtitle mt-1">
                    <strong style={{ color: "var(--color-heading)" }}>Preview Theme</strong> shows the Sign Up,
                    Account Verification and Forgot Password email — all three use the same design.
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
              <BackToDashboard />
              <button
                type="button"
                onClick={openCognitoEmailPreview}
                className="etp-btn-ghost etp-btn-ghost--info flex-shrink-0"
                title="Preview of the Sign Up, Verification and Forgot Password emails"
              >
                <FiEye size={14} />
                <span>Preview Theme</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Email Communication — master switch + one toggle per feature area */}
        <div className="card shadow-sm border-0 mb-4 rounded-3" style={{ background: "var(--color-surface)" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    backgroundColor: platformSettings.email_communication_enabled ? "rgba(22, 163, 74, 0.12)" : "rgba(220, 38, 38, 0.12)",
                    color: platformSettings.email_communication_enabled ? "var(--color-success, #16a34a)" : "var(--color-danger, #dc2626)",
                  }}
                >
                  <FiSend size={22} />
                </div>
                <div>
                  <h5 className="etp-section-title mb-1">Platform Email Communication</h5>
                  <p className="etp-subtitle">
                    Master switch for every outgoing email across the platform. When off, nothing is sent
                    anywhere, regardless of the section switches below.
                  </p>
                </div>
              </div>
              <div className="form-check form-switch mb-0 flex-shrink-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  role="switch"
                  id="platform-email-toggle"
                  style={{ width: "2.75rem", height: "1.5rem", cursor: "pointer" }}
                  checked={platformSettings.email_communication_enabled}
                  disabled={loadingEmailSetting || savingField !== null}
                  onChange={() => handleToggleField("email_communication_enabled", "Platform")}
                />
                <label className="form-check-label ms-2 fw-semibold" htmlFor="platform-email-toggle" style={{ color: "var(--color-body)" }}>
                  {platformSettings.email_communication_enabled ? "Enabled" : "Disabled"}
                </label>
              </div>
            </div>

            <div
              className="d-flex align-items-start gap-2 mt-3 p-3 rounded-3"
              style={{ background: "rgba(var(--color-primary-rgb, 15, 61, 145), 0.08)", border: "1px solid rgba(var(--color-primary-rgb, 15, 61, 145), 0.2)" }}
            >
              <FiInfo size={16} className="flex-shrink-0 mt-1" style={{ color: "var(--color-primary)" }} />
              <p className="small mb-0" style={{ color: "var(--color-body)" }}>
                <strong style={{ color: "var(--color-heading)" }}>Why use this:</strong> pause outgoing emails
                instantly, without a code deploy — e.g. an SES sending-limit issue, a spam/abuse wave on Contact
                Us, or planned maintenance on one feature. Turn off just the affected section below, or the
                master switch above to stop everything at once.
              </p>
            </div>

            <hr style={{ borderColor: "var(--color-border)" }} />

            <p className="etp-label mb-3">By Section</p>
            {!platformSettings.email_communication_enabled && (
              <p className="small mb-3" style={{ color: "var(--color-danger, #dc2626)" }}>
                Master switch is off — none of these will send regardless of their own setting below.
              </p>
            )}
            <div className="d-flex flex-column gap-3">
              {CHANNEL_TOGGLES.map(({ field, label, description }) => (
                <div key={field} className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                  <div>
                    <div className="fw-semibold" style={{ color: "var(--color-heading)" }}>
                      {label}
                    </div>
                    <div className="small text-muted">{description}</div>
                  </div>
                  <div className="form-check form-switch mb-0 flex-shrink-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      role="switch"
                      id={`platform-email-toggle-${field}`}
                      style={{ width: "2.75rem", height: "1.5rem", cursor: "pointer" }}
                      checked={platformSettings[field] as boolean}
                      disabled={loadingEmailSetting || savingField !== null || !platformSettings.email_communication_enabled}
                      onChange={() => handleToggleField(field, label)}
                    />
                    <label
                      className="form-check-label ms-2 fw-semibold"
                      htmlFor={`platform-email-toggle-${field}`}
                      style={{ color: "var(--color-body)" }}
                    >
                      {platformSettings[field] ? "Enabled" : "Disabled"}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center gap-2">
            <FiInfo className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Templates List — full width; Add/Edit now happens in the popup below */}
        <div className="card shadow-sm border-0" style={{ background: "var(--color-surface)" }}>
          <div className="etp-card-header" style={{ background: "var(--color-surface)" }}>
            <div className="d-flex align-items-center gap-2">
              <h5 className="etp-section-title">All Templates</h5>
              {templates.length > 0 && <span className="etp-count-badge">{templates.length}</span>}
            </div>
            <button type="button" onClick={handleOpenCreate} className="etp-btn-primary-pill">
              <FiPlus size={14} />
              <span>New Template</span>
            </button>
          </div>
          <div className="card-body p-0" style={{ background: "var(--color-surface)" }}>
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className="etp-empty-state">
                <FiInfo size={32} />
                <p className="mb-0">No email templates created yet.</p>
              </div>
            ) : (
              <div className="table-responsive scroll-fade-x">
                <table className="table table-hover align-middle etp-table table-stack">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Key</th>
                      <th className="py-3">Subject</th>
                      <th className="text-end px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t, index) => (
                      <tr
                        key={t.key}
                        ref={index === templates.length - 1 ? lastRowRef : null}
                        className={isEditing && key === t.key ? "etp-row-active" : ""}
                      >
                        <td className="px-4 py-3">
                          <span className="etp-key-pill">{t.key}</span>
                          {t.description && (
                            <div className="etp-help-text text-truncate mt-1" style={{ maxWidth: "320px" }} title={t.description}>
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3" data-label="Subject">
                          <span className="text-truncate d-block" style={{ maxWidth: "420px", color: "var(--color-body)" }} title={t.subject}>
                            {t.subject}
                          </span>
                        </td>
                        <td className="text-end px-4 py-3">
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              onClick={() => window.open(getEmailTemplatePreviewUrl(t.key), "_blank", "noopener,noreferrer")}
                              className="etp-btn-ghost etp-btn-ghost--info"
                              title="Preview rendered email (header + body + footer, with sample data)"
                            >
                              <FiEye size={13} />
                              <span>Preview</span>
                            </button>
                            <button onClick={() => handleEditClick(t)} className="etp-btn-ghost etp-btn-ghost--warn" title="Edit template">
                              <FiEdit size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(t)}
                              className="etp-btn-ghost etp-btn-ghost--danger"
                              title="Delete template"
                            >
                              <FiTrash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fetchingMore && (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Template popup */}
      {showFormModal && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCloseFormModal}></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="etp-card-header">
                  <h5 className="etp-section-title">{isEditing ? "Update Template" : "New Template"}</h5>
                  <div className="d-flex align-items-center gap-3">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => window.open(getEmailTemplatePreviewUrl(key), "_blank", "noopener,noreferrer")}
                        className="etp-btn-link"
                      >
                        <FiEye size={13} />
                        Preview
                      </button>
                    )}
                    <button type="button" onClick={handleCloseFormModal} className="etp-btn-link" aria-label="Close">
                      <FiX size={13} />
                      Close
                    </button>
                  </div>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-3">
                      <label htmlFor="templateKey" className="etp-label">
                        Key
                      </label>
                      <input
                        id="templateKey"
                        type="text"
                        placeholder="e.g. notification-approved"
                        className="etp-input font-monospace"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        disabled={isEditing}
                        required
                      />
                      <div className="etp-help-text">
                        Fixed identifier the code looks this template up by — cannot be changed after creation.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="templateSubject" className="etp-label">
                        Subject
                      </label>
                      <input
                        id="templateSubject"
                        type="text"
                        placeholder="e.g. New Notification: {{title}}"
                        className="etp-input"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="templateBody" className="etp-label">
                        Body (HTML)
                      </label>
                      <textarea
                        id="templateBody"
                        className="etp-input font-monospace"
                        rows={10}
                        placeholder={"<h2>{{title}}</h2>\n<p>Last date to apply: {{last_date_to_apply}}</p>\n<a href=\"{{url}}\">View details</a>"}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                      />
                      <div className="etp-help-text">
                        Use <code>{"{{variable}}"}</code> placeholders — for the notification-approved template:
                        title, category, last_date_to_apply, url. A shared header/footer wraps this automatically.
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="templateDescription" className="etp-label">
                        Description (optional)
                      </label>
                      <input
                        id="templateDescription"
                        type="text"
                        placeholder="What this template is used for"
                        className="etp-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="etp-btn-submit" disabled={submitting || isUnchanged}>
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : isEditing ? (
                        "Save Template"
                      ) : (
                        <>
                          <FiPlus size={16} />
                          <span>Create Template</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Email Template"
        message={`Are you sure you want to delete the "${templateToDelete?.key}" template? Emails using this key will fall back to a default template until a new one is created.`}
        confirmText="Delete Template"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
      />
    </div>
  );
};

export default EmailTemplatesPage;
