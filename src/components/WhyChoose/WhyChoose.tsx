import React from "react";
import { FiCheckCircle, FiClock, FiLayers, FiBookmark } from "react-icons/fi";
import "./WhyChoose.css";

const REASONS = [
  {
    icon: <FiCheckCircle size={22} />,
    title: "Verified, Not Just Scraped",
    description:
      "Every notification is reviewed by our team before it goes live — filtering out spam, duplicates, and stale postings.",
  },
  {
    icon: <FiClock size={22} />,
    title: "Never Miss a Deadline",
    description:
      "Every listing shows its last date to apply at a glance, with a clear Open, Closing Soon, or Closed status.",
  },
  {
    icon: <FiLayers size={22} />,
    title: "Everything in One Place",
    description:
      "Jobs, admit cards, results, answer keys, and syllabus — linked together so you don't have to hunt across a dozen sites.",
  },
  {
    icon: <FiBookmark size={22} />,
    title: "Track Your Own Applications",
    description:
      "Wishlist any notification and follow it from Applied through to Result on your personal dashboard.",
  },
];

const WhyChoose: React.FC = () => {
  return (
    <section className="ai-why-choose" aria-label="Why choose Apply India">
      <div className="container">
        <div className="ai-why-choose-header">
          <h2 className="ai-why-choose-title">Why Choose Apply India</h2>
          <p className="ai-why-choose-subtitle">
            Built to cut through the noise of government notification sites.
          </p>
        </div>
        <div className="ai-why-choose-grid">
          {REASONS.map((reason) => (
            <div className="ai-why-choose-card" key={reason.title}>
              <div className="ai-why-choose-icon">{reason.icon}</div>
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
