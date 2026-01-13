// components/NotificationForm/NotificationForm.tsx
import React, { useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { NOTIFICATION_CATEGORIES } from "../../constant/SharedConstant";
import type { INotification } from "../../interface/NotificationInterface";
import { epochToDateInput, toEpoch } from "../../utils/utils";

type Props = {
  mode: "create" | "edit";
  initialValues: INotification;
  onSubmit: (values: Partial<INotification>) => Promise<void>;
};

const NotificationForm: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
}) => {
  const [form, setForm] = useState<INotification>(initialValues);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  /* ---------------- Dirty Tracking ---------------- */

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialValues),
    [form, initialValues]
  );

  const buildPatchPayload = (): Partial<INotification> => {
    const diff: any = {};
    (Object.keys(form) as (keyof INotification)[]).forEach((key) => {
      if (JSON.stringify(form[key]) !== JSON.stringify(initialValues[key])) {
        diff[key] = form[key];
      }
    });
    return diff;
  };

  /* ---------------- Helpers ---------------- */

  const handleRootChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleNestedChange = (
    section: keyof INotification,
    field: string,
    value: any
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    setSaving(true);
    try {
      const payload = mode === "edit" ? buildPatchPayload() : form;
      await onSubmit(payload);
      setToast({
        show: true,
        message:
          mode === "create"
            ? "Notification created successfully!"
            : "Notification updated successfully!",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.message || "Failed to save notification",
        type: "error",
      });
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* ================= BASIC ================= */}
        <h5 className="mt-4">Basic Information</h5>

        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleRootChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category *</label>
          <select
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleRootChange}
            required
          >
            <option value="">Select</option>
            {NOTIFICATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Department</label>
          <input
            className="form-control"
            name="department"
            value={form.department}
            onChange={handleRootChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Total Vacancies</label>
          <input
            type="number"
            className="form-control"
            name="total_vacancies"
            value={form.total_vacancies}
            onChange={handleRootChange}
          />
        </div>

        {/* ================= DETAILS ================= */}
        <h5 className="mt-4">Descriptions</h5>

        <div className="mb-3">
          <label className="form-label">Short Description</label>
          <ReactQuill
            theme="snow"
            value={form.details.short_description}
            onChange={(v) =>
              handleNestedChange("details", "short_description", v)
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Long Description</label>
          <ReactQuill
            theme="snow"
            value={form.details.long_description}
            onChange={(v) =>
              handleNestedChange("details", "long_description", v)
            }
          />
        </div>

        {/* ================= IMPORTANT DATES ================= */}
        <h5 className="mt-4">Important Dates</h5>

        {[
          { key: "start_date", label: "Start Date" },
          { key: "last_date_to_apply", label: "Last Date to Apply" },
          { key: "exam_date", label: "Exam Date" },
          { key: "admit_card_date", label: "Admit Card Date" },
          { key: "result_date", label: "Result Date" },
        ].map(({ key, label }) => (
          <div className="mb-3" key={key}>
            <label className="form-label">{label}</label>
            <input
              type="date"
              className="form-control"
              value={epochToDateInput((form as any)[key])}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  [key]: toEpoch(e.target.value), // convert back to epoch
                }))
              }
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Important Date Details</label>
          <ReactQuill
            theme="snow"
            value={form.details.important_date_details || ""}
            onChange={(v) =>
              handleNestedChange("details", "important_date_details", v)
            }
          />
        </div>

        {/* ================= STATUS FLAGS ================= */}
        <h5 className="mt-4">Notification Status</h5>

        <div className="row">
          {[
            ["has_admit_card", "Admit Card Available"],
            ["has_result", "Result Available"],
            ["has_answer_key", "Answer Key Available"],
            ["has_syllabus", "Syllabus Available"],
          ].map(([key, label]) => (
            <div className="col-md-6 mb-3" key={key}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={key}
                  checked={(form as any)[key] || false}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [key]: e.target.checked,
                    }))
                  }
                />
                <label className="form-check-label" htmlFor={key}>
                  {label}
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* ================= FEES ================= */}
        <h5 className="mt-4">Fees</h5>

        {[
          ["general_fee", "General Fee"],
          ["obc_fee", "OBC Fee"],
          ["sc_fee", "SC Fee"],
          ["st_fee", "ST Fee"],
          ["ph_fee", "PH Fee"],
        ].map(([key, label]) => (
          <div className="mb-3" key={key}>
            <label className="form-label">{label}</label>
            <input
              type="number"
              className="form-control"
              value={(form.fee as any)[key]}
              onChange={(e) =>
                handleNestedChange("fee", key, Number(e.target.value))
              }
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Other Fee Details</label>
          <ReactQuill
            theme="snow"
            value={form.fee.other_fee_details || ""}
            onChange={(v) => handleNestedChange("fee", "other_fee_details", v)}
          />
        </div>

        {/* ================= ELIGIBILITY ================= */}
        <h5 className="mt-4">Eligibility</h5>

        {[
          ["min_age", "Minimum Age"],
          ["max_age", "Maximum Age"],
          ["qualification", "Qualification"],
          ["specialization", "Specialization"],
          ["min_percentage", "Minimum Percentage"],
        ].map(([key, label]) => (
          <div className="mb-3" key={key}>
            <label className="form-label">{label}</label>
            <input
              className="form-control"
              type={
                key.includes("age") || key.includes("percentage")
                  ? "number"
                  : "text"
              }
              value={(form.eligibility as any)[key]}
              onChange={(e) =>
                handleNestedChange(
                  "eligibility",
                  key,
                  key.includes("age") || key.includes("percentage")
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Age Relaxation Details</label>
          <ReactQuill
            theme="snow"
            value={form.eligibility.age_relaxation_details || ""}
            onChange={(v) =>
              handleNestedChange("eligibility", "age_relaxation_details", v)
            }
          />
        </div>

        {/* ================= LINKS ================= */}
        <h5 className="mt-4">Links</h5>

        {[
          "apply_online_url",
          "notification_pdf_url",
          "official_website_url",
          "admit_card_url",
          "answer_key_url",
          "result_url",
          "youtube_link",
          "other_links",
        ].map((key) => (
          <div className="mb-3" key={key}>
            <label className="form-label">
              {key.replace(/_/g, " ").toUpperCase()}
            </label>
            <input
              type="url"
              className="form-control"
              value={(form.links as any)[key] || ""}
              onChange={(e) => handleNestedChange("links", key, e.target.value)}
            />
          </div>
        ))}

        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={!isDirty || saving}
        >
          {saving
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Add Notification"
            : "Update Notification"}
        </button>
      </form>

      <ConfirmModal
        show={showModal}
        title={mode === "create" ? "Add Notification" : "Update Notification"}
        message="Are you sure you want to proceed?"
        confirmText={mode === "create" ? "Create" : "Update"}
        confirmVariant="primary"
        onConfirm={confirmSubmit}
        onCancel={() => setShowModal(false)}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </>
  );
};

export default NotificationForm;
