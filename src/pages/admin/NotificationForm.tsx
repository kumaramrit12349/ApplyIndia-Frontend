import React, { useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import Toast from "../../components/Toast/Toast";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";
import type { INotification } from "../../interface/NotificationInterface";
import { epochToDateInput, toEpoch } from "../../utils/utils";

type Props = {
  mode: "create" | "edit";
  initialValues: INotification;
  onSubmit: (values: Partial<INotification>) => Promise<void>;
  onSuccess: () => void;
};

const NotificationForm: React.FC<Props> = ({
  mode,
  initialValues: rawInitialValues,
  onSubmit,
  onSuccess,
}) => {
  const findStateCode = (stateNameOrCode?: string) => {
    if (!stateNameOrCode) return "";
    const lower = stateNameOrCode.toLowerCase().replace(/-/g, " ");
    const exactCode = INDIAN_STATES.find(s => s.value.toLowerCase() === lower);
    if (exactCode) return exactCode.value;
    const byName = INDIAN_STATES.find(s => s.label.toLowerCase() === lower);
    return byName ? byName.value : stateNameOrCode;
  };

  const initialValues: INotification = {
    ...rawInitialValues,
    state: findStateCode(rawInitialValues.state),
    details: rawInitialValues.details || { short_description: "", long_description: "", important_date_details: "" },
    fee: rawInitialValues.fee || { general_fee: 0, obc_fee: 0, sc_fee: 0, st_fee: 0, ph_fee: 0, other_fee_details: "" },
    eligibility: rawInitialValues.eligibility || { min_age: 0, max_age: 0, qualification: "", specialization: "", min_percentage: 0, age_relaxation_details: "" },
    links: rawInitialValues.links || { youtube_link: "", apply_online_url: "", notification_pdf_url: "", official_website_url: "", admit_card_url: "", answer_key_url: "", result_url: "", other_links: "" },
  };

  const [form, setForm] = useState<INotification>(initialValues);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [totalVacanciesUI, setTotalVacanciesUI] = useState(
    initialValues.total_vacancies !== undefined
      ? String(initialValues.total_vacancies)
      : "",
  );

  const [feeUI, setFeeUI] = useState<Record<string, string>>({
    general_fee:
      initialValues.fee.general_fee !== undefined
        ? String(initialValues.fee.general_fee)
        : "",
    obc_fee:
      initialValues.fee.obc_fee !== undefined
        ? String(initialValues.fee.obc_fee)
        : "",
    sc_fee:
      initialValues.fee.sc_fee !== undefined
        ? String(initialValues.fee.sc_fee)
        : "",
    st_fee:
      initialValues.fee.st_fee !== undefined
        ? String(initialValues.fee.st_fee)
        : "",
    ph_fee:
      initialValues.fee.ph_fee !== undefined
        ? String(initialValues.fee.ph_fee)
        : "",
  });

  const [eligibilityUI, setEligibilityUI] = useState<Record<string, string>>({
    min_age:
      initialValues.eligibility.min_age !== undefined
        ? String(initialValues.eligibility.min_age)
        : "",
    max_age:
      initialValues.eligibility.max_age !== undefined
        ? String(initialValues.eligibility.max_age)
        : "",
    min_percentage:
      initialValues.eligibility.min_percentage !== undefined
        ? String(initialValues.eligibility.min_percentage)
        : "",
  });

  /* ---------------- Dirty Tracking ---------------- */

  const isDirty = useMemo(
    () => {
      // The state code was modified during initialization, so we compare against the coerced initialValues,
      // NOT the rawInitialValues passed from DB.
      return JSON.stringify(form) !== JSON.stringify(initialValues);
    },
    [form, initialValues],
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    value: any,
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
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.message || "Failed to save notification",
        type: "error",
      });
      setSaving(false);
    }
  };

  /* ---------------- UI Render Helpers ---------------- */

  const renderSectionTitle = (title: string) => (
    <div className="ai-form-section-title">{title}</div>
  );

  const renderInputField = (label: string, name: string, type: string = "text", required: boolean = false, placeholder: string = "") => (
    <div className="mb-3">
      <label className="ai-form-label">{label}{required && " *"}</label>
      <input
        className="ai-input"
        type={type}
        name={name}
        value={(form as any)[name] || ""}
        onChange={handleRootChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );

  const renderTextArea = (label: string, value: string, onChange: (val: string) => void) => (
    <div className="mb-4">
      <label className="ai-form-label">{label}</label>
      <div className="quill-wrapper" style={{background: 'rgba(255,255,255,0.7)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)'}}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="ai-form-card">
      <form onSubmit={handleSubmit}>
        {/* ================= BASIC ================= */}
        {renderSectionTitle("Basic Information")}
        <div className="ai-form-grid">
          {renderInputField("Title", "title", "text", true, "e.g. SSC CGL 2026")}
          
          <div className="mb-3">
            <label className="ai-form-label">Category *</label>
            <select
              name="category"
              className="ai-input"
              value={form.category}
              onChange={handleRootChange}
              required
            >
              <option value="">Select Category</option>
              {NOTIFICATION_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="ai-form-label">State Valid For *</label>
            <select
              name="state"
              className="ai-input"
              value={(form as any).state || ""}
              onChange={handleRootChange}
              required
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {renderInputField("Department", "department", "text", false, "e.g. Staff Selection Commission")}
          
          <div className="mb-3">
            <label className="ai-form-label">Total Vacancies</label>
            <input
              type="text"
              inputMode="numeric"
              className="ai-input"
              placeholder="e.g. 5000"
              value={totalVacanciesUI}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setTotalVacanciesUI("");
                  setForm((p) => ({ ...p, total_vacancies: 0 }));
                  return;
                }
                if (!/^[0-9]+$/.test(value)) return;
                setTotalVacanciesUI(value);
                setForm((p) => ({ ...p, total_vacancies: Number(value) }));
              }}
            />
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        {renderSectionTitle("Descriptions")}
        {renderTextArea("Short Description", form.details.short_description, (v) => handleNestedChange("details", "short_description", v))}
        {renderTextArea("Long Description", form.details.long_description, (v) => handleNestedChange("details", "long_description", v))}

        {/* ================= IMPORTANT DATES ================= */}
        {renderSectionTitle("Important Dates")}
        <div className="ai-form-grid">
          {[
            { key: "start_date", label: "Start Date" },
            { key: "last_date_to_apply", label: "Last Date to Apply" },
            { key: "exam_date", label: "Exam Date" },
            { key: "admit_card_date", label: "Admit Card Date" },
            { key: "result_date", label: "Result Date" },
          ].map(({ key, label }) => (
            <div className="mb-3" key={key}>
              <label className="ai-form-label">{label}</label>
              <input
                type="date"
                className="ai-input"
                value={epochToDateInput((form as any)[key])}
                onChange={(e) => setForm((p) => ({ ...p, [key]: toEpoch(e.target.value) }))}
              />
            </div>
          ))}
        </div>
        {renderTextArea("Important Date Details", form.details.important_date_details || "", (v) => handleNestedChange("details", "important_date_details", v))}

        {/* ================= STATUS FLAGS ================= */}
        {renderSectionTitle("Notification Status Availability")}
        <div className="ai-checkbox-group mb-5">
          <div className="row">
            {[
              ["has_admit_card", "Admit Card Available"],
              ["has_result", "Result Available"],
              ["has_answer_key", "Answer Key Available"],
              ["has_syllabus", "Syllabus Available"],
            ].map(([key, label]) => (
              <div className="col-md-6 mb-3" key={key}>
                <div className="form-check d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    style={{width: '1.2rem', height: '1.2rem'}}
                    id={key}
                    checked={(form as any)[key] || false}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                  />
                  <label className="form-check-label ai-form-label mb-0" htmlFor={key}>
                    {label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= FEES ================= */}
        {renderSectionTitle("Application Fees")}
        <div className="ai-form-grid">
          {[
            ["general_fee", "General Fee (₹)"],
            ["obc_fee", "OBC Fee (₹)"],
            ["sc_fee", "SC Fee (₹)"],
            ["st_fee", "ST Fee (₹)"],
            ["ph_fee", "PH Fee (₹)"],
          ].map(([key, label]) => (
            <div className="mb-3" key={key}>
              <label className="ai-form-label">{label}</label>
              <input
                type="text"
                inputMode="numeric"
                className="ai-input"
                placeholder="0"
                value={feeUI[key] ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setFeeUI((p) => ({ ...p, [key]: "" }));
                    handleNestedChange("fee", key, 0);
                    return;
                  }
                  if (!/^[0-9]+$/.test(value)) return;
                  setFeeUI((p) => ({ ...p, [key]: value }));
                  handleNestedChange("fee", key, Number(value));
                }}
              />
            </div>
          ))}
        </div>
        {renderTextArea("Other Fee Details", form.fee.other_fee_details || "", (v) => handleNestedChange("fee", "other_fee_details", v))}

        {/* ================= ELIGIBILITY ================= */}
        {renderSectionTitle("Eligibility Criteria")}
        <div className="ai-form-grid">
          {[
            ["min_age", "Minimum Age", "number"],
            ["max_age", "Maximum Age", "number"],
            ["qualification", "Qualification", "text"],
            ["specialization", "Specialization", "text"],
            ["min_percentage", "Min. Percentage (%)", "number"],
          ].map(([key, label, type]) => (
            <div className="mb-3" key={key}>
              <label className="ai-form-label">{label}</label>
              {type === "number" ? (
                <input
                  type="text"
                  inputMode="numeric"
                  className="ai-input"
                  placeholder="0"
                  value={eligibilityUI[key] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setEligibilityUI((p) => ({ ...p, [key]: "" }));
                      handleNestedChange("eligibility", key, 0);
                      return;
                    }
                    if (!/^[0-9]+$/.test(value)) return;
                    setEligibilityUI((p) => ({ ...p, [key]: value }));
                    handleNestedChange("eligibility", key, Number(value));
                  }}
                />
              ) : (
                <input
                  type="text"
                  className="ai-input"
                  placeholder={`e.g. ${label}`}
                  value={(form.eligibility as any)[key]}
                  onChange={(e) => handleNestedChange("eligibility", key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        {renderTextArea("Age Relaxation Details", form.eligibility.age_relaxation_details || "", (v) => handleNestedChange("eligibility", "age_relaxation_details", v))}

        {/* ================= LINKS ================= */}
        {renderSectionTitle("Important Links")}
        <div className="ai-form-grid">
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
              <label className="ai-form-label">
                {key.replace(/_/g, " ").toUpperCase()}
              </label>
              <input
                type="url"
                className="ai-input"
                placeholder="https://..."
                value={(form.links as any)[key] || ""}
                onChange={(e) => handleNestedChange("links", key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-5">
          <button
            type="submit"
            className="ai-btn-submit"
            disabled={!isDirty || saving}
          >
            {saving
              ? mode === "create" ? "Creating..." : "Updating..."
              : mode === "create" ? "Add Notification" : "Update Notification"}
          </button>
        </div>
      </form>
    </div>

    <ConfirmModal
      show={showModal}
      title={mode === "create" ? "Add Notification" : "Update Notification"}
      message="Are you sure you want to proceed with these changes?"
      confirmText={mode === "create" ? "Create Now" : "Save Changes"}
      confirmVariant="primary"
      confirmButtonClassName="ai-btn-submit text-white border-0 px-4"
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
