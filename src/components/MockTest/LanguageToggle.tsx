import React from "react";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import "./LanguageToggle.css";

interface Props {
  value: MockTestLanguage;
  onChange: (lang: MockTestLanguage) => void;
}

const OPTIONS: { value: MockTestLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "both", label: "Both" },
];

const LanguageToggle: React.FC<Props> = ({ value, onChange }) => (
  <div className="mt-lang-toggle" role="group" aria-label="Display language">
    {OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        className={`mt-lang-btn ${value === opt.value ? "mt-lang-btn--active" : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default LanguageToggle;
