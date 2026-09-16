import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import "./FAQ.css";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { faq: t } = useTranslation();

  return (
    <section className="ai-faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="ai-faq-header">
          <h2 className="ai-faq-title">{t.title}</h2>
        </div>
        <div className="ai-faq-list">
          {t.items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div className={`ai-faq-item ${isOpen ? "ai-faq-item--open" : ""}`} key={faq.question}>
                <button
                  type="button"
                  className="ai-faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="ai-faq-question-text">
                    <span className="ai-faq-number">{String(index + 1).padStart(2, "0")}</span>
                    {faq.question}
                  </span>
                  <FiChevronDown className="ai-faq-chevron" size={18} />
                </button>
                {isOpen && <p className="ai-faq-answer">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
