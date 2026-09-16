import React from "react";
import { FiCheckCircle, FiClock, FiLayers, FiBookmark } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import "./WhyChoose.css";

const ICONS = [
  <FiCheckCircle size={22} key="check" />,
  <FiClock size={22} key="clock" />,
  <FiLayers size={22} key="layers" />,
  <FiBookmark size={22} key="bookmark" />,
];
const ACCENTS = ["#2563eb", "#d97706", "#7c3aed", "#db2777"];

const WhyChoose: React.FC = () => {
  const { whyChoose: t } = useTranslation();

  return (
    <section className="ai-why-choose" aria-label="Why choose Apply India">
      <div className="container">
        <div className="ai-why-choose-header">
          <h2 className="ai-why-choose-title">{t.title}</h2>
          <p className="ai-why-choose-subtitle">{t.subtitle}</p>
        </div>
        <div className="ai-why-choose-grid">
          {t.reasons.map((reason, index) => (
            <div
              className="ai-why-choose-card"
              key={reason.title}
              style={{ "--reason-accent": ACCENTS[index] } as React.CSSProperties}
            >
              <div className="ai-why-choose-icon">{ICONS[index]}</div>
              <h3 className="ai-why-choose-card-title">{reason.title}</h3>
              <p className="ai-why-choose-card-desc">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
