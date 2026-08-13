import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit, FiPlus, FiMail, FiX, FiInfo, FiEye } from "react-icons/fi";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplatePreviewUrl,
  getEmailSamplePreviewUrl,
} from "../../services/private/emailTemplateApi";
import type { EmailTemplate } from "../../services/private/emailTemplateApi";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmailTemplates();
      if (res.success) {
        setTemplates(res.templates);
      } else {
        setError("Failed to fetch email templates");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred while fetching email templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEditClick = (template: EmailTemplate) => {
    setIsEditing(true);
    setKey(template.key);
    setSubject(template.subject);
    setBody(template.body);
    setDescription(template.description || "");
    setOriginalValues({ subject: template.subject, body: template.body, description: template.description || "" });
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setKey("");
    setSubject("");
    setBody("");
    setDescription("");
    setOriginalValues(null);
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
            <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "rgba(15, 61, 145, 0.12)", color: "var(--color-primary)" }}
                >
                  <FiMail size={28} />
                </div>
                <div>
                  <h2 className="h4 mb-1 fw-bold" style={{ color: "var(--color-heading)" }}>
                    Email Templates
                  </h2>
                  <p className="text-muted mb-0 small">
                    Manage subject/body content for system emails. A shared header and footer are applied
                    automatically to every email — no need to include branding here.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.open(getEmailSamplePreviewUrl(), "_blank", "noopener,noreferrer")}
                className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm flex-shrink-0"
                title="Preview the shared header/footer theme with sample content — no template needs to be saved first"
              >
                <FiEye size={16} />
                <span>Preview Theme</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center gap-2">
            <FiInfo className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Templates List */}
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header py-3 border-0" style={{ background: "var(--color-surface)" }}>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-heading)" }}>All Templates</h5>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <FiInfo size={36} className="mb-2 text-secondary" />
                    <p className="mb-0">No email templates created yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive scroll-fade-x">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ background: "var(--color-bg)" }}>
                        <tr>
                          <th className="px-4">Key</th>
                          <th>Subject</th>
                          <th className="text-end px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templates.map((t) => (
                          <tr key={t.key}>
                            <td className="px-4">
                              <span className="font-monospace small" style={{ color: "var(--color-heading)" }}>
                                {t.key}
                              </span>
                              {t.description && (
                                <div className="text-muted small text-truncate" style={{ maxWidth: "220px" }} title={t.description}>
                                  {t.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="text-truncate d-block" style={{ maxWidth: "260px" }} title={t.subject}>
                                {t.subject}
                              </span>
                            </td>
                            <td className="text-end px-4">
                              <div className="d-flex gap-2 justify-content-end">
                                <button
                                  onClick={() => window.open(getEmailTemplatePreviewUrl(t.key), "_blank", "noopener,noreferrer")}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm px-2.5"
                                  title="Preview rendered email (header + body + footer, with sample data)"
                                >
                                  <FiEye size={14} />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => handleEditClick(t)}
                                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm px-2.5"
                                  title="Edit template"
                                >
                                  <FiEdit size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(t)}
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center shadow-sm p-2"
                                  title="Delete template"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Add / Edit Form */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-header py-3 border-0 d-flex justify-content-between align-items-center" style={{ background: "var(--color-surface)" }}>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-heading)" }}>
                  {isEditing ? "Update Template" : "New Template"}
                </h5>
                {isEditing && (
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      onClick={() => window.open(getEmailTemplatePreviewUrl(key), "_blank", "noopener,noreferrer")}
                      className="btn btn-sm btn-link text-muted p-0 d-flex align-items-center gap-1 text-decoration-none"
                    >
                      <FiEye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={handleClearForm}
                      className="btn btn-sm btn-link text-muted p-0 d-flex align-items-center gap-1 text-decoration-none"
                    >
                      <FiX size={14} />
                      Cancel Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-3">
                    <label htmlFor="templateKey" className="form-label fw-semibold text-secondary small">
                      Key
                    </label>
                    <input
                      id="templateKey"
                      type="text"
                      placeholder="e.g. notification-approved"
                      className="form-control font-monospace"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      disabled={isEditing}
                      required
                    />
                    <div className="form-text text-muted small mt-1">
                      Fixed identifier the code looks this template up by — cannot be changed after creation.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="templateSubject" className="form-label fw-semibold text-secondary small">
                      Subject
                    </label>
                    <input
                      id="templateSubject"
                      type="text"
                      placeholder="e.g. New Notification: {{title}}"
                      className="form-control"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="templateBody" className="form-label fw-semibold text-secondary small">
                      Body (HTML)
                    </label>
                    <textarea
                      id="templateBody"
                      className="form-control font-monospace"
                      rows={8}
                      placeholder={"<h2>{{title}}</h2>\n<p>Last date to apply: {{last_date_to_apply}}</p>\n<a href=\"{{url}}\">View details</a>"}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    />
                    <div className="form-text text-muted small mt-1">
                      Use <code>{"{{variable}}"}</code> placeholders — for the notification-approved template:
                      title, category, last_date_to_apply, url. A shared header/footer wraps this automatically.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="templateDescription" className="form-label fw-semibold text-secondary small">
                      Description (optional)
                    </label>
                    <input
                      id="templateDescription"
                      type="text"
                      placeholder="What this template is used for"
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold text-white border-0"
                    style={{ background: "var(--color-primary)" }}
                    disabled={submitting || isUnchanged}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : isEditing ? (
                      "Save Template"
                    ) : (
                      <>
                        <FiPlus />
                        <span>Create Template</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

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
