import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import "./Hero.css";

const Hero: React.FC = () => {
  return (
    <section className="ai-hero" aria-label="Apply India">
      <div className="container">
        <div className="ai-hero-inner">
          <span className="ai-hero-kicker">Jobs · Admissions · Scholarships · Exams</span>
          <h1 className="ai-hero-title">
            Your Gateway to <span className="ai-hero-highlight">Government Opportunities</span>
          </h1>
          <p className="ai-hero-subtitle">
            Verified notifications for government jobs, entrance exams, admissions and
            scholarships across India — updated daily so you never miss a deadline.
          </p>
          <div className="ai-hero-trust">
            <span><FiCheckCircle aria-hidden="true" /> Verified sources</span>
            <span><FiCheckCircle aria-hidden="true" /> Updated daily</span>
            <span><FiCheckCircle aria-hidden="true" /> 100% free</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
