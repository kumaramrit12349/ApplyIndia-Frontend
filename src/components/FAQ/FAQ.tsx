import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./FAQ.css";

const FAQS = [
  {
    question: "Is Apply India free to use?",
    answer:
      "Yes. Browsing, searching, and tracking notifications on Apply India is completely free — there's no paywall or premium tier.",
  },
  {
    question: "Do I need an account to browse notifications?",
    answer:
      "No. You can search and read every notification without signing in. An account is only needed if you want to wishlist a notification or track your application progress.",
  },
  {
    question: "How are notifications verified before they're published?",
    answer:
      "Every notification is reviewed by our team before it goes live. We check the source, dates, and details to filter out spam, duplicates, and stale postings.",
  },
  {
    question: "How do I track an application I've applied to?",
    answer:
      "Wishlist any notification from its listing or detail page, then open My Dashboard to move it through Applied, Admit Card, Result, and Selected as your application progresses.",
  },
  {
    question: "Can I filter notifications by my state?",
    answer:
      "Yes. Use the state pills on the homepage or the state filter in search to see notifications specific to your state alongside central government postings.",
  },
  {
    question: "I found incorrect information in a notification — what do I do?",
    answer:
      "Use the Send Feedback link in the footer to report it, and our team will review and correct it.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="ai-faq" aria-label="Frequently asked questions">
      <div className="container">
        <div className="ai-faq-header">
          <h2 className="ai-faq-title">Frequently Asked Questions</h2>
        </div>
        <div className="ai-faq-list">
          {FAQS.map((faq, index) => {
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
